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
	make?: string; // Kamera-Hersteller
	model?: string; // Kamera-Modell
}

export interface ValidationResult {
	isValid: boolean;
	errors: string[];
}

/**
 * Formatiert eine Dateigröße in Bytes zu einer menschenlesbaren Zeichenkette
 * @param bytes - Die Dateigröße in Bytes
 * @param decimals - Anzahl der Dezimalstellen (Standard: 2)
 * @returns Formatierte Dateigröße (z.B. "1.5 MB")
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
 * Extrahiert GPS-Koordinaten aus einem Bild
 * @param file - Die Bilddatei
 * @returns GPS-Koordinaten oder undefined, wenn keine vorhanden sind
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
		console.warn('Fehler beim Extrahieren der GPS-Daten:', error);
		return undefined;
	}
}

/**
 * Extrahiert alle verfügbaren Metadaten aus einem Bild
 * @param file - Die Bilddatei
 * @returns Vollständige Metadaten des Bildes
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
		console.warn('Fehler beim Extrahieren der Metadaten:', error);
	}

	return metadata;
}

/**
 * Prüft, ob ein Bild GPS-Koordinaten enthält
 * @param file - Die Bilddatei
 * @returns true, wenn GPS-Daten vorhanden sind
 */
export async function hasGeoLocation(file: File): Promise<boolean> {
	const geoLocation = await extractGeoLocation(file);
	return geoLocation !== undefined;
}

/**
 * Batch-Verarbeitung: Extrahiert Metadaten von mehreren Bildern
 * @param files - Array oder FileList von Bilddateien
 * @returns Array mit allen Metadaten
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
 * Validiert ein 360°-Bild für die Street View API.
 * Anforderungen:
 * JPEG
 * max. 75 MB
 * Mindestauflösung (3840x1920)
 * Seitenverhältnis 2:1
 *
 * Nutzt schnellen JPEG-Header-Parser (kein decode!).
 */
export async function validateStreetViewImage(file: File): Promise<ValidationResult> {
	const errors: string[] = [];

	const MAX_FILE_SIZE = 75 * 1024 * 1024; // 75 MB
	const MIN_WIDTH = 3840;
	const MIN_HEIGHT = 1920;

	// --- 1. MIME-Typ prüfen ---
	if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
		errors.push('Datei muss ein JPEG-Bild sein.');
	}

	// --- 2. Dateigröße prüfen ---
	if (file.size > MAX_FILE_SIZE) {
		errors.push(`Dateigröße überschreitet das Limit von 75 MB.`);
	}

	// --- 3. JPEG-Dimensionen schnell aus Header auslesen ---
	try {
		const { width, height } = await getJpegSize(file);

		// Mindestauflösung
		if (width < MIN_WIDTH || height < MIN_HEIGHT) {
			errors.push(
				`Auflösung zu niedrig. Mindestens ${MIN_WIDTH}×${MIN_HEIGHT} erforderlich (Aktuell: ${width}×${height}).`
			);
		}

		// Seitenverhältnis 2:1
		const ratio = width / height;
		if (Math.abs(ratio - 2) > 0.01) {
			errors.push(`Seitenverhältnis muss 2:1 sein (Aktuell: ${ratio.toFixed(2)}:1).`);
		}
	} catch (err) {
		console.log('err', err);
		errors.push('Konnte JPEG-Dimensionen nicht lesen. Ist die Datei beschädigt?');
	}

	return {
		isValid: errors.length === 0,
		errors
	};
}

/**
 * Liest JPEG-Breite und -Höhe sehr schnell aus dem SOF-Segment.
 * Nutzt nur die ersten 1 MB der Datei.
 */
async function getJpegSize(file: File): Promise<{ width: number; height: number }> {
	const CHUNK_SIZE = 1 * 1024 * 1024; // 1 MB reichen locker
	const buffer = await file.slice(0, CHUNK_SIZE).arrayBuffer();
	const view = new DataView(buffer);

	let offset = 2; // JPEG beginnt mit 0xFFD8

	while (offset < view.byteLength) {
		if (view.getUint8(offset) !== 0xff) {
			throw new Error('Ungültiges JPEG (fehlender Marker).');
		}

		const marker = view.getUint8(offset + 1);
		offset += 2;

		// SOF0, SOF2 enthalten Breite/Höhe
		if (marker >= 0xc0 && marker <= 0xc3) {
			offset += 3; // Segmentlänge + Präzision überspringen
			const height = view.getUint16(offset);
			offset += 2;
			const width = view.getUint16(offset);
			return { width, height };
		}

		// Andere Segmente überspringen
		const length = view.getUint16(offset);
		offset += length;
	}

	throw new Error('SOF-Marker nicht gefunden (kein gültiges JPEG?).');
}
