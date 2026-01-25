<script lang="ts">
	import { Eraser, MapPinHouse, Search } from '@lucide/svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { searchState } from '$lib/search-state.svelte';
	import SearchSuggestions from './search-suggestions.svelte';

	// Element references
	let inputElement = $state<HTMLInputElement | null>(null);
	let popoverElement = $state<HTMLElement | null>(null);

	// Popover ID for anchor positioning
	const popoverId = 'search-suggestions-popover';
	const anchorName = '--search-input-anchor';

	// Check if route is "/"
	const isHomePage = $derived(browser && page.url.pathname === '/');

	// Popover control functions
	function openDropdown() {
		popoverElement?.showPopover();
	}

	function closeDropdown() {
		popoverElement?.hidePopover();
	}

	// Enhanced handlers that also control the dropdown
	function handleSelectSuggestion(feature: import('$lib/types/geocoding').GeocodingFeature) {
		searchState.selectSuggestion(feature);
		closeDropdown();
	}

	function handleClearSearch() {
		searchState.clearSearch();
		closeDropdown();
		inputElement?.focus();
	}

	async function handleFocusUserLocation() {
		await searchState.focusUserLocation();
	}

	function handleKeydown(event: KeyboardEvent) {
		const isOpen = popoverElement?.matches(':popover-open');
		const shouldClose = searchState.handleKeydown(event, isOpen || false);
		if (shouldClose) {
			closeDropdown();
		}
	}

	// Watch for showDropdown changes to open/close popover
	$effect(() => {
		if (searchState.showDropdown) {
			openDropdown();
		} else if (!searchState.showDropdown && popoverElement?.matches(':popover-open')) {
			closeDropdown();
		}
	});
</script>

{#if isHomePage}
	<div class="search-container" style="anchor-name: {anchorName};">
		<button
			class="clickable-icon"
			title={searchState.isSearchEnabled ? 'Search' : 'Accept cookies to enable search'}
			disabled={!searchState.isSearchEnabled}
			onclick={searchState.handleSearchClick}
		>
			<Search />
		</button>
		<input
			bind:this={inputElement}
			type="text"
			placeholder={searchState.isSearchEnabled ? 'Search location...' : 'Accept cookies to search'}
			class="search-input"
			value={searchState.searchQuery}
			oninput={searchState.handleInput}
			onkeydown={handleKeydown}
			disabled={!searchState.isSearchEnabled}
		/>
		{#if searchState.searchQuery && searchState.isSearchEnabled}
			<button class="clickable-icon clear-btn" onclick={handleClearSearch} title="Clear search">
				<Eraser size={18} />
			</button>
		{/if}
		<button
			class="clickable-icon"
			onclick={handleFocusUserLocation}
			title={searchState.isSearchEnabled
				? 'Focus your location'
				: 'Accept cookies to enable location'}
			disabled={!searchState.isSearchEnabled}
		>
			<MapPinHouse />
		</button>
	</div>

	<div
		bind:this={popoverElement}
		popover="manual"
		id={popoverId}
		class="autocomplete-dropdown"
		style="position-anchor: {anchorName};"
	>
		{#if searchState.showDropdown}
			<SearchSuggestions
				suggestions={searchState.suggestions}
				isLoading={searchState.isLoading}
				selectedIndex={searchState.selectedIndex}
				onSelect={handleSelectSuggestion}
			/>
		{/if}
	</div>
{/if}

<style>
	.search-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		border: none;
		border-radius: 100vmax;
		padding: 0.25rem 0.5rem;
		background-color: var(--surface-subtle);
		max-width: 600px;
		min-width: 360px;
		margin: 0 auto;
	}

	.search-container:has(+ .autocomplete-dropdown:popover-open) {
		border-radius: 1.5rem 1.5rem 0 0;
	}

	.search-input {
		flex: 1;
		border: none;
		background-color: transparent;
		font-size: 16px; /* Prevents iOS zoom on focus */
		color: var(--text-default);
		border-radius: 100vmax;
		padding: 0.5rem;

		&::placeholder {
			color: var(--text-subtle);
		}

		&:focus-visible {
			outline: 2px solid var(--button-primary);
		}

		&:disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
	}

	.clickable-icon:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	.autocomplete-dropdown {
		position: absolute;
		inset: auto;
		top: anchor(bottom);
		left: anchor(left);
		right: anchor(right);
		width: anchor-size(width);

		background-color: var(--surface-base);
		border: none;
		border-radius: 0 0 1.5rem 1.5rem;
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
		max-height: 320px;
		overflow-y: auto;
		margin: 0;
		padding: 0;
	}
</style>
