<script lang="ts">
	import { onMount } from 'svelte';
	import Map from '$lib/components/map.svelte';
	import Header from '$lib/components/header.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import Dialog from '$lib/components/dialog.svelte';
	import PanoViewer from '$lib/components/pano-viewer.svelte';
	import { PUBLISH_DIALOG_ID, UPLOAD_DIALOG_ID, PANO_VIEWER_DIALOG_ID } from '$lib/globals';
	import UploadArea from '$lib/components/upload-area.svelte';
	import { fileState } from '$lib/file-state.svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { closeDialogById, showDialogById } from '$lib/utils/dialog-helpers';
	import { authState } from '$lib/auth-state.svelte';
	import LoginBtn from '$lib/components/login-btn.svelte';

	let selectedFiles = $derived(fileState.selectedFiles);
	let currentPanoramaFile = $derived(fileState.currentPanoramaFile);

	// Reaktiv den Dialog öffnen/schließen wenn sich currentPanoramaFile ändert
	$effect(() => {
		if (currentPanoramaFile) {
			showDialogById(PANO_VIEWER_DIALOG_ID);
		} else {
			closeDialogById(PANO_VIEWER_DIALOG_ID);
		}
	});

	function clearUploadedFiles() {
		const filesToRemove = Array.from(selectedFiles);
		if (!filesToRemove.length) {
			return;
		}

		for (const selectedFile of filesToRemove) {
			fileState.removeFile(selectedFile);
		}

		closeDialogById(PUBLISH_DIALOG_ID);
	}

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
				Upload a 360° image via drag and drop or click. Images with GPS metadata appear
				automatically on the map. If location data is missing, you will need to select a position
				manually in the next step.
			</p>
		</div>

		<UploadArea />
	</div>
{/snippet}

{#snippet publishDialogContent()}
	<div class="publish-area-container">
		{#if !authState.isAuthenticated}
			<p>To Publish your photos to Google Maps you need to sign in with Google.</p>
			<LoginBtn />
		{:else}
			<p>Publishing functionality coming soon!</p>
			<!-- Dummy Button -->
			<button onclick={() => clearUploadedFiles()}>Clear Items</button>
		{/if}
	</div>
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
	<Dialog dialogId={UPLOAD_DIALOG_ID} title="360 Photo Upload" body={uploadDialogContent} />
	<Dialog dialogId={PUBLISH_DIALOG_ID} title="Publish Photos" body={publishDialogContent} />
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
		background-color: var(--main-bg-color);
		padding-top: 16px;
	}

	.upload-instructions {
		margin-bottom: 24px;
		font-size: 14px;
		color: var(--text-secondary-color);
		text-align: center;
	}

	.publish-area-container {
		display: grid;
		place-items: center;
		gap: 0.75rem;
		padding-block: 0.75rem;
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
