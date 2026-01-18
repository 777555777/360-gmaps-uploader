/**
 * Google Photo Sphere (GPano) XMP Metadata Utilities
 *
 * This module provides functions for extracting, validating, and injecting
 * GPano XMP metadata in JPEG images. This metadata is required by the
 * Google Street View Publish API to recognize 360° panoramic photos.
 *
 * Reference: https://developers.google.com/streetview/spherical-metadata
 */

import exifr from 'exifr';

export interface GPanoMetadata {
	ProjectionType?: string;
	UsePanoramaViewer?: string;
	FullPanoWidthPixels?: string;
	FullPanoHeightPixels?: string;
	CroppedAreaImageWidthPixels?: string;
	CroppedAreaImageHeightPixels?: string;
	CroppedAreaLeftPixels?: string;
	CroppedAreaTopPixels?: string;
	// Optional fields
	InitialViewHeadingDegrees?: string;
	InitialViewPitchDegrees?: string;
	InitialViewRollDegrees?: string;
}

/**
 * ExifR options for performance-optimized metadata extraction.
 * Reads first 2MB with chunked reading for large 360° images (up to 75MB).
 * Supports extended XMP (multiSegment) for robust parsing.
 */
export const EXIFR_OPTIONS = {
	// Enable XMP and TIFF for GPano and dimensions
	tiff: true,
	xmp: true,
	gps: true,
	// Disable unneeded segments
	icc: false,
	iptc: false,
	jfif: false,
	ihdr: false,
	// Performance: chunked reading with 2MB first chunk
	chunked: true,
	firstChunkSize: 2 * 1024 * 1024, // 2 MB - metadata is always at start
	chunkSize: 256 * 1024, // 256 KB for subsequent chunks if needed
	chunkLimit: 10, // Allow more chunks for extended XMP support
	// Extended XMP support for large metadata blocks
	multiSegment: true,
	// Keep keys/values as-is for GPano string values
	translateKeys: true,
	translateValues: true,
	reviveValues: true,
	mergeOutput: true,
	silentErrors: true
} as const;

// GPano field names as they appear in ExifR output (without namespace prefix)
const GPANO_FIELDS = [
	'ProjectionType',
	'UsePanoramaViewer',
	'FullPanoWidthPixels',
	'FullPanoHeightPixels',
	'CroppedAreaImageWidthPixels',
	'CroppedAreaImageHeightPixels',
	'CroppedAreaLeftPixels',
	'CroppedAreaTopPixels',
	'InitialViewHeadingDegrees',
	'InitialViewPitchDegrees',
	'InitialViewRollDegrees'
] as const;

/**
 * Extracts Google Photo Sphere (GPano) XMP metadata from a JPEG image using ExifR.
 * These metadata fields are required by the Google Street View Publish API.
 *
 * Performance: Uses ExifR's chunked reading with 2MB first chunk size.
 * This is 10-50x faster than reading the entire file (which can be 50+ MB).
 * Also supports extended XMP for robust parsing of large metadata blocks.
 *
 * @param file - The JPEG image file
 * @returns GPano metadata object or null if not found
 */
export async function extractGPanoMetadata(file: File): Promise<GPanoMetadata | null> {
	try {
		const exifData = await exifr.parse(file, EXIFR_OPTIONS);

		if (!exifData) {
			return null;
		}

		// Extract GPano fields from ExifR output
		// ExifR parses XMP and flattens namespace prefixes, so GPano:ProjectionType becomes ProjectionType
		const gpano: GPanoMetadata = {};

		for (const field of GPANO_FIELDS) {
			const value = exifData[field];
			if (value !== undefined && value !== null) {
				// Convert to string as GPanoMetadata expects string values
				gpano[field as keyof GPanoMetadata] = String(value);
			}
		}

		// Return null if no GPano data was found
		if (Object.keys(gpano).length === 0) {
			return null;
		}

		console.info('found the following gpano metadata for file', file.name, gpano);
		return gpano;
	} catch (error) {
		console.error('Failed to extract GPano metadata:', error);
		return null;
	}
}

