const markerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin-icon lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>`;
const fileSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text-icon lucide-file-text"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>`;

/**
 * Erstellt HTML für ein Leaflet Marker-Popup im gleichen Stil wie die Upload-Card
 */
export function createMarkerPopupHTML(
	fileName: string,
	latitude: number,
	longitude: number,
	fileSize?: string
): string {
	return `
		<div class="marker-popup">
			<div class="popup-header" style="text-align: center;">
				<h4>${fileName}</h4>
			</div>
			<div class="popup-body" style="align-items: center;">
				<div class="popup-geo-data">
				${markerSvg}
					<div class="popup-coordinates">
						<span>${latitude.toFixed(5)}°</span>
						<span class="popup-separator">|</span>
						<span>${longitude.toFixed(5)}°</span>
					</div>
				</div>
				${fileSize ? `<div class="popup-file-size">${fileSvg}<span>${fileSize}</span></div>` : ''}
			</div>
		</div>
	`;
}
