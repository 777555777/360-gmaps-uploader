import { SvelteSet, SvelteMap } from 'svelte/reactivity';
import { extractImageMetadata, type ImageMetadata } from './utils/image-helpers';

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

	addFile(file: File): void {
		this.files.add(file);
		this.extractMetadataAsync(file);
	}

	addFiles(files: File[] | FileList): void {
		// Svelte 5 Best Practice: Synchron hinzufügen für sofortiges UI-Feedback
		// Metadaten asynchron im Hintergrund laden
		for (const file of files) {
			console.log('Adding file:', file.name);
			this.files.add(file);
			this.extractMetadataAsync(file);
		}
	}

	// Private Methode für asynchrone Metadaten-Extraktion
	private extractMetadataAsync(file: File): void {
		// Markiere als "loading"
		this.loadingFiles.add(file);

		// Starte asynchrone Extraktion
		extractImageMetadata(file)
			.then((metadata) => {
				this.metadata.set(file, metadata);
				console.log(`Metadata loaded for ${file.name}:`, metadata);
			})
			.catch((error) => {
				console.error(`Failed to extract metadata for ${file.name}:`, error);
			})
			.finally(() => {
				this.loadingFiles.delete(file);
			});
	}

	removeFile(file: File): void {
		this.files.delete(file);
		this.metadata.delete(file);
		this.loadingFiles.delete(file);
		this.selectedFiles.delete(file);
	}

	clearFiles(): void {
		this.files.clear();
		this.metadata.clear();
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
