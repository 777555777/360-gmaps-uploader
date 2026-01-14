import exifr from 'exifr';
import {
	extractGPanoMetadata,
	generateDefaultGPanoMetadata,
	getJpegSize,
	validateGPanoMetadata,
	type GPanoMetadata
} from './gpano-helpers';

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
	warnings?: string[];
	// GPano Auto-Fix support
	canAutoFix?: boolean;
	missingGPanoFields?: string[];
	suggestedGPano?: GPanoMetadata;
	imageWidth?: number;
	imageHeight?: number;
}

// Re-export GPanoMetadata for convenience
export type { GPanoMetadata };

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
 * - JPEG format
 * - Max 75 MB file size
 * - Minimum resolution (3840x1920)
 * - Aspect ratio 2:1
 * - Google Photo Sphere XMP metadata (GPano namespace)
 *
 * Uses fast JPEG header parser (no decode!).
 */
export async function validateStreetViewImage(file: File): Promise<ValidationResult> {
	const errors: string[] = [];
	const warnings: string[] = [];

	const MAX_FILE_SIZE = 75 * 1024 * 1024; // 75 MB
	const MIN_WIDTH = 3840;
	const MIN_HEIGHT = 1920;

	// Image dimensions - needed for both dimension validation and GPano validation
	let imageWidth = 0;
	let imageHeight = 0;

	// GPano Auto-Fix support
	let canAutoFix = false;
	let missingGPanoFields: string[] = [];
	let suggestedGPano: GPanoMetadata | undefined;

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
		const dimensions = await getJpegSize(file);
		imageWidth = dimensions.width;
		imageHeight = dimensions.height;

		// Minimum resolution
		if (imageWidth < MIN_WIDTH || imageHeight < MIN_HEIGHT) {
			errors.push(
				`Resolution too low. At least ${MIN_WIDTH}x${MIN_HEIGHT} required (Current: ${imageWidth}x${imageHeight}).`
			);
		}

		// Aspect ratio 2:1
		const ratio = imageWidth / imageHeight;
		if (Math.abs(ratio - 2) > 0.01) {
			errors.push(`Aspect ratio must be 2:1 (Current: ${ratio.toFixed(2)}:1).`);
		}
	} catch (err) {
		console.log('err', err);
		errors.push('The JPEG image appears to be corrupted or invalid.');
	}

	// --- 4. Validate Google Photo Sphere XMP metadata ---
	// Only validate if we successfully read the dimensions and basic checks passed
	const hasBasicErrors = errors.length > 0;

	if (imageWidth > 0 && imageHeight > 0) {
		try {
			const gpano = await extractGPanoMetadata(file);
			const metadataValidation = validateGPanoMetadata(gpano, imageWidth, imageHeight);

			errors.push(...metadataValidation.errors);
			warnings.push(...metadataValidation.warnings);

			// Check if we can auto-fix (only if no other critical errors)
			if (
				!hasBasicErrors &&
				metadataValidation.canAutoFix &&
				metadataValidation.missingFields.length > 0
			) {
				canAutoFix = true;
				missingGPanoFields = metadataValidation.missingFields;
				suggestedGPano = generateDefaultGPanoMetadata(imageWidth, imageHeight);
			}

			// Add helpful hint if metadata is missing
			if (!metadataValidation.valid && gpano === null) {
				warnings.push(
					'Tip: Images edited in Photoshop or other software often lose these metadata fields.'
				);
			}
		} catch (err) {
			console.error('Error checking GPano metadata:', err);
			warnings.push('Could not validate Photo Sphere metadata.');
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
		canAutoFix,
		missingGPanoFields: missingGPanoFields.length > 0 ? missingGPanoFields : undefined,
		suggestedGPano,
		imageWidth: imageWidth > 0 ? imageWidth : undefined,
		imageHeight: imageHeight > 0 ? imageHeight : undefined
	};
}

// Re-export GPano functions for convenience
export { injectGPanoMetadata } from './gpano-helpers';
