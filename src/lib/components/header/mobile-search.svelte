<script lang="ts">
	import { Eraser, MapPinHouse, Search, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { searchState } from '$lib/search-state.svelte';
	import SearchSuggestions from './search-suggestions.svelte';

	// Mobile-specific state
	let mounted = $state(false);

	// Element references
	let inputElement = $state<HTMLInputElement | null>(null);
	let popoverElement = $state<HTMLElement | null>(null);

	// Popover ID
	const popoverId = 'mobile-search-popover';

	// Initialize mounted state
	onMount(() => {
		mounted = true;
	});

	// Enhanced handlers that also control the overlay
	function handleSelectSuggestion(feature: import('$lib/types/geocoding').GeocodingFeature) {
		searchState.selectSuggestion(feature);
		closeOverlay();
	}

	function handleClearSearch() {
		searchState.clearSearch();
		inputElement?.focus();
	}

	async function handleFocusUserLocation() {
		await searchState.focusUserLocation();
		closeOverlay();
	}

	function handleSearchClick() {
		searchState.handleSearchClick();
		closeOverlay();
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
		const shouldClose = searchState.handleKeydown(event, true);
		if (shouldClose) {
			closeOverlay();
		}
		// Also close on Enter when selecting a suggestion
		if (event.key === 'Enter' && (searchState.suggestions.length > 0 || searchState.searchQuery)) {
			closeOverlay();
		}
	}
</script>

<!-- Trigger Button -->
<button
	class="clickable-icon search-trigger"
	title={searchState.isSearchEnabled ? 'Search location' : 'Accept cookies to enable search'}
	disabled={!searchState.isSearchEnabled}
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
					disabled={!searchState.isSearchEnabled}
					onclick={handleSearchClick}
				>
					<Search />
				</button>
				<input
					bind:this={inputElement}
					type="text"
					placeholder={searchState.isSearchEnabled
						? 'Search location...'
						: 'Accept cookies to search'}
					class="search-input"
					value={searchState.searchQuery}
					oninput={searchState.handleInput}
					onkeydown={handleKeydown}
					disabled={!searchState.isSearchEnabled}
				/>
				{#if searchState.searchQuery && searchState.isSearchEnabled}
					<button class="clickable-icon" onclick={handleClearSearch} title="Clear search">
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
		</div>
		<button class="clickable-icon close-btn" onclick={closeOverlay} title="Close search">
			<X size={24} />
		</button>
		{#if searchState.showDropdown}
			<div class="suggestions-container">
				<SearchSuggestions
					suggestions={searchState.suggestions}
					isLoading={searchState.isLoading}
					selectedIndex={searchState.selectedIndex}
					onSelect={handleSelectSuggestion}
				/>
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
