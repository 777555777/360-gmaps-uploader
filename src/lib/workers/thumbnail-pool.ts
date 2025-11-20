/**
 * Thumbnail Worker Pool
 * Verwaltet einen Pool von Web Workers für parallele Thumbnail-Generierung.
 *
 * Features:
 * - Automatisches Worker-Management
 * - Queue-basierte Job-Verteilung
 * - Promise-basierte API
 * - Graceful Shutdown
 * - Error Handling
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
		// Begrenze Pool-Größe (min 2, max 4 für Stabilität)
		// Mehr Workers = mehr Overhead durch Context Switching
		this.poolSize = Math.min(Math.max(poolSize, 2), 4);
		this.workerPath = new URL('./thumbnail.worker.ts', import.meta.url).href;
	}

	/**
	 * Initialisiert den Worker Pool
	 */
	async init(): Promise<void> {
		if (this.isInitialized) return;

		console.log(`🔧 Initializing Thumbnail Worker Pool (${this.poolSize} workers)...`);

		// Erstelle Workers
		for (let i = 0; i < this.poolSize; i++) {
			try {
				const worker = new Worker(this.workerPath, { type: 'module' });

				// Setup Message Handler
				worker.onmessage = (event: MessageEvent<ThumbnailResponse>) => {
					this.handleWorkerMessage(worker, event.data);
				};

				// Setup Error Handler
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
	 * Generiert ein Thumbnail für eine Datei
	 * @param file - Die Bilddatei
	 * @param maxSize - Maximale Größe (Breite/Höhe)
	 * @returns Promise mit Base64-encoded Thumbnail
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

			// Versuche Job sofort zu verarbeiten
			this.processQueue();
		});
	}

	/**
	 * Verarbeitet die Job-Queue
	 */
	private processQueue(): void {
		while (this.availableWorkers.length > 0 && this.jobQueue.length > 0) {
			const worker = this.availableWorkers.shift()!;
			const job = this.jobQueue.shift()!;

			this.executeJob(worker, job);
		}
	}

	/**
	 * Führt einen Job in einem Worker aus
	 */
	private async executeJob(worker: Worker, job: ThumbnailJob): Promise<void> {
		try {
			// Lese Datei als ArrayBuffer
			const arrayBuffer = await job.file.arrayBuffer();

			// Erstelle Request
			const request: ThumbnailRequest = {
				id: job.id,
				fileData: arrayBuffer,
				fileName: job.file.name,
				maxSize: job.maxSize
			};

			// Sende an Worker (OHNE Transfer, kopiert stattdessen)
			// Verhindert "object no longer usable" Fehler in Firefox
			worker.postMessage(request);
		} catch (error) {
			// Fehler beim Lesen der Datei
			this.handleJobError(
				worker,
				job.id,
				error instanceof Error ? error : new Error('File read failed')
			);
		}
	}

	/**
	 * Behandelt Worker-Antworten
	 */
	private handleWorkerMessage(worker: Worker, response: ThumbnailResponse): void {
		const job = this.pendingJobs.get(response.id);

		if (!job) {
			console.warn(`Received response for unknown job: ${response.id}`);
			this.availableWorkers.push(worker);
			return;
		}

		// Entferne Job aus Pending-Map
		this.pendingJobs.delete(response.id);

		// Resolve oder Reject
		if (response.success && response.thumbnail) {
			// Konvertiere ArrayBuffer zu Blob URL (im Main Thread)
			const blob = new Blob([response.thumbnail], { type: 'image/jpeg' });
			const blobUrl = URL.createObjectURL(blob);
			job.resolve(blobUrl);
		} else {
			job.reject(new Error(response.error || 'Thumbnail generation failed'));
		}

		// Worker ist wieder verfügbar
		this.availableWorkers.push(worker);

		// Verarbeite nächsten Job
		this.processQueue();
	}

	/**
	 * Behandelt Job-Fehler
	 */
	private handleJobError(worker: Worker, jobId: string, error: Error): void {
		const job = this.pendingJobs.get(jobId);

		if (job) {
			this.pendingJobs.delete(jobId);
			job.reject(error);
		}

		// Worker ist wieder verfügbar
		this.availableWorkers.push(worker);
		this.processQueue();
	}

	/**
	 * Gibt die Anzahl der aktiven Jobs zurück
	 */
	get activeJobCount(): number {
		return this.pendingJobs.size;
	}

	/**
	 * Gibt die Anzahl der wartenden Jobs zurück
	 */
	get queuedJobCount(): number {
		return this.jobQueue.length;
	}

	/**
	 * Beendet alle Workers (Cleanup)
	 */
	async terminate(): Promise<void> {
		console.log('🛑 Terminating Worker Pool...');

		// Lehne alle pending Jobs ab
		for (const job of this.pendingJobs.values()) {
			job.reject(new Error('Worker pool terminated'));
		}

		this.pendingJobs.clear();
		this.jobQueue = [];

		// Beende alle Workers
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
 * Gibt die Singleton-Instanz des Worker Pools zurück
 */
export function getThumbnailWorkerPool(): ThumbnailWorkerPool {
	if (!poolInstance) {
		poolInstance = new ThumbnailWorkerPool();
	}
	return poolInstance;
}

/**
 * Cleanup-Funktion für App-Shutdown
 */
export async function terminateThumbnailWorkerPool(): Promise<void> {
	if (poolInstance) {
		await poolInstance.terminate();
		poolInstance = null;
	}
}
