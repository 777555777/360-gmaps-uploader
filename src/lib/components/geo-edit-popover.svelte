<script lang="ts">
	let { index, initialLat, initialLng, onSave } = $props();

	// Format initial coordinates as "lat, lng" (Google Maps format)
	let coordinatesInput = $state<string>(
		initialLat !== undefined && initialLng !== undefined ? `${initialLat}, ${initialLng}` : ''
	);

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
				<button class="geo-btn icon-btn" type="button" aria-label="Location icon" disabled>
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
						<circle cx="12" cy="12" r="10"></circle>
						<line x1="22" y1="12" x2="18" y2="12"></line>
						<line x1="6" y1="12" x2="2" y2="12"></line>
						<line x1="12" y1="6" x2="12" y2="2"></line>
						<line x1="12" y1="22" x2="12" y2="18"></line>
					</svg>
				</button>

				<input
					type="text"
					id="coordinates-{index}"
					placeholder="50.641, 8.588"
					value={coordinatesInput}
					oninput={handleInput}
					aria-label="Coordinates in Google Maps format"
				/>
			</div>

			<button
				class="geo-btn apply-btn"
				onclick={handleSave}
				disabled={!parsedCoords || parseError !== ''}
				popovertarget="geo-popover-{index}"
				popovertargetaction="hide"
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
		padding: 0.75rem 1rem;
		background: #fff;
		border-radius: 12px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		border: 1px solid var(--border-accent-color);
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
			cursor: default;
			padding: 0;
			background-color: #fff;
			border-radius: 100vmax;
			color: var(--text-color);
			flex-shrink: 0;
			border: 2px solid transparent;
			box-shadow:
				0 2px 3px 0 rgba(60, 64, 67, 0.3),
				0 6px 10px 4px rgba(60, 64, 67, 0.15);
			transition: all 0.2s ease;

			&:hover {
				background-color: #3b82f633;
				color: #3b82f6;
			}

			&:focus-visible {
				outline: none;
				border-color: #3b82f6;
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
				gap: 8px;
			}

			input {
				height: 30px;
				line-height: 30px;
				padding-inline: 12px;
				border: 1px solid #d1d5db;
				border-radius: 999px;
				width: 100%;
				font-size: 14px;
				font-family: inherit;
				transition:
					border-color 0.15s ease,
					box-shadow 0.15s ease;
				box-sizing: border-box;

				&:focus {
					border-color: #3b82f6;
					box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
					outline: none;
				}

				&::placeholder {
					color: #9ca3af;
					font-style: italic;
				}
			}
		}

		.apply-btn {
			height: 34px;
			padding: 0 20px;
			background: #3b82f6;
			color: #fff;
			border-radius: 100vmax;
			border: 2px solid transparent;
			cursor: pointer;
			font-size: 0.875rem;
			flex-shrink: 0;
			box-shadow:
				0 2px 3px 0 rgba(60, 64, 67, 0.3),
				0 6px 10px 4px rgba(60, 64, 67, 0.15);
			transition: all 0.2s ease;

			&:hover:not(:disabled) {
				background: #1b7ee6;
			}

			&:focus-visible {
				outline: none;
				border-color: #1b7ee6;
			}

			&:disabled {
				opacity: 0.45;
				cursor: not-allowed;
			}
		}
	}
</style>
