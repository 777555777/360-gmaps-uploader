<script lang="ts">
	import { gpanoFixState } from '$lib/gpano-fix-state.svelte';
	import { fileState } from '$lib/file-state.svelte';
	import { injectGPanoMetadata, type GPanoMetadata } from '$lib/utils/image-helpers';
	import { closeDialogById } from '$lib/utils/dialog-helpers';
	import { GPANO_FIX_DIALOG_ID } from '$lib/globals';
	import { Wrench, FileX, CircleCheck } from '@lucide/svelte';
	import Accordion from '$lib/components/util/accordion.svelte';
	import Badge from '../util/badge.svelte';

	let isProcessing = $state(false);
	let processedCount = $state(0);

	// Determine dialog mode based on what files we have
	let hasOnlyRejected = $derived(
		gpanoFixState.rejectedCount > 0 &&
			gpanoFixState.fixableCount === 0 &&
			gpanoFixState.validCount === 0
	);

	let hasValidAndRejected = $derived(
		gpanoFixState.validCount > 0 &&
			gpanoFixState.rejectedCount > 0 &&
			gpanoFixState.fixableCount === 0
	);

	let hasFixable = $derived(gpanoFixState.fixableCount > 0);

	// Dynamic title/subtitle based on state
	let infoTitle = $derived.by(() => {
		if (hasOnlyRejected) return 'Some images could not be added';
		if (hasValidAndRejected) return 'Some images could not be added';
		return 'Preparing your images';
	});

	let infoText = $derived.by(() => {
		if (hasOnlyRejected) {
			return "The selected images don't meet the requirements for Google Street View. Please check the details below.";
		}
		if (hasValidAndRejected) {
			return 'Some images were added successfully, but others could not be processed.';
		}
		return 'Some images need additional metadata for Google Street View. These images will be prepared automatically before publishing, the image content itself will remain unchanged.';
	});

	async function handleAutoFix(): Promise<void> {
		if (isProcessing) return;

		isProcessing = true;
		processedCount = 0;

		const fixedFiles: File[] = [];

		try {
			for (const item of gpanoFixState.fixableFiles) {
				try {
					const fixedFile = await injectGPanoMetadata(item.file, item.suggestedGPano);
					fixedFiles.push(fixedFile);
					processedCount++;
				} catch (error) {
					console.error(`Failed to fix ${item.file.name}:`, error);
				}
			}

			if (fixedFiles.length > 0) {
				fileState.addFiles(fixedFiles);
			}

			if (gpanoFixState.validFiles.length > 0) {
				fileState.addFiles(gpanoFixState.validFiles);
			}

			gpanoFixState.clear();
			closeDialogById(GPANO_FIX_DIALOG_ID);
		} finally {
			isProcessing = false;
		}
	}

	function handleAddValidOnly(): void {
		if (gpanoFixState.validFiles.length > 0) {
			fileState.addFiles(gpanoFixState.validFiles);
		}
		gpanoFixState.clear();
		closeDialogById(GPANO_FIX_DIALOG_ID);
	}

	function handleClose(): void {
		gpanoFixState.clear();
		closeDialogById(GPANO_FIX_DIALOG_ID);
	}

	// Helper function to get ALL metadata fields that will be written
	// Since we completely replace XMP with clean GPano-only data, show all fields
	function getNewMetadata(suggestedGPano: GPanoMetadata): Array<{ field: string; value: string }> {
		return (Object.entries(suggestedGPano) as [string, string | undefined][])
			.filter(([, value]) => value !== undefined)
			.map(([key, value]) => ({
				field: `GPano:${key}`,
				value: value!
			}));
	}

	/**
	 * Helper functions for readable image count display
	 * Handles singular/plural forms for different image states
	 */
	function pluralize(count: number, singular: string = 'image'): string {
		return count === 1 ? singular : `${singular}s`;
	}

	// Derived suffix texts for chips (count is shown separately in template with <strong>)
	let validSuffix = $derived(`${pluralize(gpanoFixState.validCount)} ready`);
	let fixableSuffix = $derived(`${pluralize(gpanoFixState.fixableCount)} to prepare`);
	let rejectedSuffix = $derived.by(() => {
		const verb = gpanoFixState.rejectedCount === 1 ? 'is' : 'are';
		return `${pluralize(gpanoFixState.rejectedCount)} ${verb} invalid`;
	});

	let totalAddableCount = $derived(gpanoFixState.validCount + gpanoFixState.fixableCount);
	let addButtonText = $derived.by(() => {
		if (isProcessing) {
			return `Preparing... (${processedCount}/${gpanoFixState.fixableCount})`;
		}
		return `Add all images (${totalAddableCount})`;
	});
</script>

