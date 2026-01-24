/**
 * Street View Publish API - Upload & Publish Functions
 *
 * API Docs: https://developers.google.com/streetview/publish/reference/rest
 *
 * Upload Flow:
 * 1. startUpload() - Get a temporary upload URL
 * 2. uploadPhotoBytes() - Upload the actual image data
 * 3. publishPhoto() - Publish with metadata (makes it LIVE!)
 *
 * For testing: Use dryRun mode which skips step 3
 */

const API_BASE = 'https://streetviewpublish.googleapis.com/v1';

// ============================================================================
// Types
// ============================================================================

export interface UploadUrlResponse {
	uploadUrl: string;
}

export interface PhotoPose {
	heading: number;
	latLngPair: {
		latitude: number;
		longitude: number;
	};
}

export interface PublishPhotoRequest {
	uploadReference: {
		uploadUrl: string;
	};
	pose: PhotoPose;
	captureTime: {
		seconds: number;
	};
}

export interface PublishedPhoto {
	photoId: {
		id: string;
	};
	uploadReference: {
		uploadUrl: string;
	};
	downloadUrl?: string;
	thumbnailUrl?: string;
	shareLink?: string;
	pose?: PhotoPose;
	captureTime?: {
		seconds: string;
	};
	uploadTime?: string;
	places?: Array<{
		placeId: string;
		name: string;
	}>;
	mapsPublishStatus?: string;
	transferStatus?: string;
}

export interface UploadProgress {
	step: 'Idle' | 'Start Upload' | 'Upload Bytes' | 'Publish' | 'Done' | 'Error';
	message: string;
	photoId?: string;
	uploadUrl?: string;
	error?: string;
}

export interface UploadResult {
	success: boolean;
	photoId?: string;
	uploadUrl?: string;
	error?: string;
	dryRun: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Step 1: Request an upload URL from Google
 * This URL is temporary and expires after ~1 day
 */
export async function startUpload(accessToken: string): Promise<UploadUrlResponse> {
	const response = await fetch(`${API_BASE}/photo:startUpload`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Length': '0'
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`startUpload failed (${response.status}): ${errorText}`);
	}

	return response.json();
}

/**
 * Step 2: Upload the photo bytes to the upload URL
 * The photo must be a valid 360° image with XMP metadata
 */
export async function uploadPhotoBytes(
	accessToken: string,
	uploadUrl: string,
	photoFile: File
): Promise<void> {
	const response = await fetch(uploadUrl, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'image/jpeg'
		},
		body: photoFile
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`uploadPhotoBytes failed (${response.status}): ${errorText}`);
	}
}

/**
 * Step 3: Publish the photo with metadata
 * ⚠️ WARNING: This makes the photo LIVE on Google Maps!
 */
export async function publishPhoto(
	accessToken: string,
	metadata: PublishPhotoRequest
): Promise<PublishedPhoto> {
	const response = await fetch(`${API_BASE}/photo`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(metadata)
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`publishPhoto failed (${response.status}): ${errorText}`);
	}

	return response.json();
}

/**
 * Delete a published photo
 * Use this to remove test uploads
 */
export async function deletePhoto(accessToken: string, photoId: string): Promise<void> {
	const response = await fetch(`${API_BASE}/photo/${photoId}`, {
		method: 'DELETE',
		headers: {
			Authorization: `Bearer ${accessToken}`
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`deletePhoto failed (${response.status}): ${errorText}`);
	}
}

/**
 * List all photos uploaded by the user
 */
export async function listPhotos(accessToken: string): Promise<{ photos: PublishedPhoto[] }> {
	const response = await fetch(`${API_BASE}/photos`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`listPhotos failed (${response.status}): ${errorText}`);
	}

	return response.json();
}

/**
 * Get a single photo by ID
 */
export async function getPhoto(accessToken: string, photoId: string): Promise<PublishedPhoto> {
	const response = await fetch(`${API_BASE}/photo/${photoId}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`,
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`getPhoto failed (${response.status}): ${errorText}`);
	}

	return response.json();
}

// ============================================================================
// Combined Upload Workflow
// ============================================================================

export interface UploadOptions {
	accessToken: string;
	file: File;
	latitude: number;
	longitude: number;
	heading: number;
	captureTimeSeconds: number;
	dryRun?: boolean;
	onProgress?: (progress: UploadProgress) => void;
}

/**
 * Complete upload workflow for a single photo
 *
 * @param options - Upload configuration
 * @param options.dryRun - If true, skips the final publish step (safe for testing!)
 * @returns Upload result with photoId (if published) or uploadUrl (if dryRun)
 */
export async function uploadPhoto(options: UploadOptions): Promise<UploadResult> {
	const {
		accessToken,
		file,
		latitude,
		longitude,
		heading,
		captureTimeSeconds,
		dryRun = true,
		onProgress
	} = options;

	const progress = (
		step: UploadProgress['step'],
		message: string,
		extra?: Partial<UploadProgress>
	) => {
		onProgress?.({ step, message, ...extra });
	};

	try {
		// Step 1: Get upload URL
		progress('Start Upload', 'Requesting upload URL...');
		const { uploadUrl } = await startUpload(accessToken);
		progress('Start Upload', 'Upload URL received');

		// Step 2: Upload photo bytes
		progress('Upload Bytes', `Uploading ${file.name}...`);
		await uploadPhotoBytes(accessToken, uploadUrl, file);
		progress('Upload Bytes', 'Photo bytes uploaded');

		// Step 3: Publish (or skip in dry-run mode)
		if (dryRun) {
			progress('Done', 'Dry-run complete! Photo NOT published.', { uploadUrl });
			return {
				success: true,
				uploadUrl,
				dryRun: true
			};
		}

		progress('Publish', 'Publishing photo to Street View...');
		const metadata: PublishPhotoRequest = {
			uploadReference: { uploadUrl },
			pose: {
				heading,
				latLngPair: { latitude, longitude }
			},
			captureTime: { seconds: captureTimeSeconds }
		};

		const result = await publishPhoto(accessToken, metadata);
		const photoId = result.photoId?.id;

		progress('Done', 'Photo published!', { photoId });
		return {
			success: true,
			photoId,
			dryRun: false
		};
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : 'Unknown error';
		progress('Error', `Upload failed: ${errorMessage}`, { error: errorMessage });
		return {
			success: false,
			error: errorMessage,
			dryRun
		};
	}
}

/**
 * Batch upload multiple photos
 */
export interface BatchUploadOptions {
	accessToken: string;
	photos: Array<{
		file: File;
		latitude: number;
		longitude: number;
		heading: number;
		captureTimeSeconds: number;
	}>;
	dryRun?: boolean;
	onPhotoProgress?: (index: number, total: number, progress: UploadProgress) => void;
}

export async function uploadPhotoBatch(options: BatchUploadOptions): Promise<UploadResult[]> {
	const { accessToken, photos, dryRun = true, onPhotoProgress } = options;
	const results: UploadResult[] = [];

	for (let i = 0; i < photos.length; i++) {
		const photo = photos[i];
		const result = await uploadPhoto({
			accessToken,
			file: photo.file,
			latitude: photo.latitude,
			longitude: photo.longitude,
			heading: photo.heading,
			captureTimeSeconds: photo.captureTimeSeconds,
			dryRun,
			onProgress: (progress) => onPhotoProgress?.(i, photos.length, progress)
		});
		results.push(result);
	}

	return results;
}
