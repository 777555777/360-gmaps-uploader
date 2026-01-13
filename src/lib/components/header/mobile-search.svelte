<script lang="ts">
	import { Eraser, MapPinHouse, Search, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { consentState } from '$lib/consent-state.svelte';
	import type { GeocodingFeature } from '$lib/types/geocoding';
	import SearchSuggestions from './search-suggestions.svelte';

	// State
	let searchQuery = $state('');
	let suggestions = $state<GeocodingFeature[]>([]);
	let isLoading = $state(false);
	let selectedIndex = $state(-1);
	let lastSelectedFeature = $state<GeocodingFeature | null>(null);
	let abortController: AbortController | null = null;
	let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
	let mounted = $state(false);

	// Rate limiting (max 15 requests per minute to be safe)
	const MAX_REQUESTS_PER_MINUTE = 15;
	let requestTimestamps: number[] = [];

	// Element references
	let inputElement: HTMLInputElement;
	let popoverElement: HTMLElement;

	// Popover ID
	const popoverId = 'mobile-search-popover';

	// Check if search is enabled (requires consent)
	const isSearchEnabled = $derived(consentState.hasConsented() === true);

	// Derived: should show suggestions
	const showSuggestions = $derived(suggestions.length > 0 || isLoading);

	// Focus on user's geolocation
	async function focusUserLocation() {
		await mapState.focusUserLocation();
		closeOverlay();
	}

	// Check if we're within rate limit
	function isWithinRateLimit(): boolean {
		const now = Date.now();
		const oneMinuteAgo = now - 60000;

		requestTimestamps = requestTimestamps.filter((ts) => ts > oneMinuteAgo);

		if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
			console.warn('Rate limit reached. Please wait before searching again.');
			return false;
		}

		requestTimestamps.push(now);
		return true;
	}

	// Initialize mounted state
	onMount(() => {
		mounted = true;
	});

	// Debounced search function
	async function searchLocations(query: string) {
		if (!mounted || !isSearchEnabled) return;

		abortController?.abort();
		if (debounceTimeout) clearTimeout(debounceTimeout);

		if (!query.trim()) {
			suggestions = [];
			return;
		}

		debounceTimeout = setTimeout(async () => {
			if (!isWithinRateLimit()) return;

			isLoading = true;
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
			} catch (error) {
				if (error instanceof Error && error.name !== 'AbortError') {
					console.error('Search error:', error);
				}
				suggestions = [];
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

		if (feature.bbox) {
			mapState.focusBounds(feature.bbox[1], feature.bbox[0], feature.bbox[3], feature.bbox[2]);
		} else {
			mapState.focusLocation(lat, lng, 14);
		}

		suggestions = [];
		closeOverlay();
	}

	// Clear search
	function clearSearch() {
		searchQuery = '';
		suggestions = [];
		selectedIndex = -1;
		lastSelectedFeature = null;
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

	// Open/close overlay
	function openOverlay() {
		popoverElement?.showPopover();
		// Focus input after popover opens
		requestAnimationFrame(() => inputElement?.focus());
	}

	function closeOverlay() {
		popoverElement?.hidePopover();
	}

	// Keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'ArrowDown':
				if (suggestions.length === 0) return;
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
				break;
			case 'ArrowUp':
				if (suggestions.length === 0) return;
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				break;
			case 'Enter':
				event.preventDefault();
				if (suggestions.length > 0) {
					const indexToSelect = selectedIndex >= 0 ? selectedIndex : 0;
					selectSuggestion(suggestions[indexToSelect]);
				} else if (lastSelectedFeature && searchQuery === lastSelectedFeature.place_name) {
					selectSuggestion(lastSelectedFeature);
				}
				break;
			case 'Escape':
				event.preventDefault();
				closeOverlay();
				break;
		}
	}
</script>

<!-- Trigger Button -->
<button
	class="clickable-icon search-trigger"
	title={isSearchEnabled ? 'Search location' : 'Accept cookies to enable search'}
	disabled={!isSearchEnabled}
	onclick={openOverlay}
>
	<Search />
</button>

<!-- Fullscreen Overlay -->
<div bind:this={popoverElement} popover="auto" id={popoverId} class="mobile-search-overlay">
	<div class="overlay-content">
		<div class="search-wrapper">
			<div class="search-bar">
				<button
					class="clickable-icon"
					title="Search"
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
					<button class="clickable-icon" onclick={clearSearch} title="Clear search">
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
		</div>
		<button class="clickable-icon close-btn" onclick={closeOverlay} title="Close search">
			<X size={24} />
		</button>
		{#if showSuggestions}
			<div class="suggestions-container">
				<SearchSuggestions {suggestions} {isLoading} {selectedIndex} onSelect={selectSuggestion} />
			</div>
		{/if}
	</div>
</div>

<style>
	.mobile-search-overlay {
		position: fixed;
		inset: 0;
		margin: 0;
		padding: 0;
		border: none;
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100%;
		background-color: transparent;

		/* Animation */
		opacity: 0;
		transition:
			opacity 0.2s ease,
			display 0.2s ease allow-discrete;
	}

	.mobile-search-overlay:popover-open {
		opacity: 1;
	}

	@starting-style {
		.mobile-search-overlay:popover-open {
			opacity: 0;
		}
	}

	.mobile-search-overlay::backdrop {
		background-color: var(--backdrop-color);
		backdrop-filter: blur(2px);
	}

	.close-btn {
		position: absolute;
		background-color: var(--surface-base);
		border-radius: 50%;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

		/* Default: Top right corner on narrow screens */
		top: 1rem;
		right: 1rem;

		/* On wider screens: Anchor next to search bar */
		@media (min-width: 576px) {
			position-anchor: --search-bar;
			left: anchor(right);
			top: calc(anchor(top) + 4px);
			position-area: right;
			margin-left: 1rem;
		}
	}

	.overlay-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: 1rem;
		padding-top: 4rem; /* Space for close button */
	}

	.search-wrapper {
		width: 80%;
		max-width: 500px;
		margin-right: calc(40px + 1rem);
	}

	.search-bar {
		anchor-name: --search-bar;
		width: 100%;
		max-width: 500px;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		border-radius: 100vmax;
		padding: 0.25rem 0.5rem;
		background-color: var(--surface-base);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
	}

	.search-input {
		flex: 1;
		min-width: 0; /* Allows shrinking below content size */
		border: none;
		background-color: transparent;
		font-size: 16px; /* Prevents iOS zoom on focus */
		color: var(--text-primary);
		padding: 0.5rem;

		&:focus-visible {
			outline: none;
		}

		&:disabled {
			cursor: not-allowed;
			opacity: 0.5;
		}
	}

	.suggestions-container {
		width: 80%;
		max-width: 500px;
		margin-top: 0.5rem;
		background-color: var(--surface-base);
		border-radius: 1rem;
		overflow: hidden;
		max-height: 50vh;
		overflow-y: auto;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
		margin-right: calc(40px + 1rem);
	}

	.clickable-icon:disabled {
		cursor: not-allowed;
		opacity: 0.4;
	}

	@media (max-width: 575px) {
		.suggestions-container,
		.search-wrapper {
			width: 100%;
			margin-right: 0;
		}
	}
</style>
