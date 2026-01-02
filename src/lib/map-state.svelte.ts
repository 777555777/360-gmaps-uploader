import type * as Leaflet from 'leaflet';
import { SvelteMap } from 'svelte/reactivity';
import { createMarkerPopupHTML } from './utils/marker-popup';
import type { ImageMetadata } from './utils/image-helpers';

class MapState {
	// Leaflet Map instance
	map = $state<Leaflet.Map | null>(null);

	// Marker for each file with GPS data
	markers = new SvelteMap<File, Leaflet.Marker>();

	// Currently focused file (for map highlighting)
	focusedFile = $state<File | null>(null);

	// Coordinate picking mode (for geo edit from popover)
	isPickingLocation = $state<boolean>(false);
	pickingCallback = $state<((lat: number, lng: number) => void) | null>(null);

	clearFocus(closePopup: boolean = true): void {
		if (closePopup) {
			this.map?.closePopup();
		}
		this.focusedFile = null;
	}

	// Set the map instance
	setMap(mapInstance: Leaflet.Map): void {
		this.map = mapInstance;
	}

	// Create a custom marker icon (green for selected, blue for default)
	private createMarkerIcon(
		Leaflet: typeof import('leaflet'),
		isSelected: boolean
	): Leaflet.DivIcon {
		const color = isSelected ? 'var(--button-success)' : 'var(--button-primary)'; // green : blue

		return Leaflet.divIcon({
			html: `
				<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 24 34">
					<path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 5.25 8.5 17.5 8.5 17.5s8.5-12.25 8.5-17.5C20.5 3.81 16.69 0 12 0z" 
						fill="${color}" stroke="white" stroke-width="1.5"/>
					<circle cx="12" cy="8.5" r="3" fill="white"/>
				</svg>
			`,
			className: 'custom-marker',
			iconSize: [32, 42],
			iconAnchor: [16, 42],
			popupAnchor: [0, -42]
		});
	}

	// Focus on a specific position
	focusLocation(lat: number, lng: number, zoom: number = 17): void {
		if (!this.map) return;

		// flyTo for smoother animation and better centering
		this.map.flyTo([lat, lng], zoom, {
			duration: 0.8
		});
	}

	// Add a marker for a file
	addMarker(
		file: File,
		Leaflet: typeof import('leaflet'),
		isSelected: boolean,
		metadata: ImageMetadata
	): void {
		if (!this.map || !metadata.geoLocation) return;

		const { latitude, longitude } = metadata.geoLocation;

		// Remove existing marker if present
		this.removeMarker(file);

		// Create custom icon based on selection state
		const icon = this.createMarkerIcon(Leaflet, isSelected);

		// Create formatted popup content
		const popupContent = createMarkerPopupHTML(metadata);

		// Create new marker
		const marker = Leaflet.marker([latitude, longitude], { icon })
			.addTo(this.map)
			.bindPopup(popupContent, {
				maxWidth: 300,
				className: 'custom-popup'
			});

		marker.on('click', (event: Leaflet.LeafletMouseEvent) => {
			event.originalEvent?.stopPropagation?.();
			this.focusedFile = file;
		});

		marker.on('popupopen', () => {
			this.focusedFile = file;
		});

		marker.on('popupclose', () => {
			if (this.focusedFile === file) {
				this.focusedFile = null;
			}
		});

		this.markers.set(file, marker);
	}

	// Update marker color based on selection state
	updateMarkerColor(file: File, isSelected: boolean, Leaflet: typeof import('leaflet')): void {
		const marker = this.markers.get(file);
		if (marker) {
			const icon = this.createMarkerIcon(Leaflet, isSelected);
			marker.setIcon(icon);
		}
	}

	// Update marker position (called synchronously on geo changes)
	updateMarkerPosition(
		file: File,
		Leaflet: typeof import('leaflet'),
		isSelected: boolean,
		metadata: ImageMetadata
	): void {
		if (!this.map || !metadata.geoLocation) return;

		const { latitude, longitude } = metadata.geoLocation;

		// Remove old marker and create new one with new position
		const oldMarker = this.markers.get(file);
		if (oldMarker) {
			// Check if position really changed
			const oldLatLng = oldMarker.getLatLng();
			if (oldLatLng.lat === latitude && oldLatLng.lng === longitude) {
				// Position unchanged, only update color
				this.updateMarkerColor(file, isSelected, Leaflet);
				return;
			}
		}

		// Position has changed or marker doesn't exist - create new one
		this.addMarker(file, Leaflet, isSelected, metadata);
	}

	// Remove a marker
	removeMarker(file: File): void {
		const marker = this.markers.get(file);
		if (marker) {
			marker.remove();
			this.markers.delete(file);
			if (this.focusedFile === file) {
				this.clearFocus(false);
			}
		}
	}

	// Remove all markers
	clearMarkers(): void {
		this.markers.forEach((marker) => marker.remove());
		this.markers.clear();
		this.clearFocus(false);
	}

	// Focus on a marker and open popup
	focusMarker(file: File): void {
		const marker = this.markers.get(file);
		if (marker && this.map) {
			this.focusedFile = file;
			const latLng = marker.getLatLng();
			this.focusLocation(latLng.lat, latLng.lng);

			// Open popup after short delay (for smooth animation)
			setTimeout(() => {
				marker.openPopup();
			}, 100);
		} else {
			// Marker doesn't exist yet, but we can still focus
			// This happens e.g. when geodata was just updated
			console.warn('Marker not found for file:', file.name);
		}
	}

	// Getter
	get hasMap(): boolean {
		return this.map !== null;
	}

	get markerCount(): number {
		return this.markers.size;
	}

	isFocused(file: File): boolean {
		return this.focusedFile === file;
	}

	// Activate coordinate picking mode
	startPickingLocation(callback: (lat: number, lng: number) => void): void {
		this.isPickingLocation = true;
		this.pickingCallback = callback;
	}

	// Deactivate coordinate picking mode
	stopPickingLocation(): void {
		this.isPickingLocation = false;
		this.pickingCallback = null;
	}

	// Execute picking callback (called by map component)
	executePickingCallback(lat: number, lng: number): void {
		if (this.pickingCallback) {
			this.pickingCallback(lat, lng);
			this.stopPickingLocation();
		}
	}
}

export const mapState = new MapState();
