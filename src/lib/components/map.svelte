<script lang="ts">
	import { onMount } from 'svelte';
	import { mapState } from '$lib/map-state.svelte';
	import { fileState } from '$lib/file-state.svelte';

	let mapContainer: HTMLDivElement;

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

			map.on('click', () => {
				mapState.clearFocus();
			});

			// Füge Marker für alle existierenden Files mit GPS-Daten hinzu
			for (const file of fileState.fileList) {
				const metadata = fileState.getMetadata(file);
				if (metadata?.geoLocation) {
					const isSelected = fileState.isSelected(file);
					mapState.addMarker(
						file,
						metadata.geoLocation.latitude,
						metadata.geoLocation.longitude,
						Leaflet,
						isSelected,
						metadata.fileSizeFormatted
					);
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

	// Reaktiv: Füge Marker hinzu wenn neue Files mit GPS-Daten geladen werden
	$effect(() => {
		// Track sowohl fileList als auch loadingFiles, um auf Metadaten-Änderungen zu reagieren
		const files = fileState.fileList;
		const loadingCount = fileState.loadingCount;
		const selectedCount = fileState.selectedCount; // Track Selection-Änderungen

		// Force re-run when loadingCount or selection changes
		console.log(
			'Effect triggered. Files:',
			files.length,
			'Loading:',
			loadingCount,
			'Selected:',
			selectedCount
		);

		(async () => {
			const Leaflet = await import('leaflet');

			for (const file of files) {
				const metadata = fileState.getMetadata(file);
				const isSelected = fileState.isSelected(file);

				// Prüfe ob Metadaten geladen sind
				if (metadata?.geoLocation) {
					if (!mapState.markers.has(file)) {
						// Marker existiert noch nicht - erstelle ihn
						console.log('Adding marker for file:', file.name, metadata.geoLocation);
						mapState.addMarker(
							file,
							metadata.geoLocation.latitude,
							metadata.geoLocation.longitude,
							Leaflet,
							isSelected,
							metadata.fileSizeFormatted
						);
					} else {
						// Marker existiert - aktualisiere nur die Farbe
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

<div class="map-container">
	<div bind:this={mapContainer} class="map"></div>
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
	:global(.popup-file-size) {
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
</style>
