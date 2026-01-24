<script lang="ts">
	import { FileUp } from '@lucide/svelte';
	import DropZone from '$lib/components/util/drop-zone.svelte';
	import { gpxState } from '$lib/gpx-state.svelte';
	import { fileState } from '$lib/file-state.svelte';
	import { parseGPXFile, matchFileToTrack } from '$lib/utils/gpx-helpers';
	import { closeDialogById, showDialogById } from '$lib/utils/dialog-helpers';
	import { GPS_DATA_DIALOG_ID, GPX_MATCH_DIALOG_ID } from '$lib/globals';

	let isProcessing = $state(false);
	let dropZone: DropZone | undefined;
	let errorMessage = $state<string | null>(null);

	export function handleDialogClose() {
		errorMessage = null;
	}

	async function handleFiles(files: FileList): Promise<void> {
		// Clear previous error message
		errorMessage = null;

		// Validate single GPX file
		if (files.length !== 1) {
			errorMessage = 'Please select a single .gpx file';
			return;
		}

		const file = files[0];
		if (!file.name.toLowerCase().endsWith('.gpx')) {
			errorMessage = 'Please select a .gpx file';
			return;
		}

		isProcessing = true;

		try {
			// Parse GPX file
			await gpxState.parseGPX(file, parseGPXFile);

			if (gpxState.parseError) {
				errorMessage = `Failed to parse GPX file: ${gpxState.parseError}`;
				gpxState.clear();
				return;
			}

			// Match with existing files in upload list
			const filesToMatch = Array.from(fileState.files);

			if (filesToMatch.length === 0) {
				errorMessage = 'No images to match. Please upload images first.';
				gpxState.clear();
				return;
			}

			gpxState.matchFilesToTrack(
				filesToMatch,
				(file) => fileState.metadata.get(file),
				matchFileToTrack
			);

			// Close current dialog
			closeDialogById(GPS_DATA_DIALOG_ID);

			// Show match dialog if we have any results
			if (gpxState.hasMatches || gpxState.hasUnmatched) {
				showDialogById(GPX_MATCH_DIALOG_ID);
			} else {
				errorMessage = 'No matching images found. Check that your images have timestamps.';
				gpxState.clear();
			}

			// Reset drop zone
			dropZone?.resetInput();
		} catch (error) {
			console.error('GPX processing error:', error);
			errorMessage = `Failed to process GPX file: ${error instanceof Error ? error.message : 'Unknown error'}`;
			gpxState.clear();
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="upload-area-container">
	<div class="upload-instructions">
		<p>Here you can add GPS data from a .gpx file to your upload list.</p>

		<p>
			A GPX file contains GPS track data that can be matched to your images based on their
			timestamps.
		</p>
	</div>

	<!-- Error Banner -->
	{#if errorMessage}
		<div class="banner error">
			<div class="banner-text">
				<p>{errorMessage}</p>
			</div>
		</div>
	{/if}

	<DropZone bind:this={dropZone} onfiles={handleFiles} {isProcessing} accept=".gpx">
		{#snippet idle()}
			<FileUp size={48} />
			<p class="upload-title">Add a .gpx file by clicking or dragging it here</p>
			<p class="upload-hint">
				Supported formats:
				<strong> .gpx </strong>
			</p>
		{/snippet}

		{#snippet processing()}
			<div class="spinner-large"></div>
			<p class="upload-title">Processing GPX file...</p>
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

	/* Additional Banner Styles */
	.banner {
		justify-content: center;
		text-align: center;
		margin-bottom: 1.5rem;
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
