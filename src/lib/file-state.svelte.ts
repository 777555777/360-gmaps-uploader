import { SvelteSet, SvelteMap } from 'svelte/reactivity';
import { extractImageMetadata, type ImageMetadata } from './utils/image-helpers';
import { mapState } from './map-state.svelte';

class FileState {
	// Reactive set for storing uploaded files
	// SvelteSet is better than normal Set because:
	// - .add(), .delete(), .clear() are automatically reactive
	// - Duplicates are automatically prevented
	// - Perfect for batch upload of individual images
	files = new SvelteSet<File>();

	// Reactive Map for metadata (File -> ImageMetadata)
	// Filled asynchronously, while files are available immediately
	metadata = new SvelteMap<File, ImageMetadata>();

	// Reactive Set for files currently being processed
	loadingFiles = new SvelteSet<File>();

	// Reactive Set for selected files (for publish functionality)
	selectedFiles = new SvelteSet<File>();

	// Reactive Map for metadata errors
	metadataErrors = new SvelteMap<File, string>();

	// Panorama Viewer State
	currentPanoramaFile = $state<File | null>(null);

	// Queue system for throttled metadata extraction
	private metadataQueue: File[] = [];
	private activeExtractions = 0;
	private readonly MAX_CONCURRENT = 3; // Max 3 parallel extractions

	addFile(file: File): void {
		this.files.add(file);
		this.extractMetadataAsync(file);
	}

	addFiles(files: File[] | FileList): void {
		// Svelte 5 Best Practice: Add synchronously for immediate UI feedback
		// Load metadata asynchronously in the background
		for (const file of files) {
			this.files.add(file);
			this.extractMetadataAsync(file);
		}
	}

	// Private method for asynchronous metadata extraction with queue
	private extractMetadataAsync(file: File): void {
		this.metadataQueue.push(file);
		this.processQueue();
	}

	// Process queue with concurrency limit
	private processQueue(): void {
		while (this.activeExtractions < this.MAX_CONCURRENT && this.metadataQueue.length > 0) {
			const file = this.metadataQueue.shift()!;
			this.activeExtractions++;
			this.loadingFiles.add(file);

			extractImageMetadata(file)
				.then((metadata) => {
					this.metadata.set(file, metadata);
					this.metadataErrors.delete(file);
				})
				.catch((error) => {
					console.error(`Could not read metadata for ${file.name}:`, error);
					this.metadataErrors.set(file, 'Could not read metadata');
				})
				.finally(() => {
					this.activeExtractions--;
					this.loadingFiles.delete(file);
					this.processQueue(); // Process next in queue
				});
		}
	}

	removeFile(file: File): void {
		this.files.delete(file);
		this.metadata.delete(file);
		this.metadataErrors.delete(file);
		this.loadingFiles.delete(file);
		this.selectedFiles.delete(file);
	}

	clearFiles(): void {
		this.files.clear();
		this.metadata.clear();
		this.metadataErrors.clear();
		this.loadingFiles.clear();
		this.selectedFiles.clear();
	}

	hasFile(file: File): boolean {
		return this.files.has(file);
	}

	// Check if metadata is loaded for a file
	hasMetadata(file: File): boolean {
		return this.metadata.has(file);
	}

	// Get metadata for a file (or undefined)
	getMetadata(file: File): ImageMetadata | undefined {
		return this.metadata.get(file);
	}

	// Check if a file is currently being processed
	isLoading(file: File): boolean {
		return this.loadingFiles.has(file);
	}

	// Get metadata error for a file (or undefined)
	getMetadataError(file: File): string | undefined {
		return this.metadataErrors.get(file);
	}

	// Update Geolocation for a file
	updateGeolocation(file: File, latitude: number, longitude: number): void {
		const currentMetadata = this.metadata.get(file);
		if (currentMetadata) {
			// Create a new object to ensure reactivity when setting it back to the map
			const newMetadata = {
				...currentMetadata,
				geoLocation: { latitude, longitude }
			};
			this.metadata.set(file, newMetadata);

			// Update marker immediately (synchronously) so it's available on click
			// The effect in map.svelte runs asynchronously and might be too late
			if (typeof window !== 'undefined') {
				import('leaflet').then((Leaflet) => {
					const isSelected = this.isSelected(file);
					mapState.updateMarkerPosition(file, Leaflet, isSelected, newMetadata);
				});
			}
		}
	}

	// Getter for array access (e.g. for loops)
	get fileList(): File[] {
		return Array.from(this.files);
	}

	// Getter for count
	get count(): number {
		return this.files.size;
	}

	// Getter for count of still loading files
	get loadingCount(): number {
		return this.loadingFiles.size;
	}

	// Selection Management
	toggleSelection(file: File): void {
		if (this.selectedFiles.has(file)) {
			this.selectedFiles.delete(file);
		} else {
			this.selectedFiles.add(file);
		}
	}

	isSelected(file: File): boolean {
		return this.selectedFiles.has(file);
	}

	get selectedCount(): number {
		return this.selectedFiles.size;
	}

	get hasSelection(): boolean {
		return this.selectedFiles.size > 0;
	}

	get selectedFileList(): File[] {
		return Array.from(this.selectedFiles);
	}

	// Panorama Viewer Methods
	openPanorama(file: File): void {
		this.currentPanoramaFile = file;
	}

	closePanorama(): void {
		this.currentPanoramaFile = null;
	}
}

export const fileState = new FileState();
