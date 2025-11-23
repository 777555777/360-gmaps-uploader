const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;
const fileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text-icon lucide-file-text"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`;
const calendarSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-calendar-icon lucide-calendar"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>`;
const cameraSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-camera-icon lucide-camera"><path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/></svg>`;

import type { ImageMetadata } from './image-helpers';

/**
 * Formatiert ein Date-Objekt zu einem lesbaren String
 */
function formatDateTime(date: Date): string {
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	};
	return date.toLocaleString(navigator.language || 'en-GB', options);
}

/**
 * Erstellt HTML für ein Leaflet Marker-Popup im gleichen Stil wie die Upload-Card
 */
export function createMarkerPopupHTML(metadata: ImageMetadata): string {
	if (!metadata.geoLocation) {
		throw new Error('Metadata must contain geoLocation');
	}

	const { latitude, longitude } = metadata.geoLocation;
	const parts: string[] = [];

	// GPS-Koordinaten (immer vorhanden)
	parts.push(`
		<div class="popup-geo-data">
			${markerSvg}
			<div class="popup-coordinates">
				<span>${latitude.toFixed(5)}°</span>
				<span class="popup-separator">|</span>
				<span>${longitude.toFixed(5)}°</span>
			</div>
		</div>
	`);

	// Dateigröße
	if (metadata.fileSizeFormatted) {
		parts.push(`
			<div class="popup-file-size">
				${fileSvg}
				<span>${metadata.fileSizeFormatted}</span>
			</div>
		`);
	}

	// Aufnahmedatum
	if (metadata.dateTime) {
		parts.push(`
			<div class="popup-datetime">
				${calendarSvg}
				<span>${formatDateTime(metadata.dateTime)}</span>
			</div>
		`);
	}

	// Kamera-Information
	if (metadata.make || metadata.model) {
		const cameraInfo = [metadata.make, metadata.model].filter(Boolean).join(' ');
		parts.push(`
			<div class="popup-camera">
				${cameraSvg}
				<span>${cameraInfo}</span>
			</div>
		`);
	}

	return `
		<div class="marker-popup">
			<div class="popup-header" style="text-align: center;">
				<h4>${metadata.fileName}</h4>
			</div>
			<div class="popup-body" style="align-items: left;">
				${parts.join('')}
			</div>
		</div>
	`;
}
