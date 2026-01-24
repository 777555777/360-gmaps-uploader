<script lang="ts">
	import { fileState } from '$lib/file-state.svelte';
	import { authState } from '$lib/auth-state.svelte';
	import { consentState } from '$lib/consent-state.svelte';
	import { PUBLISH_DIALOG_ID, CONSENT_DIALOG_ID } from '$lib/globals';
	import { closeDialogById, showDialogById } from '$lib/utils/dialog-helpers';
	import { uploadPhoto, type UploadProgress, type UploadResult } from '$lib/utils/streetview-api';
	import { dateToUnixSeconds } from '$lib/utils/publish-helpers';
	import LoginBtn from '$lib/components/auth/login-btn.svelte';
	import {
		FlaskConical,
		Image,
		Link,
		Upload,
		Globe,
		CircleCheck,
		CircleX,
		Clock,
		ExternalLink
	} from '@lucide/svelte';
	import { PUBLIC_DRY_RUN } from '$env/static/public';
	import Badge, { type BadgeLevel } from '../util/badge.svelte';

	// ENV-based dry-run mode (forced in dev, disabled in prod)
	const DRY_RUN_MODE = PUBLIC_DRY_RUN === 'true';

	// Settings - if DRY_RUN_MODE is true, always use dry-run mode
	let dryRunMode = $state(DRY_RUN_MODE ? true : false);

	// Upload state
	let isUploading = $state(false);
	let currentFileIndex = $state(0);
	let currentProgress = $state<UploadProgress>({ step: 'Idle', message: '' });
	let results = $state<UploadResult[]>([]);

	// Frozen list of files for upload (stays stable during/after upload)
	let frozenFiles = $state<File[]>([]);

	// Derived
	let selectedFiles = $derived(fileState.selectedFileList);
	let totalFiles = $derived(selectedFiles.length);

	// Files ready for upload (have valid geolocation)
	let uploadableFiles = $derived(
		selectedFiles.filter((file) => {
			const meta = fileState.getMetadata(file);
			return meta?.geoLocation != null;
		})
	);

	let filesWithoutGeo = $derived(
		selectedFiles.filter((file) => {
			const meta = fileState.getMetadata(file);
			return meta?.geoLocation == null;
		})
	);

	// Use frozen list during/after upload, otherwise use live list
	let displayFiles = $derived(frozenFiles.length > 0 ? frozenFiles : uploadableFiles);
	let displayTotal = $derived(frozenFiles.length > 0 ? frozenFiles.length : totalFiles);

	function handleProgress(progress: UploadProgress) {
		currentProgress = progress;
	}

	async function startUpload() {
		// Check consent before upload
		if (consentState.hasConsented() !== true) {
			closeDialogById(PUBLISH_DIALOG_ID);
			showDialogById(CONSENT_DIALOG_ID);
			return;
		}

		if (!authState.accessToken || uploadableFiles.length === 0) return;

		// Freeze the current file list so it stays stable during upload
		frozenFiles = [...uploadableFiles];

		isUploading = true;
		results = [];
		currentFileIndex = 0;

		// Keep track of files to mark as published after upload completes
		const filesToPublish: File[] = [];

		for (let i = 0; i < frozenFiles.length; i++) {
			currentFileIndex = i;
			const file = frozenFiles[i];
			const meta = fileState.getMetadata(file);

			if (!meta?.geoLocation) continue;

			const result = await uploadPhoto({
				accessToken: authState.accessToken,
				file,
				latitude: meta.geoLocation.latitude,
				longitude: meta.geoLocation.longitude,
				heading: 0, // TODO: could add heading editing later
				captureTimeSeconds: meta.dateTime
					? dateToUnixSeconds(meta.dateTime)
					: Math.floor(Date.now() / 1000),
				dryRun: dryRunMode,
				onProgress: handleProgress
			});

			results = [...results, result];

			// Track successful uploads
			if (result.success) {
				filesToPublish.push(file);
			}
		}

		// Mark all successfully published files (deselects them automatically)
		for (const file of filesToPublish) {
			fileState.markAsPublished(file);
		}

		isUploading = false;
		currentProgress = { step: 'Done', message: 'All uploads completed!' };
	}

	function resetState() {
		isUploading = false;
		currentFileIndex = 0;
		currentProgress = { step: 'Idle', message: '' };
		results = [];
		frozenFiles = [];
	}

	function resetAndClose() {
		resetState();
		closeDialogById(PUBLISH_DIALOG_ID);
	}

	// Export reset function for dialog close callback
	export function onDialogClose() {
		resetState();
	}

	// Icon types for file status
	type IconType = 'image' | 'link' | 'upload' | 'globe' | 'check' | 'error' | 'clock';

	// Get status info for a file at a given index
	function getFileStatus(index: number): { icon: IconType; label: string; class: BadgeLevel } {
		const result = results[index];

		// Already has a result
		if (result) {
			if (result.success) {
				return { icon: 'check', label: result.dryRun ? 'Dry-run' : 'Published', class: 'success' };
			} else {
				return { icon: 'error', label: 'Failed', class: 'danger' };
			}
		}

		// Currently uploading this file
		if (isUploading && currentFileIndex === index) {
			const step = currentProgress.step;
			const iconMap: Record<string, IconType> = {
				startUpload: 'link',
				uploadBytes: 'upload',
				publish: 'globe',
				done: 'check',
				error: 'error'
			};
			return { icon: iconMap[step] || 'clock', label: step, class: 'info' };
		}

		// Waiting in queue
		if (isUploading && currentFileIndex < index) {
			return { icon: 'clock', label: 'Waiting', class: 'warning' };
		}

		// Ready to upload (not started yet)
		return { icon: 'image', label: 'Ready', class: 'neutral' };
	}

	// Count successes/failures
	let successCount = $derived(results.filter((r) => r.success).length);
	let failCount = $derived(results.filter((r) => !r.success).length);
