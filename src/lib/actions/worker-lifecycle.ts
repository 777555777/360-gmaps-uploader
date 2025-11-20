import { onDestroy } from 'svelte';
import { terminateThumbnailWorkerPool } from '$lib/workers/thumbnail-pool';

/**
 * Svelte Action für Worker Pool Lifecycle Management
 * Wird im Root-Layout verwendet um Worker Pool beim App-Shutdown zu beenden
 */
export function useWorkerPoolCleanup() {
	onDestroy(async () => {
		await terminateThumbnailWorkerPool();
	});
}
