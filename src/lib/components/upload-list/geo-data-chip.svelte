<script lang="ts">
	import { MapPin } from '@lucide/svelte';

	let { index, hasGeoData, metadata, isPublished = false } = $props();
</script>

<button
	class="geo-data"
	style="anchor-name: --geo-data-anchor-{index};"
	popovertarget="geo-popover-{index}"
	title={isPublished ? 'Already Published - GPS Data Locked' : 'Edit GPS Data'}
	disabled={isPublished}
>
	<MapPin size={18} />
	{#if hasGeoData && metadata?.geoLocation}
		<div class="coordinates">
			<span>{metadata?.geoLocation.latitude.toFixed(5)}°</span>
			<span class="separator">|</span>
			<span>{metadata?.geoLocation.longitude.toFixed(5)}°</span>
		</div>
	{:else}
		<span class="no-data">Click to add GPS data</span>
	{/if}
</button>

<style>
	.geo-data {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 4px 8px;
		border-radius: 6px;
		border: none;
		max-width: 12rem;
		text-overflow: ellipsis;
		border-radius: 100vmax;
		cursor: pointer;
		font-size: 13px;
		line-height: normal;

		background-color: var(--chip-success-bg);
		color: var(--chip-success-fg);

		&:hover {
			background-color: var(--chip-success-hover-bg);
		}

		&:active {
			background-color: var(--chip-success-active-bg);
		}

		&:focus-visible {
			outline: 2px solid var(--chip-success-fg);
		}

		&:disabled {
			background-color: var(--chip-neutral-bg);
			color: var(--chip-neutral-fg);
		}

		.coordinates {
			display: flex;
			gap: 0.25rem;
			font-variant-numeric: tabular-nums;
		}

		.separator {
			opacity: 0.5;
		}
	}

	.geo-data:has(.no-data) {
		background-color: var(--chip-danger-bg);
		color: var(--chip-danger-fg);

		&:hover {
			background-color: var(--chip-danger-hover-bg);
		}

		&:active {
			background-color: var(--chip-danger-active-bg);
		}

		&:focus-visible {
			outline: 2px solid var(--chip-danger-fg);
		}
	}
</style>
