<script lang="ts">
	import type { GeocodingFeature } from '$lib/types/geocoding';

	let {
		suggestions,
		isLoading,
		selectedIndex,
		onSelect
	}: {
		suggestions: GeocodingFeature[];
		isLoading: boolean;
		selectedIndex: number;
		onSelect: (feature: GeocodingFeature) => void;
	} = $props();
</script>

{#if isLoading}
	<div class="loading">Suche...</div>
{:else}
	{#each suggestions as suggestion, index}
		<button
			class="suggestion-item"
			class:selected={index === selectedIndex}
			onclick={() => onSelect(suggestion)}
		>
			<div class="suggestion-text">{suggestion.text}</div>
			<div class="suggestion-place-name">{suggestion.place_name}</div>
		</button>
	{/each}
{/if}

<style>
	.loading {
		padding: 1rem;
		text-align: center;
		color: var(--text-secondary);
		font-size: 14px;
	}

	.suggestion-item {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: none;
		background-color: transparent;
		text-align: left;
		cursor: pointer;
		transition: background-color 0.15s;
		border-bottom: 1px solid var(--border-subtle);

		&:last-child {
			border-bottom: none;
		}

		&:hover,
		&.selected {
			background-color: var(--surface-subtle);
		}
	}

	.suggestion-text {
		font-size: 14px;
		font-weight: 500;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.suggestion-place-name {
		font-size: 12px;
		color: var(--text-secondary);
	}
</style>