<div class="dialog-container">
	<div class="dialog-content">
		<!-- Info Banner -->
		<div class="info-banner {hasOnlyRejected || hasValidAndRejected ? 'error' : ''}">
			<div class="info-text">
				<strong>{infoTitle}</strong>
				<p>{infoText}</p>
			</div>
		</div>

		<!-- Summary Pills -->
		<div class="summary">
			{#if gpanoFixState.validCount > 0}
				<Badge message={`${gpanoFixState.validCount} ${validSuffix}`} level="success">
					{#snippet icon()}
						<CircleCheck size={16} />
					{/snippet}
				</Badge>
			{/if}
			{#if gpanoFixState.fixableCount > 0}
				<Badge message={`${gpanoFixState.fixableCount} ${fixableSuffix}`} level="info">
					{#snippet icon()}
						<Wrench size={16} />
					{/snippet}
				</Badge>
			{/if}
			{#if gpanoFixState.rejectedCount > 0}
				<Badge message={`${gpanoFixState.rejectedCount} ${rejectedSuffix}`} level="danger">
					{#snippet icon()}
						<FileX size={16} />
					{/snippet}
				</Badge>
			{/if}
		</div>

		<!-- Fixable Files Section -->
		{#if hasFixable}
			<div class="section info">
				<h3>Images that will be prepared automatically</h3>
				<p class="metadata-info">Required GPano metadata will be added before publishing.</p>
				{#each gpanoFixState.fixableFiles as item (item.file.name)}
					<Accordion name="file-details" summaryTitle={item.file.name}>
						{#snippet header()}
							<Wrench size={16} />
						{/snippet}
						{#snippet content()}
							<ul class="metadata-list">
								{#each getNewMetadata(item.suggestedGPano) as { field, value }}
									<li>
										<code>{field}</code> = <code>{value}</code>
									</li>
								{/each}
							</ul>
						{/snippet}
					</Accordion>
				{/each}
			</div>
		{/if}

		<!-- Rejected Files Section -->
		{#if gpanoFixState.hasRejectedFiles}
			<div class="section rejection {hasOnlyRejected ? 'rejected-only' : ''}">
				<h3>Images that cannot be added</h3>
				{#each gpanoFixState.rejectedFiles as { file, errors }, index (file.name)}
					<Accordion name="rejected-files" summaryTitle={file.name} open={index === 0}>
						{#snippet header()}
							<FileX size={16} />
						{/snippet}
						{#snippet content()}
							<ul class="error-list">
								{#each errors as error}
									<li>{error}</li>
								{/each}
							</ul>
						{/snippet}
					</Accordion>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Actions -->
	<div class="dialog-actions">
		{#if hasOnlyRejected}
			<!-- Only rejected: just close -->
			<button class="secondary-btn" onclick={handleClose}>Close</button>
		{:else if hasValidAndRejected}
			<!-- Valid + rejected: add valid ones -->
			<button class="secondary-btn" onclick={handleClose}>Cancel</button>
			<button class="primary-btn" onclick={handleAddValidOnly}>
				<span class="btn-text">Add all ready images ({gpanoFixState.validCount})</span>
				<span class="small-screen">Add ready ({gpanoFixState.validCount})</span>
			</button>
		{:else if hasFixable}
			<!-- Fixable files present -->
			{#if gpanoFixState.validCount > 0}
				<button class="secondary-btn" onclick={handleAddValidOnly} disabled={isProcessing}>
					<span class="btn-text">Only add ready ({gpanoFixState.validCount})</span>
					<span class="small-screen">Add ready ({gpanoFixState.validCount})</span>
				</button>
			{:else}
				<button class="secondary-btn" onclick={handleClose} disabled={isProcessing}>
					Cancel
				</button>
			{/if}
			<button class="primary-btn" onclick={handleAutoFix} disabled={isProcessing}>
				{addButtonText}
			</button>
		{/if}
	</div>
</div>

<style>
	.small-screen {
		display: none;
	}

	@media (max-width: 448px) {
		.btn-text {
			display: none;
		}
		.small-screen {
			display: inline;
		}
	}

	.dialog-content {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	/* Info Banner Section */
	.info-banner {
		display: flex;
		gap: 12px;
		padding: 16px;
		background-color: var(--chip-primary-bg);
		border-radius: 8px;
		color: var(--chip-primary-fg);

		div.info-text {
			display: flex;
			flex-direction: column;
			gap: 4px;

			strong {
				font-size: 15px;
			}

			p {
				color: var(--chip-primary-fg);
			}
		}
	}

	/* Cascade override info style with error style */
	.info-banner.error {
		background-color: var(--chip-danger-bg);
		color: var(--chip-danger-fg);

		div.info-text {
			p {
				color: var(--chip-danger-fg);
			}
		}
	}
	/* ====================================================== */

	/* Summary Chips Section */
	.summary {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	/* ====================================================== */

	/* Sections for file lists */
	.section {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;

		h3 {
			font-size: 14px;
			font-weight: 600;
		}

		&.info h3 {
			color: var(--chip-primary-fg);
		}
		&.rejection h3 {
			color: var(--chip-danger-fg);
		}
	}

	.section.rejected-only {
		padding-top: 0;
		border-top: none;
	}

	/* Metadata details */
	.metadata-info {
		font-size: 12px;
		color: var(--text-subtle);
		margin: 0;
	}

	.metadata-list {
		list-style: none;
		padding-inline: 0.5rem;
		margin: 0;
		font-size: 12px;
		line-height: 1.6;
		color: var(--chip-primary-fg);

		li {
			margin: 0;
		}
	}

	.metadata-list code {
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', monospace;
		font-size: 11px;
		border-radius: 3px;
	}

	/* Error details */
	.error-list {
		list-style: none;
		padding-inline: 0.5rem;
		margin: 0;
		font-size: 13px;
		line-height: 1.6;
		color: var(--chip-danger-fg);

		li {
			margin: 0;
			padding: 0.25rem 0;
		}
	}

	/* Danger icon styling */
	:global(.icon-danger) {
		color: var(--chip-danger-fg) !important;
	}

	.dialog-actions {
		margin-top: 1rem;
	}
</style>
