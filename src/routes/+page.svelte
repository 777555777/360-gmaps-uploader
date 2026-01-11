<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import Map from '$lib/components/map.svelte';
	import Header from '$lib/components/header.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import Dialog from '$lib/components/util/dialog.svelte';
	import PanoViewer from '$lib/components/dialogs/pano-viewer-dialog.svelte';
	import PublishDialog from '$lib/components/dialogs/publish-dialog.svelte';
	import GPanoFixDialog from '$lib/components/dialogs/gpano-fix-dialog.svelte';
	import {
		PUBLISH_DIALOG_ID,
		UPLOAD_DIALOG_ID,
		PANO_VIEWER_DIALOG_ID,
		CONSENT_DIALOG_ID,
		GPANO_FIX_DIALOG_ID,
		MAX_FILES_UPLOAD
	} from '$lib/globals';
	import UploadArea from '$lib/components/upload-list/upload-area.svelte';
	import { fileState } from '$lib/file-state.svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { gpanoFixState } from '$lib/gpano-fix-state.svelte';
	import { closeDialogById, showDialogById } from '$lib/utils/dialog-helpers';
	import { consentState } from '$lib/consent-state.svelte';
	import { Cookie, MapPin } from '@lucide/svelte';
	import placeholderMapPng from '$lib/assets/map-placeholder.webp';

	let currentPanoramaFile = $derived(fileState.currentPanoramaFile);
	let publishDialogRef: PublishDialog | undefined = $state();

	function handlePublishDialogClose() {
		publishDialogRef?.onDialogClose();
	}

	function handleGPanoFixDialogClose() {
		gpanoFixState.cancel();
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

<svelte:head>
	<title>Pano Publisher - Upload 360° Photos to Google Street View</title>

	<meta
		name="description"
		content="Pano Publisher is a local-first web application for uploading individual 360° photos (Photo Spheres) to Google Maps and Google Street View. No proprietary user accounts or data collection - publishing via your Google account using the Google API."
	/>

	<link rel="canonical" href="https://panopublisher.net" />

	<meta property="og:title" content="Pano Publisher - Upload 360° Photos to Google Street View" />
	<meta
		property="og:description"
		content="Free, open-source web app for uploading individual 360° photo spheres to Google Maps. Local processing, no data collection."
	/>
	<meta property="og:url" content="https://panopublisher.net" />
</svelte:head>

{#snippet uploadDialogContent()}
	<div class="upload-area-container">
		<div class="upload-instructions">
			<p>
				Add <strong>between 1 and {MAX_FILES_UPLOAD}</strong> panorama images.<br /> The Image
				format must be equirectangular with a <strong>2:1 aspect ratio</strong>.
			</p>
			<p>
				Your images are processed locally until you publish them to Google
				<br />
				If an image has no GPS metadata, you can add it manually later.
			</p>
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

{#snippet gpanoFixDialogContent()}
	<GPanoFixDialog />
{/snippet}

<Header />

<main>
	<Sidebar />
	<div class="map-wrapper">
		{#if browser}
			{#if consentState.hasConsented()}
				<Map />
			{:else}
				<div class="map-placeholder">
					<div class="map-placeholder-overlay" style="--bg-image: url({placeholderMapPng})"></div>
					<div class="placeholder-content">
						<MapPin size={48} strokeWidth={1.5} color="var(--text-subtle)" />
						<h2>Map Unavailable</h2>
						<p>
							The interactive map requires your consent to load OpenStreetMap tiles and display your
							photo locations.
						</p>
						<button class="primary-btn" onclick={() => showDialogById(CONSENT_DIALOG_ID)}>
							<Cookie size={16} color="var(--text-white)" />
							Consent Management
						</button>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<Dialog dialogId={UPLOAD_DIALOG_ID} title="Add 360 Photos" body={uploadDialogContent} />
	<Dialog
		dialogId={PUBLISH_DIALOG_ID}
		title="Publish Photos"
		body={publishDialogContent}
		onDismiss={handlePublishDialogClose}
	/>
	<Dialog
		dialogId={PANO_VIEWER_DIALOG_ID}
		title={currentPanoramaFile?.name || '360° Panorama'}
		body={panoViewerDialogContent}
	/>
	<Dialog
		dialogId={GPANO_FIX_DIALOG_ID}
		title="Panorama Metadata"
		body={gpanoFixDialogContent}
		onDismiss={handleGPanoFixDialogClose}
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

	.map-wrapper {
		flex: 1;
		border-radius: 8px 0 0 0;
		border: 1px solid var(--border-subtle);
		background-color: var(--surface-base);
		overflow: hidden;
	}

	.map-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;

		.map-placeholder-overlay {
			position: absolute;
			inset: 0;
			width: 100%;
			height: 100%;
			background-image: var(--bg-image);
			background-size: 50%;
			background-repeat: repeat;
			filter: opacity(0.175);
		}

		.placeholder-content {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1.5rem;
			max-width: 100%;
			padding: 400px 300px;
			padding: 35% 25%;

			text-align: center;
			background: radial-gradient(ellipse, var(--surface-base) 30%, transparent 60%);
			z-index: 1;

			h2 {
				font-size: 1.5rem;
				font-weight: 600;
				color: var(--text-default);
				margin: 0;
			}

			p {
				color: var(--text-muted);
				margin: 0;
				max-width: 400px;
				box-sizing: content-box;
			}
		}

		@media (width < 768px) {
			.placeholder-content {
				padding: 35px;
				background: radial-gradient(ellipse, var(--surface-base) 40%, transparent 70%);
				gap: 0.75rem;

				h2 {
					font-size: 1.25rem;
				}
				p {
					font-size: 0.85rem;
				}
			}
		}

		@media (width < 380px) {
			.placeholder-content {
				padding: 16px;
			}
		}
	}

	/* Spezielle Styles für den Panorama Viewer Dialog */
	:global(#pano-viewer-dialog) {
		max-width: 95vw;
		width: 1200px;
		max-height: 95dvh;
	}

	:global(#pano-viewer-dialog .dialog-body) {
		padding: 0;
	}

	@media (width < 768px) {
		.map-wrapper {
			border-radius: 0;
		}

		main {
			display: flex;
			flex-direction: column-reverse;
			gap: 1rem;
		}
	}
</style>
