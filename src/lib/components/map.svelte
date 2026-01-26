<script lang="ts">
	import { onMount } from 'svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { fileState } from '$lib/file-state.svelte';
	import { mapPosition } from '$lib/utils/map-location-helpers';
	import type { Map } from 'leaflet';
	// import darkTilesExample from '$lib/assets/tile-example-dark.webp';
	// import lightTilesExample from '$lib/assets/tile-example-light.webp';

	let mapContainer: HTMLDivElement;

	const crosshairSvg = encodeURIComponent(`
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crosshair-icon lucide-crosshair"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
	`);

	const I_DEVICE_PATTERN = /iPad|iPhone|iPod/;
	const isMacWithTouch = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
	const isIOSDevice = I_DEVICE_PATTERN.test(navigator.userAgent) || isMacWithTouch;

	onMount(() => {
		let destroyed = false;
		let removeDoubleTapHandler: (() => void) | null = null;
		let mapInstance: Map | null = null;

		// Dynamic import of Leaflet (client-side only)
		(async () => {
			const Leaflet = await import('leaflet');

			// Import Leaflet CSS
			await import('leaflet/dist/leaflet.css');

			// Initialize tile layer preference from localStorage
			const initialLayer = mapState.initializeTileLayer();

			if (destroyed || !mapContainer) return;

			// set location
			const map = Leaflet.map(mapContainer, {
				center: mapPosition.center,
				zoom: mapPosition.zoom,
				minZoom: 2,
				maxZoom: 19
			});
			mapInstance = map;

			// iOS Safari sometimes fails to trigger Leaflet's double-tap zoom
			if (isIOSDevice) {
				let lastTap = 0;
				const handleTouchEnd = (event: TouchEvent) => {
					if (!mapContainer) return;
					const now = Date.now();
					const delta = now - lastTap;
					lastTap = now;
					if (delta > 0 && delta < 300) {
						const touch = event.changedTouches[0];
						if (!touch) return;
						const rect = mapContainer.getBoundingClientRect();
						const point = Leaflet.point(touch.clientX - rect.left, touch.clientY - rect.top);
						const latLng = map.containerPointToLatLng(point);
						map.setView(latLng, map.getZoom() + 1);
					}
				};
				mapContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
				removeDoubleTapHandler = () => {
					mapContainer.removeEventListener('touchend', handleTouchEnd);
				};
			}

			// OpenStreetMap Tiles
			const lightLayer = Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19
			});

			const darkLayer = Leaflet.tileLayer(
				'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
				{
					attribution:
						'&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
					maxZoom: 20
				}
			);

			// Add initial layer based on stored preference
			if (initialLayer === 'light') {
				lightLayer.addTo(map);
			} else {
				darkLayer.addTo(map);
			}

			mapState.setMap(map);
			mapState.setTileLayers(lightLayer, darkLayer);

			map.on('click', (e) => {
				// If we're in picking mode, execute callback
				if (mapState.isPickingLocation) {
					mapState.executePickingCallback(e.latlng.lat, e.latlng.lng);
					return;
				}

				// Otherwise normal behavior
				mapState.clearFocus();
			});

			// Add markers for all existing files with GPS data
			for (const file of fileState.fileList) {
				const metadata = fileState.getMetadata(file);
				if (metadata?.geoLocation) {
					const isSelected = fileState.isSelected(file);
					const isPublished = fileState.isPublished(file);
					mapState.addMarker(file, Leaflet, isSelected, metadata, isPublished);
				}
			}
		})();

		// Cleanup
		return () => {
			destroyed = true;
			removeDoubleTapHandler?.();
			const mapToRemove = mapInstance ?? mapState.map;
			const container = (mapToRemove as any)?._container as HTMLElement | undefined;
			if (mapToRemove && container && container.parentNode) {
				mapToRemove.remove();
			}
			mapState.setMap(null as any);
		};
	});

	// Reactive: Change cursor when picking mode is activated
	$effect(() => {
		const isPickingLocation = mapState.isPickingLocation;

		if (mapContainer) {
			if (isPickingLocation) {
				mapContainer.style.cursor = `url('data:image/svg+xml;utf8,${crosshairSvg}') 12 18, crosshair`;
			} else {
				mapContainer.style.cursor = '';
			}
		}
	});

	// Reactive: Add markers when new files with GPS data are loaded
	$effect(() => {
		// Track sowohl fileList als auch loadingFiles, um auf Metadaten-Änderungen zu reagieren
		const files = fileState.fileList;
		const loadingCount = fileState.loadingCount;
		const selectedCount = fileState.selectedCount; // Track Selection-Änderungen
		const publishedCount = fileState.publishedCount; // Track Published-Änderungen
		const metadataSize = fileState.metadata.size; // Track Metadata-Änderungen

		// Force re-run when loadingCount, selection, published or metadata changes
		console.log(
			'Effect triggered. Files:',
			files.length,
			'Loading:',
			loadingCount,
			'Selected:',
			selectedCount,
			'Published:',
			publishedCount,
			'Metadata:',
			metadataSize
		);

		(async () => {
			const Leaflet = await import('leaflet');

			for (const file of files) {
				const metadata = fileState.getMetadata(file);
				const isSelected = fileState.isSelected(file);
				const isPublished = fileState.isPublished(file);

				// Check if metadata is loaded
				if (metadata?.geoLocation) {
					const existingMarker = mapState.markers.get(file);
					const hasPositionChanged = existingMarker
						? existingMarker.getLatLng().lat !== metadata.geoLocation.latitude ||
							existingMarker.getLatLng().lng !== metadata.geoLocation.longitude
						: false;

					if (!existingMarker || hasPositionChanged) {
						// Marker doesn't exist yet or position has changed - create/update it
						console.log('Adding/updating marker for file:', file.name, metadata.geoLocation);
						mapState.addMarker(file, Leaflet, isSelected, metadata, isPublished);
					} else {
						// Marker exists and position unchanged - only update color
						mapState.updateMarkerColor(file, isSelected, Leaflet, isPublished);
					}
				}
			}

			// Remove markers for deleted files
			for (const [file] of mapState.markers) {
				if (!fileState.hasFile(file)) {
					mapState.removeMarker(file);
				}
			}
		})();
	});
