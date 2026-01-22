import type { GeoCoordinates } from './image-helpers';
import type {
	GPXTrackPoint,
	GPXMatchResult,
	UnmatchedReason,
	MatchConfidence
} from '../gpx-state.svelte';

// ============================================================
// GPX MATCHING CONFIGURATION
// ============================================================

/**
 * Maximum time difference (in seconds) for a 'match' confidence.
 * Files within this threshold get a green "Match" badge.
 */
const MATCH_THRESHOLD_SECONDS = 60; // 1 minute

/**
 * Maximum allowed time difference (in seconds) for matching.
 * Files beyond this threshold are marked as "unmatched".
 * Default: 5 minutes (300 seconds)
 */
export const DEFAULT_MAX_TIME_DIFFERENCE_SECONDS = 300;

// ============================================================

/**
 * Parse a GPX file and extract track points.
 * Uses DOMParser to parse GPX XML format.
 *
 * Supports all GPX point formats:
 * - Track points (<trkpt>) from recorded GPS tracks
 * - Route points (<rtept>) from planned routes
 * - Waypoints (<wpt>) for individual marked locations
 *
 * @param file - The GPX file to parse
 * @returns Array of track points with coordinates and timestamps
 * @throws Error if file is not valid GPX or contains no points
 */
export async function parseGPXFile(file: File): Promise<GPXTrackPoint[]> {
	const text = await file.text();
	const parser = new DOMParser();
	const doc = parser.parseFromString(text, 'application/xml');

	// Check for parse errors
	const parseError = doc.querySelector('parsererror');
	if (parseError) {
		throw new Error('Invalid GPX file: XML parsing failed');
	}

	const trackPoints: GPXTrackPoint[] = [];

	// Extract points from all GPX formats:
	// 1. Track points (<trkpt>) - recorded tracks
	// 2. Route points (<rtept>) - planned routes
	// 3. Waypoints (<wpt>) - individual points
	const trkpts = doc.querySelectorAll('trkpt');
	const rtepts = doc.querySelectorAll('rtept');
	const wpts = doc.querySelectorAll('wpt');

	const allPoints = [...Array.from(trkpts), ...Array.from(rtepts), ...Array.from(wpts)];

	if (allPoints.length === 0) {
		throw new Error('No track points, route points, or waypoints found in GPX file');
	}

	for (const point of allPoints) {
		const lat = point.getAttribute('lat');
		const lon = point.getAttribute('lon');

		if (!lat || !lon) continue;

		const latitude = parseFloat(lat);
		const longitude = parseFloat(lon);

		if (isNaN(latitude) || isNaN(longitude)) continue;

		// Extract optional elevation
		const eleElement = point.querySelector('ele');
		const elevation = eleElement?.textContent ? parseFloat(eleElement.textContent) : undefined;

		// Extract optional time
		const timeElement = point.querySelector('time');
		const time = timeElement?.textContent ? new Date(timeElement.textContent) : undefined;

		trackPoints.push({
			latitude,
			longitude,
			elevation,
			time
		});
	}

	return trackPoints;
}

/**
 * Match a file to the nearest track point based on timestamp.
 *
 * @param file - The file to match
 * @param trackPoints - Array of GPS track points from GPX
 * @param maxTimeDifferenceSeconds - Maximum allowed time difference for matching
 * @param metadata - Image metadata containing timestamp and existing GPS
 * @returns Match result or unmatched reason
 */
export function matchFileToTrack(
	file: File,
	trackPoints: GPXTrackPoint[],
	maxTimeDifferenceSeconds: number,
	metadata: { dateTime?: Date; geoLocation?: GeoCoordinates } | undefined
): GPXMatchResult | UnmatchedReason {
	// Skip files with existing GPS data
	if (metadata?.geoLocation !== undefined) {
		return {
			file,
			reason: 'Already has GPS data'
		};
	}

	// Check if file has timestamp
	if (!metadata?.dateTime) {
		return {
			file,
			reason: 'No timestamp in EXIF data'
		};
	}

	const fileTime = metadata.dateTime.getTime();

	// Filter track points that have timestamps
	const pointsWithTime = trackPoints.filter((p) => p.time !== undefined);

	if (pointsWithTime.length === 0) {
		return {
			file,
			reason: 'No timestamps in GPX track'
		};
	}

	// Find nearest track point by time
	let nearestPoint: GPXTrackPoint | null = null;
	let minTimeDiff = Infinity;
	let rawTimeDiff = 0; // Store raw difference to determine sign

	for (const point of pointsWithTime) {
		if (!point.time) continue;

		const rawDiff = fileTime - point.time.getTime();
		const timeDiff = Math.abs(rawDiff);

		if (timeDiff < minTimeDiff) {
			minTimeDiff = timeDiff;
			nearestPoint = point;
			rawTimeDiff = rawDiff;
		}
	}

	if (!nearestPoint) {
		return {
			file,
			reason: 'No matching track point found'
		};
	}

	// Convert time difference to seconds
	const timeDifferenceSeconds = Math.round(minTimeDiff / 1000);

	// Check if within threshold
	if (timeDifferenceSeconds > maxTimeDifferenceSeconds) {
		return {
			file,
			reason: `Time difference too large (${formatTimeDifference(timeDifferenceSeconds)})`
		};
	}

	// Determine match confidence based on time difference
	const matchConfidence: MatchConfidence =
		timeDifferenceSeconds <= MATCH_THRESHOLD_SECONDS ? 'match' : 'approximate';

	// Determine offset sign: + if photo taken after GPX point, - if before
	const offsetSign: '+' | '-' = rawTimeDiff >= 0 ? '+' : '-';

	return {
		file,
		suggestedGPS: {
			latitude: nearestPoint.latitude,
			longitude: nearestPoint.longitude
		},
		matchConfidence,
		timeDifference: timeDifferenceSeconds,
		offsetSign
	};
}

/**
 * Format time difference in human-readable format
 */
export function formatTimeDifference(seconds: number): string {
	if (seconds < 60) {
		return `${seconds}s`;
	} else if (seconds < 3600) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
	} else {
		const hours = Math.floor(seconds / 3600);
		const remainingMinutes = Math.floor((seconds % 3600) / 60);
		return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
	}
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(coords: GeoCoordinates): string {
	return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
}

/**
 * Get confidence badge class for styling
 */
export function getConfidenceBadgeClass(confidence: MatchConfidence): string {
	switch (confidence) {
		case 'match':
			return 'confidence-match';
		case 'approximate':
			return 'confidence-approximate';
	}
}

/**
 * Get confidence label for display
 */
export function getConfidenceLabel(confidence: MatchConfidence): string {
	switch (confidence) {
		case 'match':
			return 'Match';
		case 'approximate':
			return 'Approx';
	}
}