/**
 * Validates that all required Google Photo Sphere XMP metadata is present.
 * The Street View API requires these fields to recognize an image as a 360° photo.
 *
 * Reference: https://developers.google.com/streetview/spherical-metadata
 *
 * @param gpano - GPano metadata extracted from the image
 * @param imageWidth - Actual image width in pixels
 * @param imageHeight - Actual image height in pixels
 * @returns Validation result with detailed error messages and missing fields for auto-fix
 */
export function validateGPanoMetadata(
	gpano: GPanoMetadata | null,
	imageWidth: number,
	imageHeight: number
): {
	valid: boolean;
	errors: string[];
	warnings: string[];
	missingFields: string[];
	canAutoFix: boolean;
} {
	const errors: string[] = [];
	const warnings: string[] = [];
	const missingFields: string[] = [];

	// Required fields for Street View API
	const requiredFields: (keyof GPanoMetadata)[] = [
		'ProjectionType',
		'UsePanoramaViewer',
		'FullPanoWidthPixels',
		'FullPanoHeightPixels',
		'CroppedAreaImageWidthPixels',
		'CroppedAreaImageHeightPixels',
		'CroppedAreaLeftPixels',
		'CroppedAreaTopPixels'
	];

	if (!gpano) {
		// All fields are missing - but this is auto-fixable
		missingFields.push(...requiredFields.map((f) => `GPano:${f}`));
		errors.push(
			'Missing Google Photo Sphere (GPano) XMP metadata. ' +
				'The Street View API requires specific XMP fields to recognize this as a 360° photo.'
		);
		return { valid: false, errors, warnings, missingFields, canAutoFix: true };
	}

	// Check which required fields are missing
	for (const field of requiredFields) {
		if (!gpano[field]) {
			missingFields.push(`GPano:${field}`);
		}
	}

	if (missingFields.length > 0) {
		errors.push(
			`Missing required GPano XMP fields: ${missingFields.join(', ')}. ` +
				'These are required by the Google Street View API.'
		);
	}

	// Validate ProjectionType - if wrong type, cannot auto-fix
	if (gpano.ProjectionType && gpano.ProjectionType !== 'equirectangular') {
		errors.push(
			`GPano:ProjectionType must be "equirectangular" (found: "${gpano.ProjectionType}").`
		);
		// Wrong projection type is NOT auto-fixable - the image itself might not be equirectangular
		return { valid: false, errors, warnings, missingFields, canAutoFix: false };
	}

	// Validate UsePanoramaViewer
	if (gpano.UsePanoramaViewer && gpano.UsePanoramaViewer !== 'True') {
		warnings.push(
			`GPano:UsePanoramaViewer should be "True" (found: "${gpano.UsePanoramaViewer}").`
		);
	}

	// Validate image dimensions match metadata - mismatch is NOT auto-fixable
	if (gpano.FullPanoWidthPixels && parseInt(gpano.FullPanoWidthPixels) !== imageWidth) {
		errors.push(
			`GPano:FullPanoWidthPixels (${gpano.FullPanoWidthPixels}) doesn't match actual image width (${imageWidth}).`
		);
		return { valid: false, errors, warnings, missingFields, canAutoFix: false };
	}

	if (gpano.FullPanoHeightPixels && parseInt(gpano.FullPanoHeightPixels) !== imageHeight) {
		errors.push(
			`GPano:FullPanoHeightPixels (${gpano.FullPanoHeightPixels}) doesn't match actual image height (${imageHeight}).`
		);
		return { valid: false, errors, warnings, missingFields, canAutoFix: false };
	}

	// Can auto-fix if only missing fields (no wrong values)
	const canAutoFix = missingFields.length > 0 && errors.length <= 1; // Only the "missing fields" error

	return { valid: errors.length === 0, errors, warnings, missingFields, canAutoFix };
}

/**
 * Generates default GPano metadata for a full equirectangular panorama.
 * Uses image dimensions and standard default values.
 */
