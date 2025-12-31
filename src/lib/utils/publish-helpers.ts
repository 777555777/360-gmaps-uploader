import type { ImageMetadata } from './image-helpers';

/**
 * Photo metadata structure for Street View Publish API
 * Based on: https://streetviewpublish.googleapis.com/v1/photo
 */
export interface StreetViewPhotoMetadata {
	uploadReference: {
		uploadUrl: string;
	};
	pose: {
		heading: number;
		latLngPair: {
			latitude: number;
			longitude: number;
		};
	};
	captureTime: {
		seconds: number;
	};
}

/**
 * Simplified structure for displaying in UI
 * (before upload URL is generated)
 */
export interface PublishPreview {
	fileName: string;
	latitude: number;
	longitude: number;
	heading: number;
	captureTime: number;
}

/**
 * Converts a Date to Unix timestamp in seconds
 * @param date - The date to convert
 * @returns Unix timestamp in seconds
 */
export function dateToUnixSeconds(date: Date): number {
	return Math.floor(date.getTime() / 1000);
}

/**
 * Prepares metadata for a single image for the Street View Publish API.
 * Note: uploadUrl must be filled in after calling photo:startUpload endpoint.
 *
 * @param file - The image file
 * @param metadata - The extracted image metadata
 * @param uploadUrl - The upload URL from photo:startUpload (optional, can be added later)
 * @param heading - Optional custom heading in degrees (0-360), defaults to 0
 * @returns Ready-to-publish metadata object
 */
export function preparePhotoMetadata(
	file: File,
	metadata: ImageMetadata,
	uploadUrl?: string,
	heading: number = 0
): StreetViewPhotoMetadata | null {
	// Geolocation is required
	if (!metadata.geoLocation) {
		console.warn(`Cannot publish ${file.name}: Missing geolocation data`);
		return null;
	}

	// Use dateTime from metadata, or fallback to current time
	const captureTime = metadata.dateTime || new Date();

	return {
		uploadReference: {
			uploadUrl: uploadUrl || 'UPLOAD_URL_PLACEHOLDER'
		},
		pose: {
			heading: heading,
			latLngPair: {
				latitude: metadata.geoLocation.latitude,
				longitude: metadata.geoLocation.longitude
			}
		},
		captureTime: {
			seconds: dateToUnixSeconds(captureTime)
		}
	};
}

/**
 * Prepares a preview object for displaying in the publish dialog (without uploadUrl)
 *
 * @param file - The image file
 * @param metadata - The extracted image metadata
 * @param heading - Optional custom heading in degrees (0-360), defaults to 0
 * @returns Preview object or null if geolocation is missing
 */
export function preparePublishPreview(
	file: File,
	metadata: ImageMetadata,
	heading: number = 0
): PublishPreview | null {
	if (!metadata.geoLocation) {
		return null;
	}

	const captureTime = metadata.dateTime || new Date();

	return {
		fileName: file.name,
		latitude: metadata.geoLocation.latitude,
		longitude: metadata.geoLocation.longitude,
		heading: heading,
		captureTime: dateToUnixSeconds(captureTime)
	};
}

/**
 * Batch processing: Prepares metadata for multiple images
 *
 * @param files - Array of File objects
 * @param metadataMap - Map containing metadata for each file
 * @param headingMap - Optional map with custom headings per file
 * @returns Array of prepared metadata objects (skips files without geolocation)
 */
export function prepareBatchMetadata(
	files: File[],
	metadataMap: Map<File, ImageMetadata>,
	headingMap?: Map<File, number>
): StreetViewPhotoMetadata[] {
	const results: StreetViewPhotoMetadata[] = [];

	for (const file of files) {
		const metadata = metadataMap.get(file);
		if (!metadata) {
			console.warn(`No metadata found for ${file.name}`);
			continue;
		}

		const heading = headingMap?.get(file) ?? 0;
		const prepared = preparePhotoMetadata(file, metadata, undefined, heading);

		if (prepared) {
			results.push(prepared);
		}
	}

	return results;
}

/**
 * Batch processing: Prepares preview data for multiple images
 *
 * @param files - Array of File objects
 * @param metadataMap - Map containing metadata for each file
 * @param headingMap - Optional map with custom headings per file
 * @returns Array of preview objects (skips files without geolocation)
 */
export function prepareBatchPreviews(
	files: File[],
	metadataMap: Map<File, ImageMetadata>,
	headingMap?: Map<File, number>
): PublishPreview[] {
	const results: PublishPreview[] = [];

	for (const file of files) {
		const metadata = metadataMap.get(file);
		if (!metadata) {
			console.warn(`No metadata found for ${file.name}`);
			continue;
		}

		const heading = headingMap?.get(file) ?? 0;
		const preview = preparePublishPreview(file, metadata, heading);

		if (preview) {
			results.push(preview);
		}
	}

	return results;
}

/**
 * Formats preview data as JSON string for display in UI
 *
 * @param previews - Array of preview objects
 * @param pretty - Whether to format with indentation (default: true)
 * @returns JSON string
 */
export function formatPreviewsAsJson(previews: PublishPreview[], pretty: boolean = true): string {
	if (pretty) {
		return JSON.stringify(previews, null, 2);
	}
	return JSON.stringify(previews);
}

/**
 * Validates if a file is ready for publishing
 *
 * @param file - The image file
 * @param metadata - The extracted image metadata
 * @returns Object with validation result and optional error message
 */
export function validateForPublish(
	file: File,
	metadata: ImageMetadata
): { isValid: boolean; error?: string } {
	if (!metadata.geoLocation) {
		return {
			isValid: false,
			error: 'Missing geolocation data'
		};
	}

	const { latitude, longitude } = metadata.geoLocation;

	// Basic coordinate validation
	if (latitude < -90 || latitude > 90) {
		return {
			isValid: false,
			error: `Invalid latitude: ${latitude}`
		};
	}

	if (longitude < -180 || longitude > 180) {
		return {
			isValid: false,
			error: `Invalid longitude: ${longitude}`
		};
	}

	return { isValid: true };
}
