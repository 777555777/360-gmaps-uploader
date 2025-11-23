<script lang="ts">
	import { onMount } from 'svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { fileState } from '$lib/file-state.svelte';

	let mapContainer: HTMLDivElement;

	const crosshairSvg = encodeURIComponent(`
		<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-crosshair-icon lucide-crosshair"><circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/></svg>
	`);

	onMount(() => {
		// Dynamischer Import von Leaflet (Client-side only)
		(async () => {
			const Leaflet = await import('leaflet');

			// Leaflet CSS importieren
			await import('leaflet/dist/leaflet.css');

			// Erstelle Map mit Standardposition (Deutschland)
			const map = Leaflet.map(mapContainer).setView([50.6401, 8.5926], 13);

			// OpenStreetMap Tiles
			Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
				maxZoom: 19
			}).addTo(map);

			// Setze Map-Instanz im State
			mapState.setMap(map);

			map.on('click', (e) => {
				// Wenn wir im Picking-Mode sind, führe Callback aus
				if (mapState.isPickingLocation) {
					mapState.executePickingCallback(e.latlng.lat, e.latlng.lng);
					return;
				}

				// Ansonsten normales Verhalten
				mapState.clearFocus();
			});

			// Füge Marker für alle existierenden Files mit GPS-Daten hinzu
			for (const file of fileState.fileList) {
				const metadata = fileState.getMetadata(file);
				if (metadata?.geoLocation) {
					const isSelected = fileState.isSelected(file);
					mapState.addMarker(file, Leaflet, isSelected, metadata);
				}
			}
		})();

		// Cleanup
		return () => {
			if (mapState.map) {
				mapState.map.remove();
			}
		};
	});

	// Reaktiv: Ändere Cursor wenn Picking-Mode aktiviert ist
	$effect(() => {
		const isPickingLocation = mapState.isPickingLocation;

		if (mapContainer) {
			if (isPickingLocation) {
				mapContainer.style.cursor = `url('data:image/svg+xml;utf8,${crosshairSvg}') 12 12, crosshair`;
			} else {
				mapContainer.style.cursor = '';
			}
		}
	});

	// Reaktiv: Füge Marker hinzu wenn neue Files mit GPS-Daten geladen werden
	$effect(() => {
		// Track sowohl fileList als auch loadingFiles, um auf Metadaten-Änderungen zu reagieren
		const files = fileState.fileList;
		const loadingCount = fileState.loadingCount;
		const selectedCount = fileState.selectedCount; // Track Selection-Änderungen
		const metadataSize = fileState.metadata.size; // Track Metadata-Änderungen

		// Force re-run when loadingCount, selection or metadata changes
		console.log(
			'Effect triggered. Files:',
			files.length,
			'Loading:',
			loadingCount,
			'Selected:',
			selectedCount,
			'Metadata:',
			metadataSize
		);

		(async () => {
			const Leaflet = await import('leaflet');

			for (const file of files) {
				const metadata = fileState.getMetadata(file);
				const isSelected = fileState.isSelected(file);

				// Prüfe ob Metadaten geladen sind
				if (metadata?.geoLocation) {
					const existingMarker = mapState.markers.get(file);
					const hasPositionChanged = existingMarker
						? existingMarker.getLatLng().lat !== metadata.geoLocation.latitude ||
							existingMarker.getLatLng().lng !== metadata.geoLocation.longitude
						: false;

					if (!existingMarker || hasPositionChanged) {
						// Marker existiert noch nicht oder Position hat sich geändert - erstelle/aktualisiere ihn
						console.log('Adding/updating marker for file:', file.name, metadata.geoLocation);
						mapState.addMarker(file, Leaflet, isSelected, metadata);
					} else {
						// Marker existiert und Position unverändert - aktualisiere nur die Farbe
						mapState.updateMarkerColor(file, isSelected, Leaflet);
					}
				}
			}

			// Entferne Marker für gelöschte Files
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
			<span>Click on the map to set location</span>
			<button class="cancel-btn" onclick={() => mapState.stopPickingLocation()}>Cancel</button>
		</div>
	{/if}
</div>

<style>
	.map-container {
		display: flex;
		flex-direction: column;

		flex: 1;

		border: 1px solid var(--border-accent-color);
		background-color: var(--content-bg-color);
		border-radius: 8px 8px 0 0;
		overflow: hidden;
	}

	.map {
		width: 100%;

		height: 100%;
		z-index: 0;
	}

	/* Leaflet Popup Styling anpassen */
	:global(.leaflet-popup-content-wrapper) {
		border-radius: 8px;
		font-family: 'Open Sans', sans-serif;
		padding: 0;
	}

	:global(.leaflet-popup-content) {
		margin: 0;
		font-size: 14px;
	}

	/* Custom Popup Content Styling */
	:global(.marker-popup) {
		min-width: 200px;
	}

	:global(.popup-header) {
		padding: 12px;
		border-bottom: 1px solid var(--border-accent-color);
	}

	:global(.popup-header h4) {
		margin: 0;
		font-size: 15px;
		font-weight: 500;
		color: rgb(32, 33, 36);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.popup-body) {
		padding: 12px;
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
		color: rgb(95, 99, 104);
	}

	:global(.popup-icon) {
		flex-shrink: 0;
		color: rgb(95, 99, 104);
	}

	:global(.popup-coordinates) {
		display: flex;
		gap: 0.25rem;
		font-variant-numeric: tabular-nums;
	}

	:global(.popup-separator) {
		opacity: 0.5;
	}

	/* Custom Marker Styling */
	:global(.custom-marker) {
		background: none;
		border: none;
	}

	:global(.custom-marker svg) {
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
		transition: transform 0.2s ease;
	}

	:global(.custom-marker:hover svg) {
		transform: scale(1.1);
	}

	/* Picker Mode Popover */
	#picker-popover {
		--popover-width: 320px;
		width: var(--popover-width);
		position: absolute;
		bottom: anchor(bottom);
		right: calc(anchor(center) - var(--popover-width) / 2);
		margin-bottom: 1rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 14px 20px;

		background-color: rgb(32, 33, 36);
		color: white;
		border-radius: 8px;
		box-shadow:
			0 2px 4px rgba(0, 0, 0, 0.2),
			0 4px 8px rgba(0, 0, 0, 0.15);

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

	.cancel-btn {
		flex-shrink: 0;
		padding: 6px 12px;
		background-color: rgba(255, 255, 255, 0.15);
		color: white;
		border: none;
		border-radius: 4px;
		font-size: 13px;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.cancel-btn:hover {
		background-color: rgba(255, 255, 255, 0.25);
	}
</style>
