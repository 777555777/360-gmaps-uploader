<script lang="ts">
	import { gpxState, type GPXMatchResult, type UnmatchedReason } from '$lib/gpx-state.svelte';
	import { fileState } from '$lib/file-state.svelte';
	import { formatTimeDifference } from '$lib/utils/gpx-helpers';
	import { closeDialogById } from '$lib/utils/dialog-helpers';
	import { GPX_MATCH_DIALOG_ID } from '$lib/globals';
	import { Image, CheckCircle, AlertTriangle, SkipForward, FastForward } from '@lucide/svelte';
	import Badge from '$lib/components/util/badge.svelte';
	import Accordion from '../util/accordion.svelte';

	/**
	 * GPX Match Status for Badge Display
	 * Maps to Badge component's BadgeLevel type:
	 * - 'success': Match (green) - Time difference within threshold (≤60s), e.g., "Match (±45s)"
	 * - 'warning': Approximate (yellow) - Time difference acceptable but larger, e.g., "Approx (±2m 30s)"
	 * - 'neutral': Skipped (gray) - File already has GPS data
	 * - 'danger': Unmatched (red) - No match found or time difference too large
	 */
	type GpxMatchBadgeLevel = 'success' | 'warning' | 'neutral' | 'danger';

	let isProcessing = $state(false);

	// Files matched to GPX track (only files WITHOUT existing GPS data)
	let matchedFiles = $derived(gpxState.matchedFilesList);
	let allUnmatchedFiles = $derived(gpxState.unmatchedFilesList);

	// Separate skipped files (already have GPS) from truly unmatched files
	let skippedFiles = $derived(allUnmatchedFiles.filter((f) => f.reason === 'Already has GPS data'));
	let unmatchedFiles = $derived(
		allUnmatchedFiles.filter((f) => f.reason !== 'Already has GPS data')
	);

	let totalFileCount = $derived(matchedFiles.length + skippedFiles.length + unmatchedFiles.length);

	// Combined list for display
	let allFiles = $derived([...matchedFiles, ...skippedFiles, ...unmatchedFiles]);

	/**
	 * Format timestamp for display (e.g., "2024-01-20 14:35:42")
	 */
	function formatTimestamp(date: Date | undefined): string {
		if (!date) return 'No timestamp';
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hours = String(date.getHours()).padStart(2, '0');
		const minutes = String(date.getMinutes()).padStart(2, '0');
		const seconds = String(date.getSeconds()).padStart(2, '0');
		return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
	}

	/**
	 * Get badge level and message for any file (matched, skipped, or unmatched)
	 */
	function getBadgeInfo(item: GPXMatchResult | UnmatchedReason): {
		level: GpxMatchBadgeLevel;
		message: string;
	} {
		// Check if it's an unmatched file
		if ('reason' in item) {
			// Skipped: already has GPS data
			if (item.reason === 'Already has GPS data') {
				return { level: 'neutral', message: 'Skipped' };
			}
			// Unmatched: no match found
			return { level: 'danger', message: 'No match' };
		}

		// It's a matched file - all matches are displayed as success (green)
		return { level: 'success', message: 'Matched' };
	}

	/**
	 * Get formatted offset string with sign (e.g., "+45s" or "-2m 30s")
	 */
	function getOffsetLabel(item: GPXMatchResult | UnmatchedReason): string | null {
		if (!('suggestedGPS' in item)) return null;
		return `${item.offsetSign}${formatTimeDifference(item.timeDifference)}`;
	}

	async function handleApply(): Promise<void> {
		if (isProcessing) return;

		isProcessing = true;

		try {
			// Apply GPS coordinates to matched files
			for (const match of matchedFiles) {
				fileState.updateGeolocation(
					match.file,
					match.suggestedGPS.latitude,
					match.suggestedGPS.longitude
				);
			}

			gpxState.clear();
			closeDialogById(GPX_MATCH_DIALOG_ID);
		} finally {
			isProcessing = false;
		}
	}

	function handleCancel(): void {
		gpxState.clear();
		closeDialogById(GPX_MATCH_DIALOG_ID);
	}
</script>

