<script lang="ts">
	import { fileState } from '$lib/file-state.svelte';
	import { gpanoFixState } from '$lib/gpano-fix-state.svelte';
	import {
		MAX_FILES_UPLOAD,
		UPLOAD_DIALOG_ID,
		GPANO_FIX_DIALOG_ID,
		MAX_FILE_SIZE_BYTES,
		SUPPORTED_IMAGE_FORMATS
	} from '$lib/globals';
	import { closeDialogById, showDialogById } from '$lib/utils/dialog-helpers';
	import { validateStreetViewImage, type ValidationResult } from '$lib/utils/image-helpers';
	import { Upload } from '@lucide/svelte';

	let isDragging = $state(false);
	let isProcessing = $state(false);
	let processingCount = $state(0);
	let fileInput: HTMLInputElement | undefined;

	function handleDragEnter(event: DragEvent): void {
		event.preventDefault();
		if (!isProcessing) {
			isDragging = true;
		}
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

		if (isProcessing) {
			return;
		}

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
		if (!files.length || isProcessing) {
			return;
		}

		if (files.length > MAX_FILES_UPLOAD) {
			alert(
				`You can upload a maximum of ${MAX_FILES_UPLOAD} files at once. Please select fewer files.`
			);
			return;
		}

		// Set processing state to show loading indicator
		isProcessing = true;
		processingCount = files.length;

		try {
			// Validate all files and collect results
			const validationResults: { file: File; validation: ValidationResult }[] = [];

			for (const file of files) {
				const validation = await validateStreetViewImage(file);
				validationResults.push({ file, validation });
			}

			// Process results through the GPano fix state
			gpanoFixState.processValidationResults(validationResults);

			// Close upload dialog first
			closeDialogById(UPLOAD_DIALOG_ID);

			// Determine what to do based on validation results
			const hasFixable = gpanoFixState.hasFixableFiles;
			const hasRejected = gpanoFixState.hasRejectedFiles;
			const hasValid = gpanoFixState.validFiles.length > 0;

			if (hasFixable || hasRejected) {
				// Show the dialog for any combination that needs user attention:
				// - Files that need metadata fixing
				// - Files that were rejected (even with valid files)
				// - Only rejected files
				showDialogById(GPANO_FIX_DIALOG_ID);
			} else if (hasValid) {
				// All files are valid, add them directly (no dialog needed)
				fileState.addFiles(gpanoFixState.validFiles);
				gpanoFixState.clear();
			}

			if (fileInput) {
				fileInput.value = '';
			}
		} finally {
			// Always reset processing state
			isProcessing = false;
		}
	}

	function handleClick(): void {
		if (!isProcessing) {
			fileInput?.click();
		}
	}

	function mimeToReadableFormat(mimeType: string): string {
		const format = mimeType.split('/')[1];
		return format.toUpperCase();
	}
</script>

<div
	class="upload-area {isDragging ? 'dragging' : ''} {isProcessing ? 'processing' : ''}"
	ondragenter={handleDragEnter}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
	aria-disabled={isProcessing}
>
	{#if isProcessing}
		<div class="spinner-large"></div>
		<p class="upload-title">Validating images...</p>
		<p class="upload-hint">
			Processing <strong>{processingCount}</strong> image(s). Please wait...
		</p>
	{:else}
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
	{/if}

	<input
		bind:this={fileInput}
		type="file"
		accept="image/jpeg,image/jpg"
		multiple
		onchange={handleFileSelect}
		class="file-input"
		disabled={isProcessing}
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

	.upload-area.processing {
		cursor: not-allowed;
		opacity: 0.8;
		pointer-events: none;
	}

	.upload-area.processing:hover {
		border-color: var(--border-default);
		background-color: var(--surface-subtle);
		color: var(--text-muted);
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

	.spinner-large {
		display: inline-block;
		width: 48px;
		height: 48px;
		border: 4px solid var(--spinner-secondary);
		border-top-color: var(--spinner-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
