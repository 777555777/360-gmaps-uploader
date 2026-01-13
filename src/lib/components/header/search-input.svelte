<script lang="ts">
	import { Eraser, MapPinHouse, Search, X } from '@lucide/svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { consentState } from '$lib/consent-state.svelte';
	import type { GeocodingFeature } from '$lib/types/geocoding';
	import { browser } from '$app/environment';
	import SearchSuggestions from './search-suggestions.svelte';
	import { page } from '$app/state';

	// State
	let searchQuery = $state('');
	let suggestions = $state<GeocodingFeature[]>([]);
	let isLoading = $state(false);
	let selectedIndex = $state(-1);
	let lastSelectedFeature = $state<GeocodingFeature | null>(null);
	let abortController: AbortController | null = null;
	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	// Rate limiting (max 15 requests per minute to be safe)
	const MAX_REQUESTS_PER_MINUTE = 15;
	let requestTimestamps: number[] = [];

	// Element references
	let inputElement: HTMLInputElement;
	let popoverElement: HTMLElement;

	// Popover ID for anchor positioning
	const popoverId = 'search-suggestions-popover';
	const anchorName = '--search-input-anchor';

	// Check if search is enabled (requires consent) and route is "/"
	const isSearchEnabled = $derived(
		consentState.hasConsented() === true && page.url.pathname === '/'
	);

	// Derived: should show dropdown content
	const showDropdown = $derived(suggestions.length > 0 || isLoading);

	// Focus on user's geolocation
	async function focusUserLocation() {
		await mapState.focusUserLocation();
	}

	// Check if we're within rate limit
	function isWithinRateLimit(): boolean {
		const now = Date.now();
		const oneMinuteAgo = now - 60000;

		// Remove timestamps older than 1 minute
		requestTimestamps = requestTimestamps.filter((ts) => ts > oneMinuteAgo);

		// Check if we can make another request
		if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
			console.warn('Rate limit reached. Please wait before searching again.');
			return false;
		}

		// Add current timestamp
		requestTimestamps.push(now);
		return true;
	}

	// Popover control functions
	function openDropdown() {
		popoverElement?.showPopover();
	}

	function closeDropdown() {
		popoverElement?.hidePopover();
	}

	// Debounced search function
	async function searchLocations(query: string) {
		if (!browser || !isSearchEnabled) return;

		// Cancel previous request
		abortController?.abort();

		// Clear previous debounce
		if (debounceTimeout) clearTimeout(debounceTimeout);

		// If query is empty, clear suggestions
		if (!query.trim()) {
			suggestions = [];
			closeDropdown();
			return;
		}

		// Debounce for 500ms (conservative to avoid too many requests)
		debounceTimeout = setTimeout(async () => {
			if (!isWithinRateLimit()) return;

			isLoading = true;
			openDropdown();
			abortController = new AbortController();

			try {
				const response = await fetch(
					`/api/geocoding?q=${encodeURIComponent(query)}&limit=5&autocomplete=true`,
					{ signal: abortController.signal }
				);

				if (!response.ok) throw new Error('Geocoding request failed');

				const data = await response.json();
				suggestions = data.features || [];
				selectedIndex = suggestions.length > 0 ? 0 : -1;

				if (suggestions.length > 0) {
					openDropdown();
				} else {
					closeDropdown();
				}
			} catch (error) {
				if (error instanceof Error && error.name !== 'AbortError') {
					console.error('Search error:', error);
				}
				suggestions = [];
				closeDropdown();
			} finally {
				isLoading = false;
			}
		}, 400);
	}

	// Handle input change
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		searchQuery = target.value;
		searchLocations(searchQuery);
	}

	// Select a suggestion and focus map
	function selectSuggestion(feature: GeocodingFeature) {
		searchQuery = feature.place_name;
		lastSelectedFeature = feature;
		const [lng, lat] = feature.center;

		// Use bbox if available for better framing, otherwise use center with zoom 14
		if (feature.bbox) {
			mapState.focusBounds(feature.bbox[1], feature.bbox[0], feature.bbox[3], feature.bbox[2]);
		} else {
			mapState.focusLocation(lat, lng, 14);
		}

		suggestions = [];
		closeDropdown();
	}

	// Clear search
	function clearSearch() {
		searchQuery = '';
		suggestions = [];
		selectedIndex = -1;
		lastSelectedFeature = null;
		closeDropdown();
		inputElement?.focus();
	}

	// Handle search button click (first suggestion or last selected)
	function handleSearchClick() {
		if (suggestions.length > 0) {
			selectSuggestion(suggestions[0]);
		} else if (lastSelectedFeature) {
			selectSuggestion(lastSelectedFeature);
		}
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		const isOpen = popoverElement?.matches(':popover-open');

		switch (event.key) {
			case 'ArrowDown':
				if (!isOpen || suggestions.length === 0) return;
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
				break;
			case 'ArrowUp':
				if (!isOpen || suggestions.length === 0) return;
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				break;
			case 'Enter':
				event.preventDefault();
				if (isOpen && suggestions.length > 0) {
					const indexToSelect = selectedIndex >= 0 ? selectedIndex : 0;
					selectSuggestion(suggestions[indexToSelect]);
				} else if (lastSelectedFeature && searchQuery === lastSelectedFeature.place_name) {
					selectSuggestion(lastSelectedFeature);
				}
				break;
			case 'Escape':
				if (!isOpen) return;
				event.preventDefault();
				closeDropdown();
				selectedIndex = -1;
				break;
		}
	}
</script>

<div class="search-container" style="anchor-name: {anchorName};">
	<button
		class="clickable-icon"
		title={isSearchEnabled ? 'Search' : 'Accept cookies to enable search'}
		disabled={!isSearchEnabled}
		onclick={handleSearchClick}
	>
		<Search />
	</button>
	<input
		bind:this={inputElement}
		type="text"
		placeholder={isSearchEnabled ? 'Search location...' : 'Accept cookies to search'}
		class="search-input"
		value={searchQuery}
		oninput={handleInput}
		onkeydown={handleKeydown}
		disabled={!isSearchEnabled}
	/>
	{#if searchQuery && isSearchEnabled}
		<button class="clickable-icon clear-btn" onclick={clearSearch} title="Clear search">
			<Eraser size={18} />
		</button>
	{/if}
	<button
		class="clickable-icon"
		onclick={focusUserLocation}
		title={isSearchEnabled ? 'Focus your location' : 'Accept cookies to enable location'}
		disabled={!isSearchEnabled}
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
	{#if showDropdown}
		<SearchSuggestions {suggestions} {isLoading} {selectedIndex} onSelect={selectSuggestion} />
	{/if}
</div>

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
		font-size: 14px;
		color: var(--text-primary);
		border-radius: 100vmax;
		padding: 0.5rem;

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
