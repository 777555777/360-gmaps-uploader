<script lang="ts">
	import { fileState } from '$lib/file-state.svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { getThumbnail } from '$lib/utils/image-helpers';

	let { file, index } = $props();

	let metadata = $derived(fileState.getMetadata(file));
	let metadataError = $derived(fileState.getMetadataError(file));
	let isSelected = $derived(fileState.isSelected(file));
	let isMapFocused = $derived(mapState.isFocused(file));
	let thumbUrl = $state<string>('');
	let isLoadingThumbnail = $state(true);
	let thumbnailError = $state(false);

	function isLoading(file: File) {
		return fileState.isLoading(file);
	}

	function handleRemove() {
		fileState.removeFile(file);
	}

	function handleSelectionToggle() {
		fileState.toggleSelection(file);
	}

	function handleCardClick(event?: MouseEvent | KeyboardEvent) {
		if (event instanceof MouseEvent) {
			const target = event.target as HTMLElement | null;
			if (target?.closest('.publish-checkbox') || target?.closest('.close-btn-overlay')) {
				return;
			}
		}

		if (metadata?.geoLocation) {
			mapState.focusMarker(file);
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCardClick();
		}
	}

	// Erstelle Object URL für das Bild und räume auf
	$effect(() => {
		getThumbnail(file)
			.then((url) => {
				thumbUrl = url;
				isLoadingThumbnail = false;
				thumbnailError = false;
			})
			.catch((err) => {
				console.error(`Thumbnail generation failed for ${file.name}:`, err);
				// Fallback zu data URL placeholder
				thumbUrl =
					'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Preview%3C/text%3E%3C/svg%3E';
				isLoadingThumbnail = false;
				thumbnailError = true;
			});

		return () => {
			if (thumbUrl && thumbUrl.startsWith('blob:')) {
				URL.revokeObjectURL(thumbUrl);
			}
		};
	});
</script>

<div
	class="upload-item {metadata?.geoLocation ? 'has-location' : ''} {isMapFocused
		? 'map-focus'
		: ''}"
	role="button"
	tabindex={metadata?.geoLocation ? 0 : -1}
	onclick={handleCardClick}
	onkeydown={handleKeyDown}