<div class="gpx-match-container">
	<!-- File Summary -->
	<div class="file-summary">
		<p>
			<strong>{matchedFiles.length}</strong> of <strong>{totalFileCount}</strong>
			{totalFileCount === 1 ? 'photo' : 'photos'}
			will be updated
		</p>

		<small>Files that already have GPS data are skipped</small>
	</div>

	<div class="badges-container">
		{#if matchedFiles.length > 0}
			<Badge level="success" message="{matchedFiles.length} matched">
				{#snippet icon()}
					<CheckCircle size={16} />
				{/snippet}
			</Badge>
		{/if}

		{#if skippedFiles.length > 0}
			<Badge level="neutral" message="{skippedFiles.length} skipped">
				{#snippet icon()}
					<!-- <SkipForward size={16} /> -->
					<FastForward size={16} />
				{/snippet}
			</Badge>
		{/if}

		{#if unmatchedFiles.length > 0}
			<Badge level="danger" message="{unmatchedFiles.length} unmatched">
				{#snippet icon()}
					<AlertTriangle size={16} />
				{/snippet}
			</Badge>
		{/if}
	</div>

	<div class="desktop-tablet">
		{@render fileList()}
	</div>
	<div class="mobile">
		<Accordion summaryTitle="View all files">
			{#snippet content()}
				{@render fileList()}
			{/snippet}
		</Accordion>
	</div>

	{#snippet fileList()}
		<!-- File List (shows all files: matched and unmatched) -->
		{#if allFiles.length > 0}
			<ul class="file-list">
				{#each allFiles as item (item.file)}
					{@const isMatched = 'suggestedGPS' in item}
					{@const isSkipped = 'reason' in item && item.reason === 'Already has GPS data'}
					{@const badgeInfo = getBadgeInfo(item)}
					{@const offsetLabel = getOffsetLabel(item)}
					{@const metadata = fileState.getMetadata(item.file)}
					{@const timestamp = formatTimestamp(metadata?.dateTime)}
					<li class="file-item {isMatched ? 'ready' : isSkipped ? 'skipped' : 'unmatched'}">
						<span class="file-icon">
							<Image size={16} />
						</span>
						<div class="file-info">
							<span class="file-name">{item.file.name}</span>
							<span class="file-timestamp">{timestamp}</span>
						</div>
						{#if offsetLabel}
							<span class="offset-label">{offsetLabel}</span>
						{/if}
						<Badge level={badgeInfo.level} message={badgeInfo.message} />
					</li>
				{/each}
			</ul>
		{/if}
	{/snippet}

	<!-- Actions -->
	<div class="dialog-actions">
		<button class="secondary-btn" onclick={handleCancel} disabled={isProcessing}>Cancel</button>
		{#if matchedFiles.length !== 0}
			<button
				class="primary-btn"
				onclick={handleApply}
				disabled={isProcessing || matchedFiles.length === 0}
			>
				{#if isProcessing}
					Applying...
				{:else if matchedFiles.length === 0}
					No images to update
				{:else}
					Apply to {matchedFiles.length} {matchedFiles.length === 1 ? 'image' : 'images'}
				{/if}
			</button>
		{/if}
	</div>
</div>

<style>
	.gpx-match-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	/* File Summary (same as publish-dialog) */
	.file-summary {
		padding: 0.75rem;
		background-color: var(--surface-subtle);
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;

		p {
			margin: 0;
		}

		small {
			color: var(--text-muted);
		}
	}

	.badges-container {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	/* File List (same as publish-dialog) */
	.file-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border-radius: 4px;
		max-height: 320px;
		overflow-y: auto;
	}

	.file-item {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem 0.75rem;
		font-size: 13px;
		border-bottom: 1px solid var(--border-subtle);
		color: var(--text-default);

		@media (max-width: 576px) {
			padding: 0.25rem 0.25rem;
		}
	}

	.file-item:last-child {
		border-bottom: none;
	}

	.file-item.skipped {
		.file-icon,
		.file-name,
		.file-timestamp {
			color: var(--text-subtle);
		}
	}

	.file-item.unmatched {
		.file-icon,
		.file-name,
		.file-timestamp {
			color: var(--chip-danger-fg);
		}
	}

	.file-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;

		@media (max-width: 576px) {
			display: none;
		}
	}

	.file-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		overflow: hidden;
		min-width: 0;
	}

	.file-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 13px;
	}

	.file-timestamp {
		color: var(--text-muted);
		font-size: 11px;
		white-space: nowrap;
	}

	.offset-label {
		flex-shrink: 0;
		color: var(--text-muted);
		font-size: 11px;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}

	/* Mobile Responsive */
	.mobile {
		display: none;
	}

	@media (max-width: 576px) {
		.mobile {
			display: block;
		}
		.desktop-tablet {
			display: none;
		}

		.file-list {
			max-height: 160px;
		}
	}
</style>