export function generateDefaultGPanoMetadata(width: number, height: number): GPanoMetadata {
	return {
		ProjectionType: 'equirectangular',
		UsePanoramaViewer: 'True',
		FullPanoWidthPixels: String(width),
		FullPanoHeightPixels: String(height),
		CroppedAreaImageWidthPixels: String(width),
		CroppedAreaImageHeightPixels: String(height),
		CroppedAreaLeftPixels: '0',
		CroppedAreaTopPixels: '0',
		InitialViewHeadingDegrees: '0',
		InitialViewPitchDegrees: '0',
		InitialViewRollDegrees: '0'
	};
}

/**
 * Extracts image dimensions using ExifR with fallback chain.
 * Uses multiple EXIF and XMP fields for maximum compatibility across different cameras and editors.
 *
 * Fallback order:
 * 1. Standard EXIF fields (ImageWidth/Height, ExifImageWidth/Height, PixelXDimension/YDimension)
 * 2. GPano XMP fields (CroppedAreaImageWidthPixels/HeightPixels - the actual image dimensions)
 * 3. GPano XMP fields (FullPanoWidthPixels/HeightPixels - for full 360° panos these equal image size)
 *
 * Note: Panorama software like PTGui and editors like Photoshop/Lightroom often strip
 * standard EXIF dimension tags but preserve GPano XMP metadata.
 *
 * Performance: Uses ExifR's chunked reading - no need to load the entire file.
 *
 * @param file - The JPEG image file
 * @returns Image dimensions { width, height }
 * @throws Error if dimensions cannot be determined
 */
export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
	const exifData = await exifr.parse(file, EXIFR_OPTIONS);

	if (!exifData) {
		throw new Error('Could not read image metadata - file may be corrupted.');
	}

	// Use fallback chain for dimensions - different cameras/editors use different fields
	// 1. Standard EXIF fields
	// 2. GPano CroppedArea fields (actual image dimensions for 360° photos)
	// 3. GPano FullPano fields (for full equirectangular panos, these equal image size)
	const width =
		exifData.ImageWidth ??
		exifData.ExifImageWidth ??
		exifData.PixelXDimension ??
		exifData.SourceImageWidth ??
		parseNumberField(exifData.CroppedAreaImageWidthPixels) ??
		parseNumberField(exifData.FullPanoWidthPixels);

	const height =
		exifData.ImageHeight ??
		exifData.ExifImageHeight ??
		exifData.PixelYDimension ??
		exifData.SourceImageHeight ??
		parseNumberField(exifData.CroppedAreaImageHeightPixels) ??
		parseNumberField(exifData.FullPanoHeightPixels);

	if (typeof width !== 'number' || typeof height !== 'number' || width <= 0 || height <= 0) {
		throw new Error('Could not determine image dimensions from EXIF data.');
	}

	return { width, height };
}

/**
 * Helper to parse a field that might be a string or number into a number.
 * GPano fields are sometimes strings like "14030" instead of numbers.
 */
function parseNumberField(value: unknown): number | undefined {
	if (typeof value === 'number' && value > 0) {
		return value;
	}
	if (typeof value === 'string') {
		const parsed = parseInt(value, 10);
		if (!isNaN(parsed) && parsed > 0) {
			return parsed;
		}
	}
	return undefined;
}

/**
 * Finds the XMP APP1 segment in a JPEG buffer.
 * Returns the start offset and length if found.
 * This is still needed for XMP injection (ExifR is read-only).
 */
function findXmpSegment(view: Uint8Array): { offset: number; length: number } | null {
	const XMP_NAMESPACE = 'http://ns.adobe.com/xap/1.0/';
	let offset = 2; // Skip SOI marker

	while (offset < view.length - 4) {
		if (view[offset] !== 0xff) {
			offset++;
			continue;
		}

		const marker = view[offset + 1];

		// Stop at SOS (Start of Scan) or EOI (End of Image)
		if (marker === 0xda || marker === 0xd9) break;

		// APP1 marker (0xE1)
		if (marker === 0xe1) {
			const segmentLength = (view[offset + 2] << 8) | view[offset + 3];
			const segmentData = view.slice(offset + 4, offset + 4 + Math.min(50, segmentLength));
			const decoder = new TextDecoder('utf-8', { fatal: false });
			const segmentStr = decoder.decode(segmentData);

			// Check if this APP1 contains XMP (starts with XMP namespace)
			if (segmentStr.startsWith(XMP_NAMESPACE)) {
				return {
					offset: offset,
					length: 2 + segmentLength // marker (2) + length (2) + data
				};
			}
		}

		// Skip to next segment
		if (marker >= 0xe0 && marker <= 0xef) {
			const segmentLength = (view[offset + 2] << 8) | view[offset + 3];
			offset += 2 + segmentLength;
		} else {
			offset++;
		}
	}

	return null;
}

