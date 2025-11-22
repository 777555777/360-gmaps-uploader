<script lang="ts">
	let { index, initialLat, initialLng, onSave } = $props();

	// Verwende die Props direkt in den Inputs via value/oninput
	// statt bind:value - dadurch brauchen wir kein $effect
	let latitude = $state<number | undefined>(initialLat);
	let longitude = $state<number | undefined>(initialLng);

	function handleSave() {
		onSave({ latitude: latitude ?? 0, longitude: longitude ?? 0 });
	}
</script>

<div
	popover
	id="geo-popover-{index}"
	class="geo-popover"
	style="position-anchor: --geo-data-anchor-{index}"
>
	<div class="geo-inputs">
		<!-- svelte-ignore a11y_consider_explicit_label -->
		<button class="geo-btn icon-btn">
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
			id="lat"
			placeholder="Latitude"
			value={latitude ?? initialLat ?? ''}
			oninput={(e) => (latitude = parseFloat(e.currentTarget.value) || undefined)}
		/>
		<input
			type="text"
			id="lng"
			placeholder="Longitude"
			value={longitude ?? initialLng ?? ''}
			oninput={(e) => (longitude = parseFloat(e.currentTarget.value) || undefined)}
		/>
	</div>

	<button
		class="geo-btn apply-btn"
		onclick={handleSave}
		popovertarget="geo-popover-{index}"
		popovertargetaction="hide">Apply</button
	>
</div>

<style>
	.geo-popover:popover-open {
		display: flex;
	}

	.geo-popover {
		align-items: center;
		gap: 1.375rem;
		padding: 0.5rem;
		background: #fff;
		border-radius: 10px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
		border: 1px solid var(--border-accent-color);
		position: absolute;
		top: anchor(bottom);
		left: anchor(left);

		.icon-btn {
			width: 28px;
			height: 28px;
			display: flex;
			align-items: center;
			justify-content: center;
			border: none;
			cursor: pointer;
			padding: 4px;
			background-color: dodgerblue;
			border-radius: 6px;
			color: #fff;
			transition: background-color 0.2s;

			&:hover {
				background-color: #e2e5e7;
			}
		}

		.geo-inputs {
			display: flex;
			align-items: center;
			gap: 6px;

			input {
				padding: 6px 10px;
				border: 1px solid #ccc;
				border-radius: 6px;
				max-width: 6rem;
				transition: border-color 0.2s;

				&:focus {
					border-color: dodgerblue;
					outline: none;
				}
			}
		}

		.apply-btn {
			margin-left: auto;
			padding: 6px 14px;
			background: dodgerblue;
			color: #fff;
			border-radius: 6px;
			border: none;
			cursor: pointer;
			transition:
				background-color 0.2s,
				box-shadow 0.2s;

			&:hover {
				background: #1b7ee6;
				box-shadow: 0 2px 6px rgba(30, 136, 229, 0.3);
			}
		}
	}
</style>
