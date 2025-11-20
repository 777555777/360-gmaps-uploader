/**
 * Thumbnail Worker
 * Generiert Thumbnails in einem separaten Thread
 * um den Main Thread nicht zu blockieren.
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
	thumbnail?: ArrayBuffer; // JPEG Blob als ArrayBuffer
	error?: string;
}

self.onmessage = async (event: MessageEvent<ThumbnailRequest>) => {
	const { id, fileData, maxSize } = event.data;

	try {
		// 1. Erstelle Blob aus ArrayBuffer
		const blob = new Blob([fileData], { type: 'image/jpeg' });

		// 2. Erstelle ImageBitmap (effizient, kein DOM)
		const bitmap = await createImageBitmap(blob);

		// 3. Berechne Skalierung
		const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height);
		const width = Math.floor(bitmap.width * scale);
		const height = Math.floor(bitmap.height * scale);

		// 4. Erstelle OffscreenCanvas (Worker-kompatibel)
		const canvas = new OffscreenCanvas(width, height);
		const ctx = canvas.getContext('2d');

		if (!ctx) {
			throw new Error('Canvas context nicht verfügbar');
		}

		// 5. Zeichne Thumbnail
		ctx.drawImage(bitmap, 0, 0, width, height);

		// 6. Cleanup Bitmap
		bitmap.close();

		// 7. Konvertiere zu Blob (JPEG komprimiert)
		const thumbnailBlob = await canvas.convertToBlob({
			type: 'image/jpeg',
			quality: 0.85
		});

		// 8. Konvertiere Blob zu ArrayBuffer (effizienter Transfer)
		const arrayBuffer = await thumbnailBlob.arrayBuffer();

		// 9. Sende Response mit Transferable (Ownership-Transfer)
		const response: ThumbnailResponse = {
			id,
			success: true,
			thumbnail: arrayBuffer
		};

		// Transfer ArrayBuffer zurück (Zero-Copy)
		self.postMessage(response, { transfer: [arrayBuffer] });
	} catch (error) {
		// Sende Fehler-Response
		const response: ThumbnailResponse = {
			id,
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};

		self.postMessage(response);
	}
};
