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
	import DropZone from '$lib/components/util/drop-zone.svelte';

	let isProcessing = $state(false);
	let processingCount = $state(0);
	let dropZone: DropZone | undefined;

	async function handleFiles(files: FileList): Promise<void> {
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

			dropZone?.resetInput();
		} finally {
			// Always reset processing state
			isProcessing = false;
		}
	}

	function mimeToReadableFormat(mimeType: string): string {
		const format = mimeType.split('/')[1];
		return format.toUpperCase();
	}
</script>

<div class="upload-area-container">
	<div class="upload-instructions">
		<p>
			Add <strong>between 1 and {MAX_FILES_UPLOAD}</strong> panorama images.<br /> The Image format
			must be equirectangular with a <strong>2:1 aspect ratio</strong>.
		</p>
		<p>
			Your images are processed locally until you publish them to Google
			<br />
			If an image has no GPS metadata, you can add it manually later.
		</p>
	</div>

	<DropZone bind:this={dropZone} onfiles={handleFiles} {isProcessing} accept="image/jpeg,image/jpg">
		{#snippet idle()}
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
		{/snippet}

		{#snippet processing()}
			<div class="spinner-large"></div>
			<p class="upload-title">Validating images...</p>
			<p class="upload-hint">
				Processing <strong>{processingCount}</strong> image(s). Please wait...
			</p>
		{/snippet}
	</DropZone>
</div>

<style>
	.upload-title {
		margin: 0;
		font-size: 16px;
		font-weight: 500;
		color: var(--text-default);
		text-align: center;
	}

	.upload-instructions {
		margin-bottom: 24px;
		font-size: 14px;
		text-align: center;
	}

	.upload-hint {
		margin: 0;
		font-size: 14px;
		color: var(--text-subtle);
		text-align: center;
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
