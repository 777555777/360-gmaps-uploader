<script lang="ts">
	import { onMount } from 'svelte';
	import Map from '$lib/components/map.svelte';
	import Header from '$lib/components/header.svelte';
	import Sidebar from '$lib/components/sidebar.svelte';
	import Dialog from '$lib/components/dialog.svelte';
	import { PUBLISH_DIALOG_ID, UPLOAD_DIALOG_ID } from '$lib/globals';
	import UploadArea from '$lib/components/upload-area.svelte';
	import { fileState } from '$lib/file-state.svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { closeDialogById } from '$lib/utils/dialog-helpers';
	import { authState } from '$lib/auth-state.svelte';
	import LoginBtn from '$lib/components/login-btn.svelte';

	let selectedFiles = $derived(fileState.selectedFiles);

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

		return () => {
			window.removeEventListener('pointerdown', handleGlobalPointerDown);
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

<Header />

<main>
	<Sidebar />
	<Map />
	<Dialog dialogId={UPLOAD_DIALOG_ID} title="360 Photo Upload" body={uploadDialogContent} />
	<Dialog dialogId={PUBLISH_DIALOG_ID} title="Publish Photos" body={publishDialogContent} />
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

	@media (width < 768px) {
		main {
			display: flex;
			flex-direction: column-reverse;
			gap: 1rem;
		}
	}
</style>
