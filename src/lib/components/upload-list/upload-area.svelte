<script lang="ts">
	import { fileState } from '$lib/file-state.svelte';
	import {
		MAX_FILES_UPLOAD,
		UPLOAD_DIALOG_ID,
		MAX_FILE_SIZE_BYTES,
		SUPPORTED_IMAGE_FORMATS
	} from '$lib/globals';
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
				`You can upload a maximum of ${MAX_FILES_UPLOAD} files at once. Please select fewer files.`
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
			alert(`Some files could not be added:\n\n${errors.join('\n\n')}`);
		}

		if (fileInput) {
			fileInput.value = '';
		}
	}

	function handleClick(): void {
		fileInput?.click();
	}

	function mimeToReadableFormat(mimeType: string): string {
		const format = mimeType.split('/')[1];
		return format.toUpperCase();
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

	<p class="upload-title">Add images by clicking or dragging them here</p>
	<p class="upload-hint">
		Supported formats:
		<strong>
			{SUPPORTED_IMAGE_FORMATS.map(mimeToReadableFormat).join(', ')}
		</strong>
		<br />
		Maximum file size per image:
		<strong>{(MAX_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(0)} MB</strong>
	</p>

	<input
		bind:this={fileInput}
		type="file"
		accept="image/jpeg,image/jpg"
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
		border: 2px dashed var(--border-default);
		border-radius: 8px;
		background-color: var(--surface-subtle);
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 240px;
		color: var(--text-muted);
	}

	.upload-area:hover,
	.upload-area.dragging {
		border-color: var(--button-primary);
		background-color: var(--button-primary-bg);
		color: var(--button-primary);
	}

	.upload-area:focus {
		outline: 2px solid var(--button-primary);
		outline-offset: 2px;
	}

	.upload-title {
		margin: 0;
		font-size: 16px;
		font-weight: 500;
		color: var(--text-default);
		text-align: center;
	}

	.upload-hint {
		margin: 0;
		font-size: 14px;
		color: var(--text-subtle);
		text-align: center;
	}

	.file-input {
		display: none;
	}
</style>
