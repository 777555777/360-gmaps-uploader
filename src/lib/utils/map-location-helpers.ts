import { timeZoneMap } from './tz-location-data';
import type { ZoneConfig } from './tz-location-data';

type MapPosition = ZoneConfig; // Alias for clarity

// Default position: Center of the world
const defaultMapPosition: MapPosition = {
	center: [30, 0],
	zoom: 3
};

export const mapPosition = guessLocationByTimezone() || defaultMapPosition;

export function guessLocationByTimezone(): MapPosition | null {
	const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
	if (!tz) return null;

	if (timeZoneMap.has(tz)) {
		return timeZoneMap.get(tz) ?? null;
	}

	// Grobe Regionen als Fallback
	const regionMap: Array<{ match: boolean; view: MapPosition }> = [
		{
			match: tz.startsWith('Europe/'),
			view: { center: [54, 15], zoom: 4 }
		},
		{
			match: tz.startsWith('America/'),
			view: { center: [39.5, -98.35], zoom: 4 }
		},
		{
			match: tz.startsWith('Asia/'),
			view: { center: [34.0479, 100.6197], zoom: 3 }
		},
		{
			match: tz.startsWith('Africa/'),
			view: { center: [1.6508, 17.6791], zoom: 3 }
		},
		{
			match: tz.startsWith('Australia/'),
			view: { center: [-25.2744, 133.7751], zoom: 4 }
		}
	];

	for (const region of regionMap) {
		if (region.match) return region.view;
	}

	return defaultMapPosition;
}