</script>

<div class="publish-container">
	{#if !authState.isAuthenticated}
		<p class="auth-hint">To publish your photos to Google Maps you need to sign in with Google.</p>
		<div class="login-btn-container">
			<LoginBtn />
		</div>
	{:else if displayTotal === 0}
		<p>No photos selected. Please select photos from the list first.</p>
	{:else}
		<!-- Dry-Run Indicator (when forced by ENV) -->
		{#if dryRunMode}
			<div class="dry-run-indicator">
				<p>DRY-RUN MODE ACTIVE</p>
				<small>Photos will be uploaded but not published to Google Maps</small>
			</div>
		{/if}

		<!-- File Summary -->
		<div class="file-summary">
			<p>
				{#if results.length > 0 && !isUploading}
					<!-- After upload completed -->
					<strong>{displayFiles.length}</strong>
					{displayFiles.length === 1 ? 'photo' : 'photos'} uploaded:
					<span class="upload-complete"
						>{successCount} success{#if failCount > 0}, {failCount} failed{/if}</span
					>
				{:else}
					<!-- Before or during upload -->
					<strong>{displayFiles.length}</strong> of {displayTotal}
					{displayFiles.length === 1 ? 'photo' : 'photos'} ready for upload
					{#if isUploading}
						<span class="upload-progress"
							>- Uploading {currentFileIndex + 1} of {displayFiles.length}...
						</span>
					{/if}
				{/if}
			</p>

			<p>
				Your photos will be visible to the public on Google Maps as blue circles once they've been
				published. <strong>This may take a few hours or days.</strong>
			</p>

			{#if filesWithoutGeo.length > 0 && frozenFiles.length === 0}
				<p class="warning">
					Skipped {filesWithoutGeo.length} photo(s) because of missing GPS data:
					{filesWithoutGeo.map((f) => f.name).join(', ')}
				</p>
			{/if}
		</div>

		<!-- Google Maps Contributions Link (after successful upload) -->
		{#if results.length > 0 && !isUploading && successCount > 0 && authState.user?.sub}
			<a
				href="https://www.google.com/maps/contrib/{authState.user.sub}/photos"
				target="_blank"
				rel="noopener"
				class="contributions-link"
			>
				View your contributions on Google Maps <ExternalLink size={16} />
			</a>
		{/if}

		<!-- File List (always visible) -->
		<ul class="file-list">
			{#each displayFiles as file, i (file.name)}
				{@const status = getFileStatus(i)}
				<li class="file-item {status.class}">
					<span class="file-icon">
						{#if status.icon === 'image'}
							<Image size={16} />
						{:else if status.icon === 'link'}
							<Link size={16} />
						{:else if status.icon === 'upload'}
							<Upload size={16} />
						{:else if status.icon === 'globe'}
							<Globe size={16} />
						{:else if status.icon === 'check'}
							<CircleCheck size={16} />
						{:else if status.icon === 'error'}
							<CircleX size={16} />
						{:else}
							<Clock size={16} />
						{/if}
					</span>
					<span class="file-name">{file.name}</span>
					<Badge message={status.label} level={status.class}></Badge>
				</li>
			{/each}
		</ul>

		<!-- Actions -->
		<div class="dialog-actions">
			{#if !isUploading && results.length === 0}
				<button class="secondary-btn" onclick={resetAndClose}> Cancel </button>
				<button class="primary-btn" onclick={startUpload} disabled={displayFiles.length === 0}>
					{#if dryRunMode}
						<FlaskConical size={16} /> Start Dry-Run
					{:else}
						<Globe size={16} /> Publish to Google Maps
					{/if}
				</button>
			{:else if !isUploading}
				<button class="secondary-btn" onclick={resetAndClose}> Close </button>
			{:else}
				<button class="secondary-btn" disabled>
					<div class="loading-indicator">
						Uploading
						<span class="spinner"></span>
					</div>
				</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.publish-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.auth-hint {
			text-align: center;
		}
	}

	.login-btn-container {
		margin: 0 auto;
	}

	.dry-run-indicator {
		background: var(--chip-danger-bg);
		border: 1px solid var(--chip-danger-fg);
		color: var(--chip-danger-fg);
		padding: 0.75rem;
		border-radius: 8px;
		font-weight: 600;
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;

		p {
			margin: 0;
			color: var(--chip-danger-fg);
		}
	}

	.file-summary {
		padding: 0.75rem;
		background-color: var(--surface-subtle);
		border-radius: 8px;

		p {
			margin: 0;
		}
	}

	a.contributions-link {
		color: var(--link-color);
		text-decoration: none;
		word-break: break-word;
		font-size: 14px;
		display: inline-flex;
		gap: 0.25rem;

		&:hover {
			text-decoration: underline;
		}
	}

	.warning {
		color: var(--warn-700);
		font-size: 12px;
	}

	.file-list {
		list-style: none;
		padding: 0;
		margin: 0;
		border-radius: 4px;
		max-height: 200px;
		overflow-y: auto;
	}

	.file-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		font-size: 13px;
		border-bottom: 1px solid var(--border-subtle);
		color: var(--text-default);
	}

	.file-item:last-child {
		border-bottom: none;
	}

	.file-item.uploading {
		background-color: var(--chip-primary-bg-light);
	}

	.file-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.file-name {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.spinner {
		border: 2px solid var(--spinner-secondary);
		border-top-color: var(--spinner-neutral);
	}
</style>