/**
 * Injects GPano XMP metadata into a JPEG file.
 * Creates a new File object with the metadata embedded.
 *
 * IMPORTANT: Google Street View API requires CLEAN XMP with ONLY GPano namespace.
 * Mixed namespaces (dc, photoshop, xmpMM, etc.) cause "not a 360 photo" errors.
 * This function REPLACES any existing XMP with a clean GPano-only XMP.
 *
 * JPEG Structure:
 * - 0xFFD8 = SOI (Start of Image)
 * - 0xFFE1 = APP1 marker (EXIF/XMP metadata)
 * - Each segment: [marker 2 bytes] [length 2 bytes] [data]
 *
 * @param file - The original JPEG file
 * @param gpano - The GPano metadata to inject
 * @returns A new File object with clean GPano-only XMP
 */
export async function injectGPanoMetadata(file: File, gpano: GPanoMetadata): Promise<File> {
	const buffer = await file.arrayBuffer();
	const view = new Uint8Array(buffer);

	// Verify JPEG signature: 0xFFD8 (Start of Image marker)
	if (view[0] !== 0xff || view[1] !== 0xd8) {
		throw new Error('Not a valid JPEG file');
	}

	const XMP_NAMESPACE = 'http://ns.adobe.com/xap/1.0/\0';
	const namespaceBytes = new TextEncoder().encode(XMP_NAMESPACE);

	// Generate clean GPano-only XMP
	const xmpPacket = generateXMPPacket(gpano);
	const xmpBytes = new TextEncoder().encode(xmpPacket);

	// Build new APP1 segment
	const segmentLength = 2 + namespaceBytes.length + xmpBytes.length;
	const newApp1 = new Uint8Array(2 + segmentLength);
	newApp1[0] = 0xff;
	newApp1[1] = 0xe1;
	newApp1[2] = (segmentLength >> 8) & 0xff;
	newApp1[3] = segmentLength & 0xff;
	newApp1.set(namespaceBytes, 4);
	newApp1.set(xmpBytes, 4 + namespaceBytes.length);

	// Check for existing XMP segment
	const existingXmp = findXmpSegment(view);
	let newBuffer: Uint8Array;

	if (existingXmp) {
		// REPLACE existing XMP with clean GPano-only XMP
		const beforeXmp = view.slice(0, existingXmp.offset);
		const afterXmp = view.slice(existingXmp.offset + existingXmp.length);

		newBuffer = new Uint8Array(beforeXmp.length + newApp1.length + afterXmp.length);
		newBuffer.set(beforeXmp, 0);
		newBuffer.set(newApp1, beforeXmp.length);
		newBuffer.set(afterXmp, beforeXmp.length + newApp1.length);
	} else {
		// No existing XMP - insert after SOI
		newBuffer = new Uint8Array(2 + newApp1.length + (view.length - 2));
		newBuffer[0] = 0xff;
		newBuffer[1] = 0xd8;
		newBuffer.set(newApp1, 2);
		newBuffer.set(view.subarray(2), 2 + newApp1.length);
	}

	return new File([newBuffer.buffer as ArrayBuffer], file.name, {
		type: file.type,
		lastModified: Date.now()
	});
}

/**
 * Generates a CLEAN XMP packet containing ONLY GPano metadata.
 * Google Street View API requires XMP without other namespaces.
 */
function generateXMPPacket(gpano: GPanoMetadata): string {
	const gpanoAttrs = Object.entries(gpano)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => `      GPano:${key}="${value}"`)
		.join('\n');

	return `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="XMP Core 6.0.0">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:GPano="http://ns.google.com/photos/1.0/panorama/"
${gpanoAttrs}/>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}
