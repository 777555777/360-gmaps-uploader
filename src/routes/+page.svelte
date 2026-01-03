<script lang="ts">
	import { onMount } from 'svelte';
	import Map from '$lib/components/map.svelte';
	import Header from '$lib/components/header.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import Dialog from '$lib/components/util/dialog.svelte';
	import PanoViewer from '$lib/components/pano-viewer.svelte';
	import PublishDialog from '$lib/components/publish-dialog.svelte';
	import {
		PUBLISH_DIALOG_ID,
		UPLOAD_DIALOG_ID,
		PANO_VIEWER_DIALOG_ID,
		MAX_FILES_UPLOAD
	} from '$lib/globals';
	import UploadArea from '$lib/components/upload-list/upload-area.svelte';
	import { fileState } from '$lib/file-state.svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { closeDialogById, showDialogById } from '$lib/utils/dialog-helpers';

	let currentPanoramaFile = $derived(fileState.currentPanoramaFile);
	let publishDialogRef: PublishDialog | undefined = $state();

	function handlePublishDialogClose() {
		publishDialogRef?.onDialogClose();
	}

	// Reaktiv den Dialog öffnen/schließen wenn sich currentPanoramaFile ändert
	$effect(() => {
		if (currentPanoramaFile) {
			showDialogById(PANO_VIEWER_DIALOG_ID);
		} else {
			closeDialogById(PANO_VIEWER_DIALOG_ID);
		}
	});

	onMount(() => {
		function handleGlobalPointerDown(event: PointerEvent) {
			const target = event.target as HTMLElement | null;
			if (
				target?.closest('.upload-item') ||
				target?.closest('.leaflet-container') ||
				target?.closest('.leaflet-popup')
			) {
				return;
			}

			mapState.clearFocus();
		}

		window.addEventListener('pointerdown', handleGlobalPointerDown);

		// Listener für Dialog-Close-Event um den fileState zu clearen
		const panoDialog = document.getElementById(PANO_VIEWER_DIALOG_ID);
		function handleDialogClose() {
			fileState.closePanorama();
		}

		if (panoDialog instanceof HTMLDialogElement) {
			panoDialog.addEventListener('close', handleDialogClose);
		}

		return () => {
			window.removeEventListener('pointerdown', handleGlobalPointerDown);
			if (panoDialog instanceof HTMLDialogElement) {
				panoDialog.removeEventListener('close', handleDialogClose);
			}
		};
	});
</script>

{#snippet uploadDialogContent()}
	<div class="upload-area-container">
		<div class="upload-instructions">
			<p>
				Add between 1 and {MAX_FILES_UPLOAD} 360° panorama images.<br /> The Image format must be equirectangular
				with a 2:1 aspect ratio.
			</p>
			<p>If an image has no GPS metadata, you can add it manually later.</p>
		</div>

		<UploadArea />
	</div>
{/snippet}

{#snippet publishDialogContent()}
	<PublishDialog bind:this={publishDialogRef} />
{/snippet}

{#snippet panoViewerDialogContent()}
	{#if currentPanoramaFile}
		<PanoViewer file={currentPanoramaFile} />
	{/if}
{/snippet}

<Header />

<main>
	<Sidebar />
	<Map />
	<Dialog dialogId={UPLOAD_DIALOG_ID} title="Add 360 Photos" body={uploadDialogContent} />
	<Dialog
		dialogId={PUBLISH_DIALOG_ID}
		title="Publish Photos"
		body={publishDialogContent}
		onClose={handlePublishDialogClose}
	/>
	<Dialog
		dialogId={PANO_VIEWER_DIALOG_ID}
		title={currentPanoramaFile?.name || '360° Panorama'}
		body={panoViewerDialogContent}
	/>
</main>

<style>
	main {
		display: flex;
		flex: 1;
		overflow: hidden;
		background-color: var(--surface-subtle);
		padding-top: 16px;
	}

	.upload-instructions {
		margin-bottom: 24px;
		font-size: 14px;
		text-align: center;
	}

	/* Spezielle Styles für den Panorama Viewer Dialog */
	:global(#pano-viewer-dialog) {
		max-width: 95vw;
		width: 1200px;
		max-height: 90vh;
	}

	:global(#pano-viewer-dialog .dialog-body) {
		padding: 0;
	}

	@media (width < 768px) {
		main {
			display: flex;
			flex-direction: column-reverse;
			gap: 1rem;
		}
	}
</style>
