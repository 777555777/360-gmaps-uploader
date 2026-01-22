import { SvelteMap } from 'svelte/reactivity';
import type { GeoCoordinates } from './utils/image-helpers';

/**
 * Represents a single GPS track point from GPX file
 */
export interface GPXTrackPoint {
	latitude: number;
	longitude: number;
	elevation?: number;
	time?: Date;
}

/**
 * Match confidence levels based on time difference
 * - 'match': Time difference within acceptable threshold (green badge)
 * - 'approximate': Time difference larger but still within max threshold (yellow badge)
 */
export type MatchConfidence = 'match' | 'approximate';

/**
 * Result of matching a file to a GPX track point
 */
export interface GPXMatchResult {
	file: File;
	suggestedGPS: GeoCoordinates;
	matchConfidence: MatchConfidence;
	timeDifference: number; // seconds (absolute value)
	offsetSign: '+' | '-'; // + if photo taken after GPX point, - if before
}

/**
 * Reason why a file couldn't be matched
 */
export interface UnmatchedReason {
	file: File;
	reason: string;
}

/**
 * State for managing GPX file uploads and GPS coordinate matching.
 *
 * Handles parsing GPX track data, matching images to track points by timestamp,
 * and providing UI state for the match confirmation dialog.
 */
class GPXState {
	// Parsed track points from GPX file
	trackPoints = $state<GPXTrackPoint[]>([]);

	// Files successfully matched with GPX coordinates
	matchedFiles = new SvelteMap<File, GPXMatchResult>();

	// Files that couldn't be matched with reason
	unmatchedFiles = new SvelteMap<File, UnmatchedReason>();

	// User-adjustable threshold in seconds (default: 5 minutes)
	maxTimeDifferenceSeconds = $state(300); // Can be made dynamic in the future

	// Processing state
	isProcessing = $state(false);
	parseError = $state<string | null>(null);

	// Track if the match dialog is active
	isActive = $state(false);

	/**
	 * Parse a GPX file and extract track points
	 */
	async parseGPX(file: File, parser: (file: File) => Promise<GPXTrackPoint[]>): Promise<void> {
		this.isProcessing = true;
		this.parseError = null;

		try {
			this.trackPoints = await parser(file);

			if (this.trackPoints.length === 0) {
				this.parseError = 'No track points found in GPX file';
			}
		} catch (error) {
			this.parseError = error instanceof Error ? error.message : 'Failed to parse GPX file';
		} finally {
			this.isProcessing = false;
		}
	}

	/**
	 * Match files to track points based on timestamps
	 */
	matchFilesToTrack(
		files: File[],
		getMetadata: (file: File) => { dateTime?: Date; geoLocation?: GeoCoordinates } | undefined,
		matcher: (
			file: File,
			trackPoints: GPXTrackPoint[],
			maxDiff: number,
			metadata: { dateTime?: Date; geoLocation?: GeoCoordinates } | undefined
		) => GPXMatchResult | UnmatchedReason
	): void {
		this.matchedFiles.clear();
		this.unmatchedFiles.clear();

		for (const file of files) {
			const metadata = getMetadata(file);
			const result = matcher(file, this.trackPoints, this.maxTimeDifferenceSeconds, metadata);

			if ('suggestedGPS' in result) {
				// It's a match
				this.matchedFiles.set(file, result);
			} else {
				// It's unmatched
				this.unmatchedFiles.set(file, result);
			}
		}

		this.isActive = this.matchedFiles.size > 0 || this.unmatchedFiles.size > 0;
	}

	/**
	 * Re-match files with new threshold
	 */
	rematch(
		files: File[],
		getMetadata: (file: File) => { dateTime?: Date; geoLocation?: GeoCoordinates } | undefined,
		matcher: (
			file: File,
			trackPoints: GPXTrackPoint[],
			maxDiff: number,
			metadata: { dateTime?: Date; geoLocation?: GeoCoordinates } | undefined
		) => GPXMatchResult | UnmatchedReason
	): void {
		this.matchFilesToTrack(files, getMetadata, matcher);
	}

	/**
	 * Get list of matched files
	 */
	get matchedFilesList(): GPXMatchResult[] {
		return Array.from(this.matchedFiles.values());
	}

	/**
	 * Get list of unmatched files
	 */
	get unmatchedFilesList(): UnmatchedReason[] {
		return Array.from(this.unmatchedFiles.values());
	}

	/**
	 * Count of matched files
	 */
	get matchedCount(): number {
		return this.matchedFiles.size;
	}

	/**
	 * Count of unmatched files
	 */
	get unmatchedCount(): number {
		return this.unmatchedFiles.size;
	}

	/**
	 * Whether there are any matches
	 */
	get hasMatches(): boolean {
		return this.matchedFiles.size > 0;
	}

	/**
	 * Whether there are unmatched files
	 */
	get hasUnmatched(): boolean {
		return this.unmatchedFiles.size > 0;
	}

	/**
	 * Clear all state
	 */
	clear(): void {
		this.trackPoints = [];
		this.matchedFiles.clear();
		this.unmatchedFiles.clear();
		this.parseError = null;
		this.isActive = false;
		// Keep threshold - user preference
	}
}

// Singleton instance
export const gpxState = new GPXState();
