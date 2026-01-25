<script lang="ts">
	import { PUBLISH_DIALOG_ID, UPLOAD_DIALOG_ID, GPS_DATA_DIALOG_ID } from '$lib/globals';
	import UploadList from './upload-list/upload-list.svelte';
	import { fileState } from '$lib/file-state.svelte';
	import { FileUp, Plus, Upload } from '@lucide/svelte';

	let hasSelection = $derived(fileState.hasSelection);
	let selectedFiles = $derived(fileState.selectedFiles);
	let hasFiles = $derived(fileState.files.size > 0);
</script>

<aside>
	<div class="sidebar-option-header">
		<button
			class="upload-btn"
			commandfor={UPLOAD_DIALOG_ID}
			command="show-modal"
			title="Add 360 photos to upload List"
		>
			<Plus size={20} />
			<span>Add Photos</span>
		</button>

		<button
			class="upload-btn icon-only"
			disabled={!hasFiles}
			commandfor={GPS_DATA_DIALOG_ID}
			command="show-modal"
			title="Add GPS data from .gpx file"
		>
			<FileUp size={20} />
		</button>

		<button
			class="upload-btn"
			disabled={!hasSelection}
			commandfor={PUBLISH_DIALOG_ID}
			command="show-modal"
			title="Publish selected photos to Google Maps"
		>
			<Upload size={20} />
			<span>Publish ({selectedFiles.size})</span>
		</button>
	</div>
	<div class="sidebar-list">
		<UploadList />
	</div>
</aside>

<style>
	aside {
		box-sizing: content-box;
		padding: 0 16px;

		display: flex;
		flex-direction: column;
		width: 375px;

		border: 1px solid var(--border-subtle);
		background-color: var(--surface-base);
		border-radius: 8px 8px 0 0;

		margin: 0 12px;

		.sidebar-option-header {
			display: flex;
			justify-content: center;
			align-items: center;
			gap: 1rem;
			padding: 1rem 0;
			border-bottom: 1px solid var(--border-subtle);

			.upload-btn {
				/* Centering */
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 0.5rem;

				/* Shape and Size */
				background-color: var(--surface-base);

				border: none;
				padding: 0.625rem 0.875rem;
				border-radius: 100vmax;
				cursor: pointer;
				border: 2px solid transparent;

				/* Border Styling */
				box-shadow:
					0 2px 3px 0 var(--shadow-inner),
					0 6px 10px 4px var(--shadow-outer);

				font-size: 0.875rem;
				font-weight: 550;
				font-family: 'Open Sans', sans-serif;
				letter-spacing: 0.0175em;
				color: var(--text-muted);
				user-select: none;
				transition: all 0.2s ease;

				span {
					margin-right: 6px;
					line-height: 1;
				}

				&.icon-only {
					padding: 0.625rem;
				}

				&:hover {
					background-color: var(--button-primary-bg);
					color: var(--button-primary);
				}

				&:focus-visible {
					outline: none;
					background-color: var(--button-primary-bg);
					color: var(--button-primary);
					border-color: var(--button-primary);
					border-style: solid;
					border-width: 2px;

					box-shadow:
						0 1px 3px 0 var(--shadow-inner),
						0 4px 8px 3px var(--shadow-outer);
				}

				&:active {
					background-color: var(--button-primary-bg);
					color: var(--button-primary);
					border-color: var(--button-primary);
					border-style: solid;
					border-width: 2px;

					box-shadow:
						0 4px 4px 0 var(--shadow-inner),
						0 8px 12px 6px var(--shadow-outer);
				}

				&:disabled {
					cursor: not-allowed;
					color: var(--text-subtle);
					pointer-events: none;
				}
			}
		}

		.sidebar-list {
			flex-grow: 1;
			overflow-y: auto;
			padding: 16px 8px;
		}
	}

	@media (width < 768px) {
		aside {
			width: unset;
			height: 50%;
			border-bottom: none;
		}
	}

	@media (max-width: 420px) {
		aside {
			margin: 0 6px;
			padding: 0 8px;
			height: 45%;

			.sidebar-option-header {
				padding: 0.5rem 0;

				button.upload-btn:not(.icon-only) {
					:global(svg) {
						display: none;
					}
				}

				button.upload-btn {
					padding: 13px 16px;

					span {
						margin-right: 0;
					}
				}
			}
			.sidebar-list {
				padding: 8px;
			}
		}
	}
</style>
