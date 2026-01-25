<script lang="ts">
	import { mapState } from '$lib/map-state.svelte';
	import { Crosshair } from '@lucide/svelte';

	let { index, initialLat, initialLng, onSave } = $props();

	// Format initial coordinates as "lat, lng" (Google Maps format)
	// Initialized by $effect below when initialLat/initialLng are available
	let coordinatesInput = $state<string>('');

	let parseError = $state<string>('');
	let parsedCoords = $state<{ latitude: number; longitude: number } | null>(null);

	/**
	 * Parse Google Maps coordinate format: "50.6412102209881, 8.58863746477101"
	 * Accepts various formats:
	 * - "50.641, 8.588"
	 * - "50.641,8.588" (without space)
	 * - "  50.641  ,  8.588  " (with extra whitespace)
	 */
	function parseCoordinates(input: string): { latitude: number; longitude: number } | null {
		if (!input.trim()) {
			return null;
		}

		// Split by comma and trim whitespace
		const parts = input.split(',').map((part) => part.trim());

		if (parts.length !== 2) {
			parseError = 'Format: latitude, longitude';
			return null;
		}

		const lat = parseFloat(parts[0]);
		const lng = parseFloat(parts[1]);

		// Validate numbers
		if (isNaN(lat) || isNaN(lng)) {
			parseError = 'Invalid numbers';
			return null;
		}

		// Validate latitude range (-90 to 90)
		if (lat < -90 || lat > 90) {
			parseError = 'Latitude must be between -90 and 90';
			return null;
		}

		// Validate longitude range (-180 to 180)
		if (lng < -180 || lng > 180) {
			parseError = 'Longitude must be between -180 and 180';
			return null;
		}

		parseError = '';
		return { latitude: lat, longitude: lng };
	}

	function handleInput(event: Event) {
		const input = (event.currentTarget as HTMLInputElement).value;
		coordinatesInput = input;
		parsedCoords = parseCoordinates(input);
	}

	function handleSave() {
		const coords = parseCoordinates(coordinatesInput);
		if (coords) {
			onSave(coords);
		}
	}

	function handlePickFromMap() {
		// Start Picking-Mode with callback
		mapState.startPickingLocation((lat, lng) => {
			// Set coordinates and apply them directly
			const coords = { latitude: lat, longitude: lng };
			onSave(coords);
		});
	}

	// Update input when initial values change
	$effect(() => {
		if (initialLat !== undefined && initialLng !== undefined) {
			coordinatesInput = `${initialLat}, ${initialLng}`;
			parsedCoords = { latitude: initialLat, longitude: initialLng };
		}
	});
</script>

<div
	popover
	id="geo-popover-{index}"
	class="geo-popover"
	style="position-anchor: --geo-data-anchor-{index};"
>
	<div class="geo-inputs">
		<div class="top-row">
			<div class="input-options">
				<button
					class="icon-btn"
					type="button"
					aria-label="Pick location from map"
					onclick={handlePickFromMap}
					title="Pick location from map"
					popovertarget="geo-popover-{index}"
					popovertargetaction="hide"
				>
					<Crosshair size={16} />
				</button>

				<input
					type="text"
					id="coordinates-{index}"
					placeholder="50.641, 8.588"
					value={coordinatesInput}
					oninput={handleInput}
					aria-label="Coordinates in Google Maps format"
					title="Enter coordinates in Google Maps format"
				/>
			</div>

			<button
				class="primary-btn"
				onclick={handleSave}
				disabled={!parsedCoords || parseError !== ''}
				popovertarget="geo-popover-{index}"
				popovertargetaction="hide"
				title="Apply GPS Data to Photo"
			>
				Apply
			</button>
		</div>
	</div>
</div>

<style>
	.geo-popover:popover-open {
		display: flex;
	}

	.geo-popover {
		align-items: center;
		gap: 1rem;
		padding: 0.75rem;
		background: var(--surface-base);
		border-radius: 100vmax;
		box-shadow: 0 4px 16px var(--shadow-outer);
		border: 1px solid var(--border-subtle);
		position: fixed;
		position-try-fallbacks: flip-block, flip-inline;
		margin: 0;
		inset: unset;
		top: anchor(bottom);
		left: anchor(left);
		min-width: 340px;
		cursor: default;

		.icon-btn {
			width: 30px;
			height: 30px;
			display: flex;
			align-items: center;
			justify-content: center;
			border: none;
			cursor: pointer;
			padding: 0;
			background-color: transparent;
			border-radius: 100vmax;
			color: var(--text-default);
			flex-shrink: 0;
			border: 2px solid transparent;
			box-shadow:
				0 2px 3px 0 var(--shadow-inner),
				0 6px 10px 4px var(--shadow-outer);
			transition: all 0.2s ease;

			&:hover,
			&:active {
				background-color: var(--button-primary-bg);
				color: var(--button-primary);
			}

			&:focus-visible {
				outline: none;
				border-color: var(--button-primary);
			}
		}

		.geo-inputs {
			display: flex;
			flex-direction: column;
			gap: 4px;
			flex: 1;

			.top-row {
				display: flex;
				align-items: center;
				gap: 1rem;
				width: 100%;
				min-height: 30px;
				max-height: 30px;
			}

			.input-options {
				display: flex;
				align-items: center;
				flex: 1;
				gap: 0.5rem;
			}

			input {
				height: 30px;
				line-height: 30px;
				padding-inline: 12px;
				background-color: var(--surface-subtle);
				border: 1px solid var(--border-default);
				color: var(--text-default);
				border-radius: 100vmax;
				width: 100%;
				max-width: 10rem;
				font-size: 16px; /* Prevents iOS zoom on focus */
				font-family: inherit;
				transition:
					border-color 0.15s ease,
					box-shadow 0.15s ease;
				box-sizing: border-box;

				&:focus {
					outline: 2px solid var(--button-primary);
				}

				&::placeholder {
					color: var(--text-subtle);
					font-style: italic;
				}
			}
		}
	}

	@media (max-width: 576px) {
		.geo-popover {
			min-width: unset;
			padding: 0.5rem;
			.geo-inputs {
				flex: unset;

				.top-row {
					gap: 0.5rem;
				}

				input {
					max-width: 8rem;
				}
			}
		}
	}
</style>
