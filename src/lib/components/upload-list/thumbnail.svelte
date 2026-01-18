<script lang="ts">
	import { getThumbnail } from '$lib/utils/image-helpers';
	import { fileState } from '$lib/file-state.svelte';
	import { ImagePlay, Trash2 } from '@lucide/svelte';

	let { file, index, onRemove } = $props<{
		file: File;
		index: number;
		onRemove: () => void;
	}>();

	// Check cache first for instant display after navigation
	let cachedUrl = $derived(fileState.thumbnailCache.get(file));
	let thumbUrl = $state<string>('');
	let isLoading = $state(true);
	let hasError = $state(false);

	// Use cached thumbnail or generate new one
	$effect(() => {
		// If already cached, use immediately
		if (cachedUrl) {
			thumbUrl = cachedUrl;
			isLoading = false;
			hasError = false;
			return;
		}

		// Generate new thumbnail
		isLoading = true;
		getThumbnail(file)
			.then((url) => {
				thumbUrl = url;
				// Store in persistent cache
				fileState.thumbnailCache.set(file, url);
				isLoading = false;
				hasError = false;
			})
			.catch((err) => {
				console.error(`Thumbnail generation failed for ${file.name}:`, err);
				// Fallback placeholder
				const placeholder =
					'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Preview%3C/text%3E%3C/svg%3E';
				thumbUrl = placeholder;
				fileState.thumbnailCache.set(file, placeholder);
				isLoading = false;
				hasError = true;
			});

		// No cleanup here - cache handles blob URL lifecycle
	});
</script>

<div class="thumbnail-container">
	{#if isLoading}
		<div class="loading-indicator" style="anchor-name: --image-anchor-{index}">
			<span class="spinner"></span>
			<span>Generating Thumbnail...</span>
		</div>
	{:else}
		<img src={thumbUrl} alt={file.name} style="anchor-name: --image-anchor-{index}" />
	{/if}

	<button
		class="clickable-icon btn-overlay delete-btn"
		style="position-anchor: --image-anchor-{index}"
		aria-label="Remove photo"
		onclick={onRemove}
		title="Remove photo"
	>
		<Trash2 size={22} />
	</button>

	<button
		class="clickable-icon btn-overlay view-btn"
		style="position-anchor: --image-anchor-{index}"
		aria-label="View as 360 panorama"
		onclick={() => fileState.openPanorama(file)}
		title="View as 360 panorama"
	>
		<ImagePlay size={22} />
	</button>
</div>

<style>
	.thumbnail-container {
		button {
			position: absolute;
			top: anchor(top);
			margin-top: 8px;
		}

		.delete-btn {
			left: anchor(left);
			margin-inline: 8px;
		}

		.view-btn {
			right: anchor(right);
			margin-inline: 8px;
		}
	}

	.thumbnail-container {
		position: relative;
	}

	img {
		display: block;
		width: 100%;
		height: 180px;
		object-fit: cover;
		border-radius: 8px 8px 0 0;
		/* anchor-name is set inline via style="{index}" */
	}

	.loading-indicator {
		height: 180px;
		background-color: var(--surface-subtle);
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: var(--text-default);
	}

	.btn-overlay {
		background-color: var(--button-dark-overlay);
		color: var(--text-white);

		&:hover {
			background-color: var(--button-dark-overlay-hover);
		}

		&:active {
			background-color: var(--button-dark-overlay-active);
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 576px) {
		img {
			height: 120px;
		}
		.loading-indicator {
			height: 120px;
		}
	}
</style>
