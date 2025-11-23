/**
 * Thumbnail Worker
 * Generates thumbnails in a separate thread
 * to avoid blocking the main thread.
 */

export interface ThumbnailRequest {
	id: string;
	fileData: ArrayBuffer;
	fileName: string;
	maxSize: number;
}

export interface ThumbnailResponse {
	id: string;
	success: boolean;
	thumbnail?: ArrayBuffer; // JPEG Blob as ArrayBuffer
	error?: string;
}

self.onmessage = async (event: MessageEvent<ThumbnailRequest>) => {
	const { id, fileData, maxSize } = event.data;

	try {
		// 1. Create blob from ArrayBuffer
		const blob = new Blob([fileData], { type: 'image/jpeg' });

		// 2. Create ImageBitmap (efficient, no DOM)
		const bitmap = await createImageBitmap(blob);

		// 3. Calculate scaling
		const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height);
		const width = Math.floor(bitmap.width * scale);
		const height = Math.floor(bitmap.height * scale);

		// 4. Create OffscreenCanvas (worker-compatible)
		const canvas = new OffscreenCanvas(width, height);
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			throw new Error('Canvas context not available');
		}

		// 5. Draw thumbnail
		ctx.drawImage(bitmap, 0, 0, width, height);

		// 6. Cleanup bitmap
		bitmap.close();

		// 7. Convert to Blob (JPEG compressed)
		const thumbnailBlob = await canvas.convertToBlob({
			type: 'image/jpeg',
			quality: 0.85
		});

		// 8. Convert Blob to ArrayBuffer (more efficient transfer)
		const arrayBuffer = await thumbnailBlob.arrayBuffer();

		// 9. Send response with Transferable (ownership transfer)
		const response: ThumbnailResponse = {
			id,
			success: true,
			thumbnail: arrayBuffer
		};

		// Transfer ArrayBuffer back (Zero-Copy)
		self.postMessage(response, { transfer: [arrayBuffer] });
	} catch (error) {
		// Send error response
		const response: ThumbnailResponse = {
			id,
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};

		self.postMessage(response);
	}
};
