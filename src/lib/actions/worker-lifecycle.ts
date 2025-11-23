import { onDestroy } from 'svelte';
import { terminateThumbnailWorkerPool } from '$lib/workers/thumbnail-pool';

/**
 * Svelte action for worker pool lifecycle management
 * Used in root layout to terminate worker pool on app shutdown
 */
export function useWorkerPoolCleanup() {
	onDestroy(async () => {
		await terminateThumbnailWorkerPool();
	});
}
