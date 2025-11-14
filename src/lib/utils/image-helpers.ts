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
	const test123 = await exifr.thumbnail(file);
	console.log('Thumbnail URL:', test123);
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
	console.log('geoLocation', geoLocation);
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
