import type * as Leaflet from 'leaflet';
import { SvelteMap } from 'svelte/reactivity';
import { createMarkerPopupHTML } from './utils/marker-popup';

class MapState {
	// Leaflet Map Instanz
	map = $state<Leaflet.Map | null>(null);

	// Marker für jedes File mit GPS-Daten
	markers = new SvelteMap<File, Leaflet.Marker>();

	// Aktuell fokussiertes File (für Karten-Hervorhebung)
	focusedFile = $state<File | null>(null);

	// Koordinaten-Picking-Mode (für Geo-Edit aus Popover)
	isPickingLocation = $state<boolean>(false);
	pickingCallback = $state<((lat: number, lng: number) => void) | null>(null);

	clearFocus(closePopup: boolean = true): void {
		if (closePopup) {
			this.map?.closePopup();
		}
		this.focusedFile = null;
	}

	// Setze die Map-Instanz
	setMap(mapInstance: Leaflet.Map): void {
		this.map = mapInstance;
	}

	// Erstelle ein custom Marker-Icon (grün für selected, blau für default)
	private createMarkerIcon(
		Leaflet: typeof import('leaflet'),
		isSelected: boolean
	): Leaflet.DivIcon {
		const color = isSelected ? '#2fa824' : '#3b82f6'; // green : blue

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

	// Fokussiere auf eine bestimmte Position
	focusLocation(lat: number, lng: number, zoom: number = 17): void {
		if (!this.map) return;

		// flyTo für smoothere Animation und besseres Centering
		this.map.flyTo([lat, lng], zoom, {
			duration: 0.8
		});
	}

	// Füge einen Marker für ein File hinzu
	addMarker(
		file: File,
		lat: number,
		lng: number,
		Leaflet: typeof import('leaflet'),
		isSelected: boolean = false,
		fileSize?: string
	): void {
		if (!this.map) return;

		// Entferne existierenden Marker falls vorhanden
		this.removeMarker(file);

		// Erstelle custom Icon basierend auf Selection-State
		const icon = this.createMarkerIcon(Leaflet, isSelected);

		// Erstelle formatierten Popup-Content
		const popupContent = createMarkerPopupHTML(file.name, lat, lng, fileSize);

		// Erstelle neuen Marker
		const marker = Leaflet.marker([lat, lng], { icon }).addTo(this.map).bindPopup(popupContent, {
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

	// Aktualisiere Marker-Farbe basierend auf Selection-State
	updateMarkerColor(file: File, isSelected: boolean, Leaflet: typeof import('leaflet')): void {
		const marker = this.markers.get(file);
		if (marker) {
			const icon = this.createMarkerIcon(Leaflet, isSelected);
			marker.setIcon(icon);
		}
	}

	// Aktualisiere Marker-Position (wird synchron aufgerufen bei Geo-Änderungen)
	updateMarkerPosition(
		file: File,
		lat: number,
		lng: number,
		Leaflet: typeof import('leaflet'),
		isSelected: boolean,
		fileSize?: string
	): void {
		if (!this.map) return;

		// Entferne alten Marker und erstelle neuen mit neuer Position
		const oldMarker = this.markers.get(file);
		if (oldMarker) {
			// Prüfe ob sich die Position wirklich geändert hat
			const oldLatLng = oldMarker.getLatLng();
			if (oldLatLng.lat === lat && oldLatLng.lng === lng) {
				// Position unverändert, nur Farbe aktualisieren
				this.updateMarkerColor(file, isSelected, Leaflet);
				return;
			}
		}

		// Position hat sich geändert oder Marker existiert nicht - neu erstellen
		this.addMarker(file, lat, lng, Leaflet, isSelected, fileSize);
	}

	// Entferne einen Marker
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

	// Entferne alle Marker
	clearMarkers(): void {
		this.markers.forEach((marker) => marker.remove());
		this.markers.clear();
		this.clearFocus(false);
	}

	// Fokussiere auf einen Marker und öffne Popup
	focusMarker(file: File): void {
		const marker = this.markers.get(file);
		if (marker && this.map) {
			this.focusedFile = file;
			const latLng = marker.getLatLng();
			this.focusLocation(latLng.lat, latLng.lng, 18);

			// Öffne Popup nach kurzer Verzögerung (für smooth animation)
			setTimeout(() => {
				marker.openPopup();
			}, 100);
		} else {
			// Marker existiert noch nicht, aber wir können trotzdem fokussieren
			// Das passiert z.B. wenn Geodaten gerade erst aktualisiert wurden
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

	// Aktiviere Koordinaten-Picking-Mode
	startPickingLocation(callback: (lat: number, lng: number) => void): void {
		this.isPickingLocation = true;
		this.pickingCallback = callback;
	}

	// Deaktiviere Koordinaten-Picking-Mode
	stopPickingLocation(): void {
		this.isPickingLocation = false;
		this.pickingCallback = null;
	}

	// Führe Picking-Callback aus (wird von Map-Komponente aufgerufen)
	executePickingCallback(lat: number, lng: number): void {
		if (this.pickingCallback) {
			this.pickingCallback(lat, lng);
			this.stopPickingLocation();
		}
	}
}

export const mapState = new MapState();
