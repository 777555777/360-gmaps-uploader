<script lang="ts">
	import { fileState } from '$lib/file-state.svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { Globe, MapPin, ShieldAlert } from '@lucide/svelte';
	import GeoEditPopover from './geo-edit-popover.svelte';
	import Thumbnail from './thumbnail.svelte';
	import Badge from '../util/badge.svelte';
	import { stopEventPropagation } from '$lib/utils/ui-helper';

	let { file, index } = $props();

	let metadata = $derived(fileState.getMetadata(file));
	let metadataError = $derived(fileState.getMetadataError(file));
	let isLoading = $derived(fileState.isLoading(file));
	let isSelected = $derived(fileState.isSelected(file));
	let isPublished = $derived(fileState.isPublished(file));
	let isMapFocused = $derived(mapState.isFocused(file));
	let hasGeoData = $derived(metadata?.geoLocation !== undefined && metadata?.geoLocation !== null);

	let cardClasses = $derived.by(() => {
		const classes = ['upload-item'];
		if (isMapFocused) classes.push('map-focus');
		return classes.join(' ');
	});

	let canInteract = $derived(hasGeoData);
	let canSelect = $derived(hasGeoData && !isPublished);
	let checkboxClasses = $derived(canSelect ? 'clickable-icon' : 'clickable-disabled');

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
			if (
				target?.closest('.publish-checkbox') ||
				target?.closest('.close-btn-overlay') ||
				target?.closest('.geo-data') ||
				target?.closest('.badge')
			) {
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
					<!-- Red Error Badge -->
					<Badge message={metadataError} level="danger">
						{#snippet icon()}
							<ShieldAlert size={16} />
						{/snippet}
					</Badge>
				{:else if isLoading}
					<div class="loading-indicator">
						<span class="spinner"></span>
						<span>Loading Metadata...</span>
					</div>
				{:else if hasGeoData && metadata?.geoLocation && !isPublished}
					<!-- Green Geo-Data Button Badge -->
					<Badge
						message={`${metadata.geoLocation.latitude.toFixed(5)}° | ${metadata.geoLocation.longitude.toFixed(5)}°`}
						level="success"
						anchorName={`geo-data-anchor-${index}`}
						popoverTarget={`geo-popover-${index}`}
						title="Edit GPS Data"
					>
						{#snippet icon()}
							<MapPin size={16} />
						{/snippet}
					</Badge>
				{:else if hasGeoData && metadata?.geoLocation && isPublished}
					<!-- Grey Geo-Data Badge + Grey Icon-Badge -->
					<Badge
						message={`${metadata.geoLocation.latitude.toFixed(5)}° | ${metadata.geoLocation.longitude.toFixed(5)}°`}
						level="neutral"
						anchorName={`geo-data-anchor-${index}`}
						popoverTarget={`geo-popover-${index}`}
						title="Edit GPS Data"
						disabled={true}
					>
						{#snippet icon()}
							<MapPin size={16} />
						{/snippet}
					</Badge>
					<Badge message={''} level="neutral" title="Published to Google Maps">
						{#snippet icon()}
							<Globe size={16} />
						{/snippet}
					</Badge>
				{:else}
					<!-- Red Geo-Data Button Badge -->
					<Badge
						level="danger"
						anchorName={`geo-data-anchor-${index}`}
						popoverTarget={`geo-popover-${index}`}
						title="Edit GPS Data"
					>
						{#snippet message()}
							<span class="desktop-text">Click to add GPS data</span>
							<span class="mobile-text">Tap to add GPS data</span>
						{/snippet}
						{#snippet icon()}
							<MapPin size={16} />
						{/snippet}
					</Badge>
				{/if}
			</div>
		</div>
		<label
			class="publish-checkbox {checkboxClasses}"
			title={isPublished ? 'Already Published' : 'Select Photo for Publishing'}
		>
			<input
				type="checkbox"
				disabled={!canSelect}
				checked={isSelected}
				onchange={handleSelectionToggle}
				onkeydown={stopEventPropagation}
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
		border: 1px solid var(--border-subtle);
		/* Ensures that buttons stay within the card */
		overflow: hidden;
		outline: none;
		background-color: var(--card-bg);

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
			max-width: 280px;
			font-size: 14px;
			font-weight: 500;
			margin: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	@media (max-width: 476px) {
		.card-header h3 {
			max-width: 240px;
		}
	}

	@media (max-width: 396px) {
		.card-header h3 {
			max-width: 200px;
		}

		.upload-item {
			.card-body {
				padding-block: 8px;
				padding-inline: 12px;
			}
		}
	}

	.mobile-text {
		display: none;
	}
	.desktop-text {
		display: inline;
	}

	@media (pointer: coarse) {
		.mobile-text {
			display: inline;
		}
		.desktop-text {
			display: none;
		}
	}

	.card-footer {
		display: flex;
		justify-content: flex-start;
		gap: 0.5rem;
	}

	.publish-checkbox {
		display: grid;
		place-items: center;

		input[type='checkbox'] {
			width: 18px;
			height: 18px;
			cursor: pointer;
			accent-color: var(--checkbox-accent);
		}
	}

	/* ====================== */

	.map-focus {
		background-color: var(--chip-primary-bg);
		color: var(--chip-primary-fg);
		border-color: var(--chip-primary-fg);
		border-style: solid;
		border-width: 1px;
	}
</style>