>
	{#if isLoadingThumbnail}
		<div
			class="loading-indicator thumbnail-loading-position"
			style="anchor-name: --image-anchor-{index}"
		>
			<span class="spinner"></span>
			<span>Loading Thumbnail...</span>
		</div>
	{:else}
		<img src={thumbUrl} alt={file.name} style="anchor-name: --image-anchor-{index}" />
	{/if}
	<button
		class="clickable-icon close-btn-overlay"
		aria-label="Löschen"
		style="position-anchor: --image-anchor-{index}"
		onclick={handleRemove}
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

	<div class="card-body">
		<div>
			<header>
				<h3>{file.name}</h3>
			</header>

			<footer>
				{#if metadataError}
					<div class="error-state">
						<svg
							class="svg-icon"
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<circle cx="12" cy="12" r="10"></circle>
							<line x1="12" y1="8" x2="12" y2="12"></line>
							<line x1="12" y1="16" x2="12.01" y2="16"></line>
						</svg>
						<span>{metadataError}</span>
					</div>
				{:else if isLoading(file)}
					<div class="loading-indicator">
						<span class="spinner"></span>
						<span>Loading Metadata...</span>
					</div>
				{:else}
					<div class="geo-data">
						<!-- map-pin -->
						<svg
							class="svg-icon"
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
							<circle cx="12" cy="10" r="3"></circle>
						</svg>
						{#if metadata?.geoLocation}
							<div class="coordinates">
								<span>{metadata.geoLocation.latitude.toFixed(5)}°</span>
								<span class="separator">|</span>
								<span>{metadata.geoLocation.longitude.toFixed(5)}°</span>
							</div>
						{:else}
							<span class="no-data">No GPS data</span>
						{/if}
					</div>
					<div class="file-size">
						<!-- file icon -->
						<svg
							class="svg-icon"
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
							<polyline points="14 2 14 8 20 8"></polyline>
							<line x1="16" y1="13" x2="8" y2="13"></line>
							<line x1="16" y1="17" x2="8" y2="17"></line>
							<line x1="10" y1="9" x2="8" y2="9"></line>
						</svg>

						<span>{metadata?.fileSizeFormatted || 'N/A'}</span>
					</div>
				{/if}
			</footer>
		</div>
		<label
			class="publish-checkbox {!metadata?.geoLocation ? 'clickable-disabled' : 'clickable-icon'}"
		>
			<input
				type="checkbox"
				disabled={!metadata?.geoLocation}
				checked={isSelected}
				onchange={handleSelectionToggle}
			/>
		</label>
	</div>
</div>

<style>
	.upload-item {
		border-radius: 8px;
		border: 1px solid var(--border-accent-color);
		/* Stellt sicher, dass Buttons innerhalb der Card bleiben */
		overflow: hidden;
		outline: none;

		/* border-color: #3b82f6;
		border-style: solid;
		border-width: 2px; */

		&.has-location {
			cursor: pointer;
			transition: box-shadow 0.2s ease;
		}

		&.has-location:hover {
			box-shadow: 0 0 10px rgb(218, 220, 224);
		}

		&.has-location:focus-visible {
			box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.4);
		}

		img {
			display: block;
			width: 100%;
			height: 200px;
			object-fit: cover;
			border-radius: 8px 8px 0 0;
			/* anchor-name wird inline per style="{index}" gesetzt */
		}

		.card-body {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-block: 8px;
			padding-inline: 16px;
		}
	}

	header {
		margin-bottom: 4px;

		h3 {
			max-width: 300px;
			text-overflow: ellipsis;
			font-size: 15px;
			font-weight: 500;
			color: rgb(32, 33, 36);
			margin: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;

			font-size: 16px;
			color: rgb(32, 33, 36);
		}
	}

	footer {
		display: flex;
		justify-content: flex-start;
		gap: 1.5rem;
		font-size: 0.75rem;
		color: rgb(95, 99, 104);

		.geo-data {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 6px;

			.svg-icon {
				flex-shrink: 0;
				color: rgb(95, 99, 104);
			}

			.coordinates {
				display: flex;
				gap: 0.25rem;
				font-variant-numeric: tabular-nums;
			}

			.separator {
				opacity: 0.5;
			}

			.no-data {
				color: rgb(223, 32, 32);
				opacity: 0.7;
				font-style: italic;
			}

			&:has(.no-data) {
				svg {
					stroke: rgb(223, 32, 32);
				}
			}
		}

		.file-size {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			font-variant-numeric: tabular-nums;
		}
	}

	.publish-checkbox {
		display: grid;
		place-items: center;

		input[type='checkbox'] {
			width: 18px;
			height: 18px;
			cursor: pointer;
			accent-color: #16b751;
		}
	}

	/* ====================== */

	.close-btn-overlay {
		/* CSS Anchor Positioning */
		position: absolute;
		/* position-anchor wird inline per style="{index}" gesetzt */

		/* Positionierung: Top-Right mit 8px Abstand */
		top: anchor(top);
		right: anchor(right);
		margin-top: 8px;
		margin-right: 8px;

		/* Alternative Syntax mit inset-area (neuere API) */
		/* position-area: top right; */
		/* inset: 8px 8px auto auto; */

		/* Overlay-spezifisches Styling */
		background-color: rgba(75, 75, 75, 0.75);
		color: white;
	}

	.map-focus {
		background-color: #0062ff33;
		color: #3b82f6;
		border-color: #3b82f6;
		border-style: solid;
		border-width: 1px;
	}

	/* ====================== */

	.thumbnail-loading-position {
		height: 200px;
		background-color: #d8e6fd;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.error-state {
		display: flex;
		align-items: center;
		gap: 6px;
		color: rgb(223, 32, 32);
		font-size: 0.75rem;
		font-style: italic;

		.svg-icon {
			flex-shrink: 0;
		}
	}
</style>
