<script lang="ts">
	import { getThumbnail } from '$lib/utils/image-helpers';
	import { fileState } from '$lib/file-state.svelte';

	let { file, index, onRemove } = $props<{
		file: File;
		index: number;
		onRemove: () => void;
	}>();

	let thumbUrl = $state<string>('');
	let isLoading = $state(true);
	let hasError = $state(false);

	// Erstelle Object URL für das Bild und räume auf
	$effect(() => {
		getThumbnail(file)
			.then((url) => {
				thumbUrl = url;
				isLoading = false;
				hasError = false;
			})
			.catch((err) => {
				console.error(`Thumbnail generation failed for ${file.name}:`, err);
				// Fallback zu data URL placeholder
				thumbUrl =
					'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3ENo Preview%3C/text%3E%3C/svg%3E';
				isLoading = false;
				hasError = true;
			});

		return () => {
			if (thumbUrl && thumbUrl.startsWith('blob:')) {
				URL.revokeObjectURL(thumbUrl);
			}
		};
	});
</script>

<div class="thumbnail-container">
	{#if isLoading}
		<div class="loading-indicator" style="anchor-name: --image-anchor-{index}">
			<span class="spinner"></span>
			<span>Generating Thumbnail...</span>
		</div>
	{:else}
		<img src={thumbUrl} alt={file.name} style="anchor-name: --image-anchor-{index}" />
	{/if}

	<div class="thumbnail-actions" style="position-anchor: --image-anchor-{index}">
		<button class="clickable-icon close-btn-overlay" aria-label="Löschen" onclick={onRemove}>
			<!-- close icon -->
			<svg
				class="svg-icon"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 28 28"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="20" y1="8" x2="8" y2="20"></line>
				<line x1="8" y1="8" x2="20" y2="20"></line>
			</svg>
		</button>

		<button
			class="clickable-icon close-btn-overlay"
			aria-label="View as 360 panorama"
			onclick={() => fileState.openPanorama(file)}
		>
			<!-- view 360 icon -->
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
				><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g
					id="SVGRepo_tracerCarrier"
					stroke-linecap="round"
					stroke-linejoin="round"
				></g><g id="SVGRepo_iconCarrier">
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M17.7971 3.3568C18.441 2.86719 19.3233 2.68917 20.1838 3.06604C20.894 3.37708 21.5116 3.74924 21.9628 4.18966C22.416 4.63206 22.75 5.195 22.75 5.85989V18.5764C22.75 19.3688 22.2796 20.0115 21.686 20.492C21.0861 20.9776 20.2637 21.3817 19.314 21.7069C17.4072 22.3597 14.8213 22.7501 12 22.7501C9.17869 22.7501 6.59281 22.3597 4.686 21.7069C3.73627 21.3817 2.91391 20.9776 2.31397 20.492C1.72038 20.0115 1.25 19.3688 1.25 18.5764V5.85989C1.25 5.195 1.58399 4.63206 2.0372 4.18966C2.48839 3.74924 3.10596 3.37708 3.81617 3.06604C4.67668 2.68917 5.55899 2.86719 6.20295 3.3568C6.83685 3.83877 7.25 4.62479 7.25 5.50224V8.11022C8.64413 8.37843 10.2649 8.5336 12 8.5336C13.7351 8.5336 15.3559 8.37843 16.75 8.11022V5.50224C16.75 4.62479 17.1631 3.83877 17.7971 3.3568ZM18.25 7.75342C19.134 7.49711 19.8512 7.19455 20.3705 6.87151C21.0928 6.42225 21.25 6.05639 21.25 5.85989C21.25 5.73022 21.1887 5.53021 20.915 5.26306C20.6393 4.99393 20.1984 4.70995 19.5821 4.44004C19.2679 4.30246 18.9588 4.35786 18.7049 4.55087C18.441 4.75152 18.25 5.09732 18.25 5.50224V7.75342ZM21.25 8.08989C21.2211 8.10859 21.192 8.12703 21.1628 8.1452C20.279 8.695 19.065 9.13509 17.6653 9.45128C16.0264 9.82148 14.0801 10.0336 12 10.0336C9.91994 10.0336 7.9736 9.82148 6.33475 9.45128C4.93499 9.13509 3.72104 8.695 2.83719 8.1452C2.80798 8.12703 2.77891 8.10859 2.75 8.08989V17.8425L5.79302 14.9948L7.165 13.8464C8.1622 13.0117 9.65619 13.0575 10.5965 13.957L13.9176 17.1339C14.1922 17.3966 14.6395 17.4374 14.9659 17.2179L15.1967 17.0627C16.3608 16.2802 17.9311 16.3683 18.9937 17.2831L21.0374 19.0426C21.2064 18.8414 21.25 18.6833 21.25 18.5764V8.08989ZM19.7551 19.9179L18.015 18.4199C17.468 17.9489 16.6413 17.8991 16.0336 18.3076L15.8028 18.4628C14.8979 19.0711 13.6701 18.973 12.8807 18.2178L9.55962 15.0409C9.17417 14.6722 8.54158 14.6503 8.12777 14.9966L6.78763 16.1184L3.31313 19.3698C3.72644 19.6888 4.34957 20.0062 5.17187 20.2877C6.88434 20.874 9.29846 21.2501 12 21.2501C14.7015 21.2501 17.1157 20.874 18.8281 20.2877C19.1723 20.1699 19.4815 20.0458 19.7551 19.9179ZM2.75 5.85989C2.75 6.05639 2.90725 6.42225 3.62948 6.87151C4.1488 7.19455 4.86599 7.49711 5.75 7.75342V5.50224C5.75 5.09732 5.55899 4.75152 5.29508 4.55087C5.04123 4.35786 4.73207 4.30246 4.41793 4.44004C3.80164 4.70995 3.36068 4.99393 3.08497 5.26306C2.81128 5.53021 2.75 5.73022 2.75 5.85989ZM18 12.2501C17.5858 12.2501 17.25 12.5859 17.25 13.0001C17.25 13.4143 17.5858 13.7501 18 13.7501C18.4142 13.7501 18.75 13.4143 18.75 13.0001C18.75 12.5859 18.4142 12.2501 18 12.2501ZM15.75 13.0001C15.75 11.7574 16.7574 10.7501 18 10.7501C19.2426 10.7501 20.25 11.7574 20.25 13.0001C20.25 14.2427 19.2426 15.2501 18 15.2501C16.7574 15.2501 15.75 14.2427 15.75 13.0001Z"
						fill="#ffffff"
					></path>
				</g></svg
			>
		</button>
	</div>
</div>

<style>
	.thumbnail-actions {
		/* CSS Anchor Positioning */
		position: absolute;
		/* position-anchor wird inline per style="{index}" gesetzt */

		/* Positionierung: Top-Right mit 8px Abstand */
		top: anchor(top);
		right: anchor(right);
		margin-top: 8px;
		margin-right: 8px;

		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.thumbnail-container {
		position: relative;
	}

	img {
		display: block;
		width: 100%;
		height: 180px;
		object-fit: cover;
		border-radius: 8px 8px 0 0;
		/* anchor-name wird inline per style="{index}" gesetzt */
	}

	.loading-indicator {
		height: 180px;
		background-color: #d8e6fd;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 8px;
		font-size: 0.875rem;
		color: rgb(95, 99, 104);
	}

	.close-btn-overlay {
		/* Overlay-spezifisches Styling */
		background-color: rgba(75, 75, 75, 0.75);
		color: white;
	}

	.spinner {
		display: inline-block;
		width: 16px;
		height: 16px;
		border: 2px solid rgba(95, 99, 104, 0.3);
		border-top-color: rgb(95, 99, 104);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
