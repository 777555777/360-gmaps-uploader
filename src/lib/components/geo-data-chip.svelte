<script lang="ts">
	let { index, hasGeoData, metadata } = $props();
</script>

<button
	class="geo-data"
	style="anchor-name: --geo-data-anchor-{index};"
	popovertarget="geo-popover-{index}"
>
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

		background-color: rgba(30, 225, 90, 0.1);
		color: rgb(35, 190, 85);

		svg {
			stroke: rgb(35, 190, 85);
		}

		&:hover {
			background-color: rgba(30, 225, 90, 0.15);
		}

		&:active {
			background-color: rgba(30, 225, 90, 0.2);
		}

		&:focus-visible {
			outline: 2px solid rgb(35, 190, 85);
		}

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
	}

	.geo-data:has(.no-data) {
		background-color: rgba(223, 32, 32, 0.1);
		color: rgb(223, 32, 32);

		svg {
			stroke: rgb(223, 32, 32);
		}

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
