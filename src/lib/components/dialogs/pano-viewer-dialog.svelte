<script lang="ts">
	import { Viewer } from '@photo-sphere-viewer/core';
	import '@photo-sphere-viewer/core/index.css';
	import { onMount, onDestroy } from 'svelte';

	let { file } = $props<{
		file: File;
	}>();

	let viewerContainer: HTMLDivElement;
	let viewer: Viewer | null = null;
	let objectUrl: string | null = null;

	onMount(() => {
		// Warte bis nächster Tick um sicherzustellen dass Container im DOM ist
		setTimeout(() => {
			if (!viewerContainer) return;

			// Erstelle Object URL für das File
			objectUrl = URL.createObjectURL(file);

			// Initialisiere Photo Sphere Viewer
			try {
				viewer = new Viewer({
					container: viewerContainer,
					panorama: objectUrl
				});
			} catch (error) {
				console.error('Failed to initialize Photo Sphere Viewer:', error);
			}
		}, 0);
	});

	onDestroy(() => {
		// Cleanup: Viewer zerstören und Object URL freigeben
		if (viewer) {
			viewer.destroy();
			viewer = null;
		}
		if (objectUrl) {
			URL.revokeObjectURL(objectUrl);
			objectUrl = null;
		}
	});
</script>

<div class="pano-viewer-container" bind:this={viewerContainer}></div>

<style>
	.pano-viewer-container {
		width: 100%;
		height: 600px;
		min-height: 400px;
	}
</style>
