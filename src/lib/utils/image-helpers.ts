import exifr from 'exifr';

export interface GeoCoordinates {
	latitude: number;
	longitude: number;
}

export interface ImageMetadata {
	fileName: string;
	fileSize: number;
	fileSizeFormatted: string;
	geoLocation?: GeoCoordinates;
	dateTime?: Date;
	make?: string; // Camera manufacturer
	model?: string; // Camera model
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes - The file size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted file size (e.g. "1.5 MB")
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Extracts GPS coordinates from an image
 * @param file - The image file
 * @returns GPS coordinates or undefined if none exist
 */
export async function extractGeoLocation(file: File): Promise<GeoCoordinates | undefined> {
	try {
		const exifData = await exifr.gps(file);

		if (
			!exifData ||
			typeof exifData.latitude !== 'number' ||
			typeof exifData.longitude !== 'number'
		) {
			return undefined;
		}

		return {
			latitude: exifData.latitude,
			longitude: exifData.longitude
		};
	} catch (error) {
		console.warn('Error extracting GPS data:', error);
		return undefined;
	}
}

/**
 * Extracts all available metadata from an image
 * @param file - The image file
 * @returns Complete metadata of the image
 */
export async function extractImageMetadata(file: File): Promise<ImageMetadata> {
	const metadata: ImageMetadata = {
		fileName: file.name,
		fileSize: file.size,
		fileSizeFormatted: formatFileSize(file.size)
	};

	try {
		// Extrahiere EXIF-Daten
		const exifData = await exifr.parse(file, {
			gps: true,
			xmp: true,
			icc: false,
			jfif: false,
			ihdr: false
		});

		if (exifData) {
			// GPS-Daten
			if (exifData.latitude && exifData.longitude) {
				metadata.geoLocation = {
					latitude: exifData.latitude,
					longitude: exifData.longitude
				};
			}

			// Datum/Uhrzeit
			if (exifData.DateTimeOriginal || exifData.DateTime || exifData.CreateDate) {
				metadata.dateTime = new Date(
					exifData.DateTimeOriginal || exifData.DateTime || exifData.CreateDate
				);
			}

			// Kamera-Informationen
			if (exifData.Make) {
				metadata.make = exifData.Make;
			}
			if (exifData.Model) {
				metadata.model = exifData.Model;
			}
		}
	} catch (error) {
		console.warn('Error extracting metadata:', error);
	}

	return metadata;
}

/**
 * Checks if an image contains GPS coordinates
 * @param file - The image file
 * @returns true if GPS data is present
 */
export async function hasGeoLocation(file: File): Promise<boolean> {
	const geoLocation = await extractGeoLocation(file);
	return geoLocation !== undefined;
}

/**
 * Batch processing: Extracts metadata from multiple images
 * @param files - Array or FileList of image files
 * @returns Array with all metadata
 */
export async function extractBatchMetadata(files: File[] | FileList): Promise<ImageMetadata[]> {
	const fileArray = Array.from(files);
	const metadataPromises = fileArray.map((file) => extractImageMetadata(file));
	return Promise.all(metadataPromises);
}

export async function getThumbnail(file: File, useWorker: boolean = true): Promise<string> {
	// Generiere Thumbnail mit Worker Pool (beste Qualität & Performance)
	if (useWorker && typeof Worker !== 'undefined') {
		const { getThumbnailWorkerPool } = await import('../workers/thumbnail-pool');
		const pool = getThumbnailWorkerPool();
		return await pool.generateThumbnail(file, 512);
	} else {
		// Fallback: Main Thread (für alte Browser ohne Worker-Support)
		return await createThumbnailMainThread(file, 512);
	}
}

/**
 * Fallback: Thumbnail-Generierung im Main Thread
 * @internal
 */
async function createThumbnailMainThread(file: File, maxSize = 512): Promise<string> {
	const bitmap = await createImageBitmap(file);
	const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height);

	const w = Math.floor(bitmap.width * scale);
	const h = Math.floor(bitmap.height * scale);

	const canvas = document.createElement('canvas');
	canvas.width = w;
	canvas.height = h;

	canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);

	bitmap.close();

	// Base64 JPEG thumbnail
	return canvas.toDataURL('image/jpeg', 0.8);
}

// =========================================
// 360°- Image Validation
// =========================================

/**
 * Validates a 360° image for the Street View API.
 * Requirements:
 * JPEG
 * max. 75 MB
 * Minimum resolution (3840x1920)
 * Aspect ratio 2:1
 *
 * Uses fast JPEG header parser (no decode!).
 */
export async function validateStreetViewImage(file: File): Promise<ValidationResult> {
	const errors: string[] = [];

	const MAX_FILE_SIZE = 75 * 1024 * 1024; // 75 MB
	const MIN_WIDTH = 3840;
	const MIN_HEIGHT = 1920;

	// --- 1. Check MIME type ---
	if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
		errors.push('File must be a JPEG image.');
	}

	// --- 2. Check file size ---
	if (file.size > MAX_FILE_SIZE) {
		errors.push(`File size exceeds the limit of 75 MB.`);
	}

	// --- 3. Read JPEG dimensions quickly from header ---
	try {
		const { width, height } = await getJpegSize(file);

		// Minimum resolution
		if (width < MIN_WIDTH || height < MIN_HEIGHT) {
			errors.push(
				`Resolution too low. At least ${MIN_WIDTH}×${MIN_HEIGHT} required (Current: ${width}×${height}).`
			);
		}

		// Aspect ratio 2:1
		const ratio = width / height;
		if (Math.abs(ratio - 2) > 0.01) {
			errors.push(`Aspect ratio must be 2:1 (Current: ${ratio.toFixed(2)}:1).`);
		}
	} catch (err) {
		console.log('err', err);
		errors.push('Could not read JPEG dimensions. Is the file corrupted?');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Reads JPEG width and height very quickly from the SOF segment.
 * Only uses the first 1 MB of the file.
 */
async function getJpegSize(file: File): Promise<{ width: number; height: number }> {
	const CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB reichen locker
	const buffer = await file.slice(0, CHUNK_SIZE).arrayBuffer();
	const view = new DataView(buffer);

	let offset = 2; // JPEG starts with 0xFFD8

	while (offset < view.byteLength) {
		if (view.getUint8(offset) !== 0xff) {
			throw new Error('Invalid JPEG (missing marker).');
		}

		const marker = view.getUint8(offset + 1);
		offset += 2;

		// SOF0, SOF2 contain width/height
		if (marker >= 0xc0 && marker <= 0xc3) {
			offset += 3; // Skip segment length + precision
			const height = view.getUint16(offset);
			offset += 2;
			const width = view.getUint16(offset);
			return { width, height };
		}

		// Skip other segments
		const length = view.getUint16(offset);
		offset += length;
	}

	throw new Error('SOF marker not found (not a valid JPEG?).');
}
