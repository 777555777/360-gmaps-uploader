/**
 * Google Photo Sphere (GPano) XMP Metadata Utilities
 *
 * This module provides functions for extracting, validating, and injecting
 * GPano XMP metadata in JPEG images. This metadata is required by the
 * Google Street View Publish API to recognize 360° panoramic photos.
 *
 * Reference: https://developers.google.com/streetview/spherical-metadata
 */

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
 * Extracts Google Photo Sphere (GPano) XMP metadata from a JPEG image.
 * These metadata fields are required by the Google Street View Publish API.
 *
 * Performance: Only reads the first 2 MB of the file, since XMP/EXIF metadata
 * is always stored in APP1 segments at the beginning of JPEGs (typically within
 * the first 100-200 KB). This avoids loading the entire image data into memory.
 *
 * @param file - The JPEG image file
 * @returns GPano metadata object or null if not found
 */
export async function extractGPanoMetadata(file: File): Promise<GPanoMetadata | null> {
	try {
		// Only read first 2 MB - XMP metadata is always at the start of JPEG files
		// This is 10-50x faster than reading the entire file (which can be 50+ MB)
		const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB
		const buffer = await file.slice(0, Math.min(CHUNK_SIZE, file.size)).arrayBuffer();
		const decoder = new TextDecoder('utf-8');
		const content = decoder.decode(buffer);

		// Search for XMP packet in the file
		const xmpStart = content.indexOf('<?xpacket begin');
		const xmpEnd = content.indexOf('<?xpacket end');

		if (xmpStart === -1 || xmpEnd === -1) {
			return null;
		}

		const xmpData = content.substring(xmpStart, xmpEnd + 50);

		// Extract GPano attributes using regex
		const gpanoRegex = /GPano:(\w+)="([^"]*)"/g;
		const matches = [...xmpData.matchAll(gpanoRegex)];

		if (matches.length === 0) {
			return null;
		}

		const gpano: GPanoMetadata = {};
		for (const match of matches) {
			const key = match[1] as keyof GPanoMetadata;
			gpano[key] = match[2];
		}

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
 * Reads JPEG width and height very quickly from the SOF segment.
 * Only uses the first 1 MB of the file.
 */
export async function getJpegSize(file: File): Promise<{ width: number; height: number }> {
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

/**
 * Injects GPano XMP metadata into a JPEG file.
 * Creates a new File object with the metadata embedded.
 *
 * JPEG Structure Primer:
 * - JPEGs are composed of "markers" (2-byte codes starting with 0xFF)
 * - 0xFFD8 = SOI (Start of Image) - first 2 bytes of every JPEG
 * - 0xFFE1 = APP1 marker - used for EXIF and XMP metadata
 * - Each segment has: [marker] [length 2 bytes] [data]
 *
 * This function inserts a new APP1 segment right after the SOI marker.
 * This is the standard way to add XMP metadata and preserves existing EXIF data.
 *
 * @param file - The original JPEG file
 * @param gpano - The GPano metadata to inject
 * @returns A new File object with the metadata embedded
 */
export async function injectGPanoMetadata(file: File, gpano: GPanoMetadata): Promise<File> {
	const buffer = await file.arrayBuffer();
	const view = new Uint8Array(buffer);

	// Verify JPEG signature: 0xFFD8 (Start of Image marker)
	if (view[0] !== 0xff || view[1] !== 0xd8) {
		throw new Error('Not a valid JPEG file');
	}

	// Generate XMP packet
	const xmpPacket = generateXMPPacket(gpano);
	const xmpBytes = new TextEncoder().encode(xmpPacket);

	// Create APP1 segment for XMP metadata
	// Standard structure: 0xFFE1 [length] [namespace] [XMP data]
	const xmpNamespace = 'http://ns.adobe.com/xap/1.0/\0';
	const namespaceBytes = new TextEncoder().encode(xmpNamespace);

	// Calculate segment length (includes length field itself, but not the marker)
	const segmentLength = 2 + namespaceBytes.length + xmpBytes.length;

	// Build the complete APP1 segment
	const app1Segment = new Uint8Array(2 + segmentLength);
	app1Segment[0] = 0xff; // Marker byte 1
	app1Segment[1] = 0xe1; // Marker byte 2: APP1 (used for XMP/EXIF)
	app1Segment[2] = (segmentLength >> 8) & 0xff; // Length high byte
	app1Segment[3] = segmentLength & 0xff; // Length low byte
	app1Segment.set(namespaceBytes, 4);
	app1Segment.set(xmpBytes, 4 + namespaceBytes.length);

	// Construct new JPEG: [SOI] [new APP1 with XMP] [rest of original file]
	const newBuffer = new Uint8Array(2 + app1Segment.length + (view.length - 2));
	newBuffer[0] = 0xff; // SOI marker byte 1
	newBuffer[1] = 0xd8; // SOI marker byte 2
	newBuffer.set(app1Segment, 2); // Insert our new APP1 segment
	newBuffer.set(view.subarray(2), 2 + app1Segment.length); // Copy rest of original

	// Create new File with same name and type
	return new File([newBuffer], file.name, { type: file.type, lastModified: Date.now() });
}

/**
 * Generates an XMP packet containing GPano metadata.
 * Follows the Adobe XMP specification and Google Photo Sphere format.
 */
function generateXMPPacket(gpano: GPanoMetadata): string {
	const gpanoFields = Object.entries(gpano)
		.filter(([, value]) => value !== undefined)
		.map(([key, value]) => `      GPano:${key}="${value}"`)
		.join('\n');

	return `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
      xmlns:GPano="http://ns.google.com/photos/1.0/panorama/"
${gpanoFields}>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}
