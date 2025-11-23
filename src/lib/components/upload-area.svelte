<script lang="ts">
	import { fileState } from '$lib/file-state.svelte';
	import { MAX_FILES_UPLOAD, UPLOAD_DIALOG_ID } from '$lib/globals';
	import { closeDialogById } from '$lib/utils/dialog-helpers';
	import { validateStreetViewImage } from '$lib/utils/image-helpers';
	import { Upload } from '@lucide/svelte';

	let isDragging = $state(false);
	let fileInput: HTMLInputElement | undefined;

	function handleDragEnter(event: DragEvent): void {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragOver(event: DragEvent): void {
		event.preventDefault();
	}

	function handleDragLeave(event: DragEvent): void {
		event.preventDefault();
		isDragging = false;
	}

	function handleDrop(event: DragEvent): void {
		event.preventDefault();
		isDragging = false;

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			processFiles(files);
		}
	}

	function handleFileSelect(event: Event): void {
		const input = event.target;
		if (input instanceof HTMLInputElement && input.files) {
			processFiles(input.files);
		}
	}

	async function processFiles(files: FileList): Promise<void> {
		if (!files.length) {
			return;
		}

		if (files.length > MAX_FILES_UPLOAD) {
			alert(
				`Sie können maximal ${MAX_FILES_UPLOAD} Dateien auf einmal hochladen. Bitte wählen Sie weniger Dateien aus.`
			);
			return;
		}

		const validFiles: File[] = [];
		const errors: string[] = [];

		for (const file of files) {
			const result = await validateStreetViewImage(file);

			if (result.isValid) {
				validFiles.push(file);
			} else {
				errors.push(`• ${file.name}:\n  ${result.errors.join('\n  ')}`);
			}
		}

		if (validFiles.length > 0) {
			fileState.addFiles(validFiles);
			closeDialogById(UPLOAD_DIALOG_ID);
		}

		if (errors.length > 0) {
			alert(`Einige Dateien konnten nicht hinzugefügt werden:\n\n${errors.join('\n\n')}`);
		}

		if (fileInput) {
			fileInput.value = '';
		}
	}

	function handleClick(): void {
		fileInput?.click();
	}
</script>

<div
	class="upload-area"
	class:dragging={isDragging}
	ondragenter={handleDragEnter}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
>
	<Upload size={48} />

	<p class="upload-title">Bilder hier ablegen oder klicken zum Hochladen</p>
	<p class="upload-hint">Unterstützte Formate: JPG, PNG, WebP</p>

	<input
		bind:this={fileInput}
		type="file"
		accept="image/jpeg,image/jpg,image/png,image/webp"
		multiple
		onchange={handleFileSelect}
		class="file-input"
	/>
</div>

<style>
	.upload-area {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 48px 24px;
		border: 2px dashed #cbd5e1;
		border-radius: 8px;
		background-color: #f8fafc;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 240px;
		color: var(--text-color);
	}

	.upload-area:hover,
	.upload-area.dragging {
		border-color: #94a3b8;
		background-color: #f1f5f9;
		color: #3b82f6;
	}

	.upload-area:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.upload-title {
		margin: 0;
		font-size: 16px;
		font-weight: 500;
		color: #334155;
	}

	.upload-hint {
		margin: 0;
		font-size: 14px;
		color: #64748b;
	}

	.file-input {
		display: none;
	}
</style>
