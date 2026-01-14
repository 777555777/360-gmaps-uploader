import { browser } from '$app/environment';
import { consentState } from '$lib/consent-state.svelte';
import { mapState } from '$lib/map-state.svelte';
import type { GeocodingFeature } from '$lib/types/geocoding';

/**
 * Singleton state for location search functionality with rate limiting and autocomplete.
 * Shared between mobile and desktop search components.
 */
class LocationSearchState {
	// Search state
	searchQuery = $state('');
	suggestions = $state<GeocodingFeature[]>([]);
	isLoading = $state(false);
	selectedIndex = $state(-1);
	lastSelectedFeature = $state<GeocodingFeature | null>(null);

	// Request management
	private abortController: AbortController | null = null;
	private debounceTimeout: ReturnType<typeof setTimeout> | null = null;

	// Rate limiting (max 15 requests per minute)
	private readonly MAX_REQUESTS_PER_MINUTE = 15;
	private requestTimestamps: number[] = [];
	private debounceDelay = 400; // milliseconds

	// Derived state
	get isSearchEnabled() {
		return consentState.hasConsented() === true;
	}

	get hasSuggestions() {
		return this.suggestions.length > 0;
	}

	get showDropdown() {
		return this.hasSuggestions || this.isLoading;
	}

	/**
	 * Check if we're within rate limit (15 requests per minute)
	 */
	private isWithinRateLimit(): boolean {
		const now = Date.now();
		const oneMinuteAgo = now - 60000;

		// Remove timestamps older than 1 minute
		this.requestTimestamps = this.requestTimestamps.filter((ts) => ts > oneMinuteAgo);

		// Check if we can make another request
		if (this.requestTimestamps.length >= this.MAX_REQUESTS_PER_MINUTE) {
			console.warn('Rate limit reached. Please wait before searching again.');
			return false;
		}

		// Add current timestamp
		this.requestTimestamps.push(now);
		return true;
	}

	/**
	 * Debounced search function that fetches location suggestions
	 */
	async searchLocations(query: string) {
		if (!browser || !this.isSearchEnabled) return;

		// Cancel previous request
		this.abortController?.abort();

		// Clear previous debounce
		if (this.debounceTimeout) clearTimeout(this.debounceTimeout);

		// If query is empty, clear suggestions
		if (!query.trim()) {
			this.suggestions = [];
			return;
		}

		// Debounce (conservative to avoid too many requests)
		this.debounceTimeout = setTimeout(async () => {
			if (!this.isWithinRateLimit()) return;

			this.isLoading = true;
			this.abortController = new AbortController();

			try {
				const response = await fetch(
					`/api/geocoding?q=${encodeURIComponent(query)}&limit=5&autocomplete=true`,
					{ signal: this.abortController.signal }
				);

				if (!response.ok) throw new Error('Geocoding request failed');

				const data = await response.json();
				this.suggestions = data.features || [];
				this.selectedIndex = this.suggestions.length > 0 ? 0 : -1;
			} catch (error) {
				if (error instanceof Error && error.name !== 'AbortError') {
					console.error('Search error:', error);
				}
				this.suggestions = [];
			} finally {
				this.isLoading = false;
			}
		}, this.debounceDelay);
	}

	/**
	 * Handle input change
	 */
	handleInput = (event: Event) => {
		const target = event.target as HTMLInputElement;
		this.searchQuery = target.value;
		this.searchLocations(this.searchQuery);
	};

	/**
	 * Select a suggestion and focus map on the location
	 */
	selectSuggestion(feature: GeocodingFeature) {
		this.searchQuery = feature.place_name;
		this.lastSelectedFeature = feature;
		const [lng, lat] = feature.center;

		// Use bbox if available for better framing, otherwise use center with zoom 14
		if (feature.bbox) {
			mapState.focusBounds(feature.bbox[1], feature.bbox[0], feature.bbox[3], feature.bbox[2]);
		} else {
			mapState.focusLocation(lat, lng, 14);
		}

		this.suggestions = [];
	}

	/**
	 * Clear search input and suggestions
	 */
	clearSearch() {
		this.searchQuery = '';
		this.suggestions = [];
		this.selectedIndex = -1;
		this.lastSelectedFeature = null;
	}

	/**
	 * Focus map on user's current geolocation
	 */
	async focusUserLocation() {
		await mapState.focusUserLocation();
	}

	/**
	 * Handle search button click (select first suggestion or repeat last search)
	 */
	handleSearchClick = () => {
		if (this.suggestions.length > 0) {
			this.selectSuggestion(this.suggestions[0]);
		} else if (this.lastSelectedFeature) {
			this.selectSuggestion(this.lastSelectedFeature);
		}
	};

	/**
	 * Handle keyboard navigation in suggestions dropdown
	 */
	handleKeydown(event: KeyboardEvent, isDropdownOpen: boolean): boolean {
		switch (event.key) {
			case 'ArrowDown':
				if (!isDropdownOpen || this.suggestions.length === 0) return false;
				event.preventDefault();
				this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
				break;
			case 'ArrowUp':
				if (!isDropdownOpen || this.suggestions.length === 0) return false;
				event.preventDefault();
				this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
				break;
			case 'Enter':
				event.preventDefault();
				if (isDropdownOpen && this.suggestions.length > 0) {
					const indexToSelect = this.selectedIndex >= 0 ? this.selectedIndex : 0;
					this.selectSuggestion(this.suggestions[indexToSelect]);
				} else if (
					this.lastSelectedFeature &&
					this.searchQuery === this.lastSelectedFeature.place_name
				) {
					this.selectSuggestion(this.lastSelectedFeature);
				}
				break;
			case 'Escape':
				if (!isDropdownOpen) return false;
				event.preventDefault();
				this.selectedIndex = -1;
				return true; // Signal to close dropdown
		}
		return false;
	}
}

// Export singleton instance
export const searchState = new LocationSearchState();
