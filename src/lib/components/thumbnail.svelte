<script lang="ts">
	import { getThumbnail } from '$lib/utils/image-helpers';

	let { file, index, onRemove } = $props<{
		file: File;
		index: number;
		onRemove: () => void;
	}>();

	let thumbUrl = $state<string>('');
	let isLoading = $state(true);
	let hasError = $state(false);

	// Erstelle Object URL für das Bild und räume auf
	$effect(() => {
		getThumbnail(file)
			.then((url) => {
				thumbUrl = url;
				isLoading = false;
				hasError = false;
			})
			.catch((err) => {
				console.error(`Thumbnail generation failed for ${file.name}:`, err);
				// Fallback zu data URL placeholder
				thumbUrl =
					'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Preview%3C/text%3E%3C/svg%3E';
				isLoading = false;
				hasError = true;
			});

		return () => {
			if (thumbUrl && thumbUrl.startsWith('blob:')) {
				URL.revokeObjectURL(thumbUrl);
			}
		};
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
		class="clickable-icon close-btn-overlay"
		aria-label="Löschen"
		style="position-anchor: --image-anchor-{index}"
		onclick={onRemove}
	>
		<!-- close icon -->
		<svg
			class="svg-icon"
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 28 28"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		>
			<line x1="20" y1="8" x2="8" y2="20"></line>
			<line x1="8" y1="8" x2="20" y2="20"></line>
		</svg>
	</button>
</div>

<style>
	.thumbnail-container {
		position: relative;
	}

	img {
		display: block;
		width: 100%;
		height: 200px;
		object-fit: cover;
		border-radius: 8px 8px 0 0;
		/* anchor-name wird inline per style="{index}" gesetzt */
	}

	.loading-indicator {
		height: 200px;
		background-color: #d8e6fd;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
		color: rgb(95, 99, 104);
	}

	.close-btn-overlay {
		/* CSS Anchor Positioning */
		position: absolute;
		/* position-anchor wird inline per style="{index}" gesetzt */

		/* Positionierung: Top-Right mit 8px Abstand */
		top: anchor(top);
		right: anchor(right);
		margin-top: 8px;
		margin-right: 8px;

		/* Overlay-spezifisches Styling */
		background-color: rgba(75, 75, 75, 0.75);
		color: white;
	}

	.spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid rgba(95, 99, 104, 0.3);
		border-top-color: rgb(95, 99, 104);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
