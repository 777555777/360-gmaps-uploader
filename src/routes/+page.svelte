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
		INFO_DIALOG_ID,
		MAX_FILES_UPLOAD
	} from '$lib/globals';
	import UploadArea from '$lib/components/upload-list/upload-area.svelte';
	import { fileState } from '$lib/file-state.svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { closeDialogById, showDialogById } from '$lib/utils/dialog-helpers';
	import GithubLink from '$lib/components/header/github-link.svelte';

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

{#snippet infoDialogContent()}
	<div class="info-content">
		<section>
			<h3>About this Application</h3>
			<p>
				This application lets you upload individual 360° photo spheres directly to Google Maps /
				Street View. These images appear as the blue circles on Google Maps.
			</p>
			<p>
				It was created to fill a gap in Google's official tools: Google Street View Studio does not
				support uploading single images, and Google has discontinued the Street View mobile app,
				which was previously the only alternative for publishing standalone photo spheres.
			</p>
			<p>
				<strong>Important:</strong> This project is intentionally focused on uploading individual photo
				spheres only. It does not support:
			</p>
			<ul>
				<li>Video uploads</li>
				<li>Connecting panoramas</li>
				<li>Creating street-level imagery from video footage</li>
			</ul>
			<p>
				If you want to upload videos or create connected street-level imagery, please use
				<a
					href="https://streetviewstudio.maps.google.com"
					target="_blank"
					rel="noopener noreferrer"
				>
					Google Street View Studio
				</a>.
			</p>
		</section>
		<section>
			<h3>Disclaimers</h3>
			<p>
				This application uses Google Maps and Street View APIs. Google Maps and Street View are
				trademarks of Google.
			</p>
		</section>
	</div>
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
	<Dialog dialogId={INFO_DIALOG_ID} title="Information" body={infoDialogContent} />
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

	/* Info Dialog Styles */
	.info-content {
		font-size: 14px;
		line-height: 1.6;
		text-align: justify;
		section {
			margin-bottom: 1rem;
		}

		h3 {
			font-size: 16px;
			font-weight: 600;
			margin: 0 0 0.75rem 0;
			color: var(--text-primary-color);
		}

		p {
			margin: 0 0 0.75rem 0;
			color: var(--text-secondary-color);
		}

		ul {
			margin: 0.5rem 0 0.75rem 1.5rem;
			padding: 0;
			color: var(--text-secondary-color);
		}

		li {
			margin-bottom: 0.25rem;
		}

		a {
			color: var(--link-color);
			text-decoration: none;

			&:hover {
				text-decoration: underline;
			}
		}
	}
</style>
