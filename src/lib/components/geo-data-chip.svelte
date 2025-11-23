<script lang="ts">
	import { MapPin } from '@lucide/svelte';

	let { index, hasGeoData, metadata } = $props();
</script>

<button
	class="geo-data"
	style="anchor-name: --geo-data-anchor-{index};"
	popovertarget="geo-popover-{index}"
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

		background-color: rgba(30, 225, 90, 0.1);
		color: rgb(35, 190, 85);

		&:hover {
			background-color: rgba(30, 225, 90, 0.15);
		}

		&:active {
			background-color: rgba(30, 225, 90, 0.2);
		}

		&:focus-visible {
			outline: 2px solid rgb(35, 190, 85);
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
		background-color: rgba(223, 32, 32, 0.1);
		color: rgb(223, 32, 32);

		&:hover {
			background-color: rgba(223, 32, 32, 0.15);
		}

		&:active {
			background-color: rgba(223, 32, 32, 0.2);
		}

		&:focus-visible {
			outline: 2px solid rgb(223, 32, 32);
		}
	}
</style>