</script>

<div class="map-container" style="anchor-name: --map-anchor;">
	<div bind:this={mapContainer} class="map"></div>

	{#if mapState.isPickingLocation}
		<div id="picker-popover" class="show" style="position-anchor: --map-anchor;">
			<span class="desktop">Click on the map to set location</span>
			<span class="touch">Tap to select location</span>
			<button
				class="secondary-btn"
				onclick={() => mapState.stopPickingLocation()}
				title="Cancel Picking Location">Cancel</button
			>
		</div>
	{/if}

	<!-- <div class="map-tile-selector">
		<button
			class="tile-preview-btn light {mapState.currentTileLayer === 'light' ? 'active' : ''}"
			style="--preview-light-image: url('{lightTilesExample}');"
			class:active={mapState.currentTileLayer === 'light'}
			onclick={() => mapState.setMapTileLayer('light')}
			title="Light Map"
			aria-label="Switch to light map theme"
		>
			<div class="preview-image light-preview"></div>
			<span class="tile-label"></span>
		</button>

		<button
			class="tile-preview-btn dark {mapState.currentTileLayer === 'dark' ? 'active' : ''}"
			style=" --preview-dark-image: url('{darkTilesExample}');"
			class:active={mapState.currentTileLayer === 'dark'}
			onclick={() => mapState.setMapTileLayer('dark')}
			title="Dark Map"
			aria-label="Switch to dark map theme"
		>
			<div class="preview-image dark-preview"></div>
			<span class="tile-label"></span>
		</button>
	</div> -->
</div>

<style>
	/* .map-tile-selector {
		position: absolute;
		position-anchor: --map-anchor;
		bottom: anchor(bottom);
		left: anchor(left);
		padding: 1rem;

		display: flex;
		flex-direction: column;
		gap: 1rem;

		button {
			width: 58px;
			height: 58px;
			border: 4px solid var(--border-subtle);
			border-radius: 8px;
			cursor: pointer;
			box-shadow:
				0 1px 3px 0 var(--shadow-inner),
				0 4px 8px 3px var(--shadow-outer);
			transition: border-color 0.1s ease-in-out;

			&.active {
				border-color: var(--primary-700);
			}
			&:hover {
				border-color: var(--primary-500);
				filter: brightness(1.05);
			}
			&:active {
				border-color: var(--primary-700);
				filter: brightness(0.95);
			}
			&:focus-visible {
				outline: 3px solid var(--primary-500);
				outline-offset: 2px;
			}
		}

		button.light {
			background-image: var(--preview-light-image);
		}
		button.dark {
			background-image: var(--preview-dark-image);
		}
	} */

	/* ================================ */
	.map-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
	}

	.map {
		width: 100%;
		height: 100%;
		z-index: 0;
	}

	:global(.leaflet-control-zoom.leaflet-bar.leaflet-control) {
		user-select: none;
	}

	@media (max-width: 576px) {
		:global(.leaflet-top.leaflet-left) {
			top: unset;
			left: unset;
			right: 0;
			bottom: 0;
		}

		:global(.leaflet-control-zoom.leaflet-bar.leaflet-control) {
			margin: 0;
			margin-right: 10px;
			margin-bottom: 10px;
		}

		/* Move attribution to top-left on mobile */
		:global(.leaflet-bottom.leaflet-right) {
			bottom: 0;
			right: unset;
			top: unset;
			left: 0;
		}

		:global(.leaflet-control-attribution.leaflet-control) {
			font-size: 11px;
		}
	}
	/* Leaflet Popup */
	:global(.leaflet-popup-content-wrapper),
	:global(.leaflet-popup-tip) {
		border-radius: 4px;
		font-family: 'Open Sans', sans-serif;
		background-color: var(--card-bg) !important;
		padding: 0;
	}

	:global(.leaflet-popup-content) {
		margin: 0;
		font-size: 14px;
	}

	/* Custom Popup Content */
	:global(.marker-popup) {
		min-width: 200px;
	}

	:global(.popup-header) {
		padding: 12px;
		border-bottom: 1px solid var(--border-subtle);
	}

	:global(.popup-header h4) {
		margin: 0;
		font-size: 15px;
		font-weight: 500;
		color: var(--text-default) !important;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.popup-body) {
		padding: 12px;
		color: var(--text-default) !important;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	:global(.popup-geo-data),
	:global(.popup-file-size),
	:global(.popup-datetime),
	:global(.popup-camera) {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	:global(.popup-coordinates) {
		display: flex;
		gap: 0.25rem;
		font-variant-numeric: tabular-nums;
	}

	:global(.popup-separator) {
		opacity: 0.5;
	}

	/* Custom Marker */
	:global(.custom-marker) {
		background: none;
		border: none;
	}

	:global(.custom-marker svg) {
		transition: transform 0.2s ease;
	}

	:global(.custom-marker:hover svg) {
		transform: scale(1.1);
	}

	:global(.leaflet-popup-close-button) {
		display: none;
	}

	@media (max-width: 576px) {
		:global(.popup-body) {
			gap: 5px;
		}

		:global(.leaflet-popup-content) {
			margin: 0.375rem !important;
		}

		:global(.popup-header h4) {
			max-width: 200px !important;
		}

		:global(.popup-header) {
			padding: 6px;
		}

		:global(.popup-body) {
			padding: 6px;
		}

		:global(.popup-geo-data),
		:global(.popup-file-size),
		:global(.popup-datetime),
		:global(.popup-camera) {
			gap: 6px;
			font-size: 0.675rem;
		}
	}

	/* Picker Mode Popover */
	#picker-popover {
		--popover-width: 340px;
		width: var(--popover-width);
		position: absolute;
		bottom: anchor(bottom);
		right: calc(anchor(center) - var(--popover-width) / 2);
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 14px;
		padding-left: 24px;

		background-color: var(--surface-dark-overlay);
		color: var(--text-white);
		border-radius: 100vmax;
		box-shadow:
			0 2px 4px var(--shadow-inner),
			0 4px 8px var(--shadow-outer);

		font-size: 14px;
		font-weight: 400;

		transition:
			transform 0.3s ease-out,
			opacity 0.3s ease-out;
		opacity: 0;
	}

	#picker-popover.show {
		opacity: 1;
	}

	/* Default: Desktop */
	.touch {
		display: none;
	}

	/* Touch devices (tablets, phones) */
	@media (pointer: coarse) {
		.desktop {
			display: none;
		}
		.touch {
			display: inline;
		}
	}

	/* Mobile layout */
	@media (max-width: 576px) {
		#picker-popover {
			padding: 0.325rem;
			padding-left: 1.5rem;
			width: calc(100% - 2rem);
			max-width: 18rem;
			right: 50%;
			top: 74px;
			bottom: unset;
			transform: translateX(50%);
			user-select: none;

			.secondary-btn {
				height: 32px;
			}
		}
	}
</style>
