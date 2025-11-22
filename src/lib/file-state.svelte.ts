import { SvelteSet, SvelteMap } from 'svelte/reactivity';
import { extractImageMetadata, type ImageMetadata } from './utils/image-helpers';
import { mapState } from './map-state.svelte';

class FileState {
	// Reactive set for storing uploaded files
	// SvelteSet ist besser als normales Set, weil:
	// - .add(), .delete(), .clear() automatisch reactiv sind
	// - Duplikate automatisch verhindert werden
	// - Perfekt für Batch-Upload von einzelnen Bildern
	files = new SvelteSet<File>();

	// Reactive Map für Metadaten (File -> ImageMetadata)
	// Wird asynchron gefüllt, während die Files sofort verfügbar sind
	metadata = new SvelteMap<File, ImageMetadata>();

	// Reactive Set für Files, die gerade verarbeitet werden
	loadingFiles = new SvelteSet<File>();

	// Reactive Set für ausgewählte Files (für Publish-Funktionalität)
	selectedFiles = new SvelteSet<File>();

	// Reactive Map für Metadata-Fehler
	metadataErrors = new SvelteMap<File, string>();

	// Queue-System für throttled Metadata-Extraktion
	private metadataQueue: File[] = [];
	private activeExtractions = 0;
	private readonly MAX_CONCURRENT = 3; // Max 3 parallele Extraktionen

	addFile(file: File): void {
		this.files.add(file);
		this.extractMetadataAsync(file);
	}

	addFiles(files: File[] | FileList): void {
		// Svelte 5 Best Practice: Synchron hinzufügen für sofortiges UI-Feedback
		// Metadaten asynchron im Hintergrund laden
		for (const file of files) {
			this.files.add(file);
			this.extractMetadataAsync(file);
		}
	}

	// Private Methode für asynchrone Metadaten-Extraktion mit Queue
	private extractMetadataAsync(file: File): void {
		this.metadataQueue.push(file);
		this.processQueue();
	}

	// Verarbeite Queue mit Concurrency-Limit
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
					console.error(`Metadata extraction failed for ${file.name}:`, error);
					this.metadataErrors.set(file, 'Metadaten konnten nicht geladen werden');
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

	// Prüfe, ob Metadaten für ein File geladen sind
	hasMetadata(file: File): boolean {
		return this.metadata.has(file);
	}

	// Hole Metadaten für ein File (oder undefined)
	getMetadata(file: File): ImageMetadata | undefined {
		return this.metadata.get(file);
	}

	// Prüfe, ob ein File gerade verarbeitet wird
	isLoading(file: File): boolean {
		return this.loadingFiles.has(file);
	}

	// Hole Metadata-Fehler für ein File (oder undefined)
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

			// Aktualisiere Marker sofort (synchron) damit er beim Klick verfügbar ist
			// Der Effect in map.svelte läuft asynchron und könnte zu spät sein
			if (typeof window !== 'undefined') {
				import('leaflet').then((Leaflet) => {
					const isSelected = this.isSelected(file);
					mapState.updateMarkerPosition(
						file,
						latitude,
						longitude,
						Leaflet,
						isSelected,
						newMetadata.fileSizeFormatted
					);
				});
			}
		}
	}

	// Getter für Array-Zugriff (z.B. für Loops)
	get fileList(): File[] {
		return Array.from(this.files);
	}

	// Getter für die Anzahl
	get count(): number {
		return this.files.size;
	}

	// Getter für die Anzahl der noch ladenden Files
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
}

export const fileState = new FileState();
