<script lang="ts">
	import { fileState } from '$lib/file-state.svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { ShieldAlert } from '@lucide/svelte';
	import GeoDataChip from './geo-data-chip.svelte';
	import GeoEditPopover from './geo-edit-popover.svelte';
	import Thumbnail from './thumbnail.svelte';

	let { file, index } = $props();

	// Derived states - zentrale Quelle für alle Zustände
	let metadata = $derived(fileState.getMetadata(file));
	let metadataError = $derived(fileState.getMetadataError(file));
	let isLoading = $derived(fileState.isLoading(file));
	let isSelected = $derived(fileState.isSelected(file));
	let isMapFocused = $derived(mapState.isFocused(file));
	let hasGeoData = $derived(metadata?.geoLocation !== undefined && metadata?.geoLocation !== null);

	// Computed values für Template
	let cardClasses = $derived.by(() => {
		const classes = ['upload-item'];
		if (hasGeoData) classes.push('has-location');
		if (isMapFocused) classes.push('map-focus');
		return classes.join(' ');
	});

	let canInteract = $derived(hasGeoData);
	let checkboxClasses = $derived(hasGeoData ? 'clickable-icon' : 'clickable-disabled');

	// Event handlers
	function handleUpdateGeo(coords: { latitude: number; longitude: number }) {
		const lat = Number(coords.latitude);
		const lng = Number(coords.longitude);

		if (!isNaN(lat) && !isNaN(lng)) {
			fileState.updateGeolocation(file, lat, lng);
		}
	}

	function handleRemove() {
		fileState.removeFile(file);
	}

	function handleSelectionToggle() {
		fileState.toggleSelection(file);
	}

	function handleCardClick(event?: MouseEvent | KeyboardEvent) {
		// Ignore clicks on interactive elements
		if (event instanceof MouseEvent) {
			const target = event.target as HTMLElement | null;
			if (target?.closest('.publish-checkbox') || target?.closest('.close-btn-overlay')) {
				return;
			}
		}

		// Focus marker on map if geo data exists
		if (hasGeoData) {
			mapState.focusMarker(file);
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleCardClick();
		}
	}
</script>

<div
	class={cardClasses}
	role="button"
	tabindex={canInteract ? 0 : -1}
	onclick={handleCardClick}
	onkeydown={handleKeyDown}
>
	<Thumbnail {file} {index} onRemove={handleRemove} />

	<div class="card-body">
		<div>
			<div class="card-header">
				<h3>{file.name}</h3>
			</div>
			<div class="card-footer">
				{#if metadataError}
					<div class="error-state">
						<ShieldAlert size={18} />
						<span>{metadataError}</span>
					</div>
				{:else if isLoading}
					<div class="loading-indicator">
						<span class="spinner"></span>
						<span>Loading Metadata...</span>
					</div>
				{:else}
					<GeoDataChip {index} {hasGeoData} {metadata} />
				{/if}
			</div>
		</div>
		<label class="publish-checkbox {checkboxClasses}">
			<input
				type="checkbox"
				disabled={!hasGeoData}
				checked={isSelected}
				onchange={handleSelectionToggle}
			/>
		</label>
	</div>
</div>

<GeoEditPopover
	{index}
	initialLat={metadata?.geoLocation?.latitude}
	initialLng={metadata?.geoLocation?.longitude}
	onSave={handleUpdateGeo}
/>

<style>
	.upload-item {
		border-radius: 8px;
		border: 1px solid var(--border-accent-color);
		/* Stellt sicher, dass Buttons innerhalb der Card bleiben */
		overflow: hidden;
		outline: none;

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

		.card-body {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding-block: 12px;
			padding-inline: 16px;
		}
	}

	.card-header {
		margin-bottom: 3px;

		h3 {
			max-width: 300px;
			font-size: 14px;
			font-weight: 500;
			color: rgb(32, 33, 36);
			margin: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.card-footer {
		display: flex;
		justify-content: flex-start;
		gap: 1.5rem;
		font-size: 0.75rem;
		color: rgb(95, 99, 104);
	}

	.publish-checkbox {
		display: grid;
		place-items: center;

		input[type='checkbox'] {
			width: 18px;
			height: 18px;
			cursor: pointer;
			/* accent-color: hsl(142, 79%, 40%); */
			accent-color: hsl(115, 65%, 40%);
		}
	}

	/* ====================== */

	.map-focus {
		background-color: #0062ff33;
		color: #3b82f6;
		border-color: #3b82f6;
		border-style: solid;
		border-width: 1px;
	}

	/* ====================== */

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

	/* ====================== */
	.error-state {
		color: hsl(0, 75%, 50%);
		border: 1px solid hsl(0, 75%, 50%);
		background-color: hsl(0, 75%, 50%, 0.125);

		svg {
			stroke: hsl(0, 75%, 50%);
		}
	}
</style>
