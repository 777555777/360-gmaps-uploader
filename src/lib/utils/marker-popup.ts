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
					<svg
						class="popup-icon"
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
						<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
						<circle cx="12" cy="10" r="3"></circle>
					</svg>
					<div class="popup-coordinates">
						<span>${latitude.toFixed(5)}°</span>
						<span class="popup-separator">|</span>
						<span>${longitude.toFixed(5)}°</span>
					</div>
				</div>
				${
					fileSize
						? `
				<div class="popup-file-size">
					<svg
						class="popup-icon"
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
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
						<polyline points="14 2 14 8 20 8"></polyline>
						<line x1="16" y1="13" x2="8" y2="13"></line>
						<line x1="16" y1="17" x2="8" y2="17"></line>
						<line x1="10" y1="9" x2="8" y2="9"></line>
					</svg>
					<span>${fileSize}</span>
				</div>
				`
						: ''
				}
			</div>
		</div>
	`;
}
