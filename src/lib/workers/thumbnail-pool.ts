/**
 * Thumbnail Worker Pool
 * Manages a pool of web workers for parallel thumbnail generation.
 *
 * Features:
 * - Automatic worker management
 * - Queue-based job distribution
 * - Promise-based API
 * - Graceful shutdown
 * - Error handling
 */

import type { ThumbnailRequest, ThumbnailResponse } from './thumbnail.worker';

interface ThumbnailJob {
	id: string;
	file: File;
	maxSize: number;
	resolve: (thumbnail: string) => void;
	reject: (error: Error) => void;
}

export class ThumbnailWorkerPool {
	private workers: Worker[] = [];
	private availableWorkers: Worker[] = [];
	private jobQueue: ThumbnailJob[] = [];
	private pendingJobs = new Map<string, ThumbnailJob>();
	private jobIdCounter = 0;

	private readonly poolSize: number;
	private readonly workerPath: string;
	private isInitialized = false;

	constructor(poolSize: number = Math.min(navigator.hardwareConcurrency || 2, 4)) {
		// Limit pool size (min 2, max 4 for stability)
		// More workers = more overhead from context switching
		this.poolSize = Math.min(Math.max(poolSize, 2), 4);
		this.workerPath = new URL('./thumbnail.worker.ts', import.meta.url).href;
	}

	/**
	 * Initializes the worker pool
	 */
	async init(): Promise<void> {
		if (this.isInitialized) return;

		console.log(`🔧 Initializing Thumbnail Worker Pool (${this.poolSize} workers)...`);

		// Create workers
		for (let i = 0; i < this.poolSize; i++) {
			try {
				const worker = new Worker(this.workerPath, { type: 'module' });

				// Setup message handler
				worker.onmessage = (event: MessageEvent<ThumbnailResponse>) => {
					this.handleWorkerMessage(worker, event.data);
				};

				// Setup error handler
				worker.onerror = (error) => {
					console.error(`Worker ${i} error:`, error);
				};

				this.workers.push(worker);
				this.availableWorkers.push(worker);
			} catch (error) {
				console.error(`Failed to create worker ${i}:`, error);
			}
		}

		this.isInitialized = true;
		console.log(`✅ Worker Pool initialized with ${this.workers.length} workers`);
	}

	/**
	 * Generates a thumbnail for a file
	 * @param file - The image file
	 * @param maxSize - Maximum size (width/height)
	 * @returns Promise with base64-encoded thumbnail
	 */
	async generateThumbnail(file: File, maxSize: number = 512): Promise<string> {
		if (!this.isInitialized) {
			await this.init();
		}

		return new Promise((resolve, reject) => {
			const id = `thumbnail-${++this.jobIdCounter}`;
			const job: ThumbnailJob = { id, file, maxSize, resolve, reject };

			this.pendingJobs.set(id, job);
			this.jobQueue.push(job);

			// Try to process job immediately
			this.processQueue();
		});
	}

	/**
	 * Processes the job queue
	 */
	private processQueue(): void {
		while (this.availableWorkers.length > 0 && this.jobQueue.length > 0) {
			const worker = this.availableWorkers.shift()!;
			const job = this.jobQueue.shift()!;

			this.executeJob(worker, job);
		}
	}

	/**
	 * Executes a job in a worker
	 */
	private async executeJob(worker: Worker, job: ThumbnailJob): Promise<void> {
		try {
			// Read file as ArrayBuffer
			const arrayBuffer = await job.file.arrayBuffer();

			// Create request
			const request: ThumbnailRequest = {
				id: job.id,
				fileData: arrayBuffer,
				fileName: job.file.name,
				maxSize: job.maxSize
			};

			// Send to worker (WITHOUT transfer, copies instead)
			// Prevents "object no longer usable" error in Firefox
			worker.postMessage(request);
		} catch (error) {
			// Error reading file
			this.handleJobError(
				worker,
				job.id,
				error instanceof Error ? error : new Error('File read failed')
			);
		}
	}

	/**
	 * Handles worker responses
	 */
	private handleWorkerMessage(worker: Worker, response: ThumbnailResponse): void {
		const job = this.pendingJobs.get(response.id);

		if (!job) {
			console.warn(`Received response for unknown job: ${response.id}`);
			this.availableWorkers.push(worker);
			return;
		}

		// Remove job from pending map
		this.pendingJobs.delete(response.id);

		// Resolve or reject
		if (response.success && response.thumbnail) {
			// Convert ArrayBuffer to Blob URL (in main thread)
			const blob = new Blob([response.thumbnail], { type: 'image/jpeg' });
			const blobUrl = URL.createObjectURL(blob);
			job.resolve(blobUrl);
		} else {
			job.reject(new Error(response.error || 'Thumbnail generation failed'));
		}

		// Worker is available again
		this.availableWorkers.push(worker);

		// Process next job
		this.processQueue();
	}

	/**
	 * Handles job errors
	 */
	private handleJobError(worker: Worker, jobId: string, error: Error): void {
		const job = this.pendingJobs.get(jobId);

		if (job) {
			this.pendingJobs.delete(jobId);
			job.reject(error);
		}

		// Worker is available again
		this.availableWorkers.push(worker);
		this.processQueue();
	}

	/**
	 * Returns the number of active jobs
	 */
	get activeJobCount(): number {
		return this.pendingJobs.size;
	}

	/**
	 * Returns the number of queued jobs
	 */
	get queuedJobCount(): number {
		return this.jobQueue.length;
	}

	/**
	 * Terminates all workers (cleanup)
	 */
	async terminate(): Promise<void> {
		console.log('🛑 Terminating Worker Pool...');

		// Reject all pending jobs
		for (const job of this.pendingJobs.values()) {
			job.reject(new Error('Worker pool terminated'));
		}

		this.pendingJobs.clear();
		this.jobQueue = [];

		// Terminate all workers
		for (const worker of this.workers) {
			worker.terminate();
		}

		this.workers = [];
		this.availableWorkers = [];
		this.isInitialized = false;

		console.log('✅ Worker Pool terminated');
	}
}

// Singleton-Instanz
let poolInstance: ThumbnailWorkerPool | null = null;

/**
 * Returns the singleton instance of the worker pool
 */
export function getThumbnailWorkerPool(): ThumbnailWorkerPool {
	if (!poolInstance) {
		poolInstance = new ThumbnailWorkerPool();
	}
	return poolInstance;
}

/**
 * Cleanup function for app shutdown
 */
export async function terminateThumbnailWorkerPool(): Promise<void> {
	if (poolInstance) {
		await poolInstance.terminate();
		poolInstance = null;
	}
}
