<script lang="ts">
	import { PUBLISH_DIALOG_ID, UPLOAD_DIALOG_ID } from '$lib/globals';
	import UploadList from './upload-list.svelte';
	import { fileState } from '$lib/file-state.svelte';

	let hasSelection = $derived(fileState.hasSelection);
	let selectedFiles = $derived(fileState.selectedFiles);
</script>

<aside>
	<div class="sidebar-option-header">
		<button class="upload-btn" commandfor={UPLOAD_DIALOG_ID} command="show-modal">
			<!-- plus icon -->
			<svg
				class="svg-icon"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 28 28"
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="14" y1="7" x2="14" y2="21"></line>
				<line x1="7" y1="14" x2="21" y2="14"></line>
			</svg>
			<span>Add 360-Photo</span>
		</button>

		<button
			class="upload-btn"
			disabled={!hasSelection}
			commandfor={PUBLISH_DIALOG_ID}
			command="show-modal"
		>
			<!-- publish icon -->
			<svg
				class="svg-icon"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
				<polyline points="17 8 12 3 7 8"></polyline>
				<line x1="12" y1="3" x2="12" y2="15"></line>
			</svg>

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

		border: 1px solid var(--border-accent-color);
		background-color: var(--content-bg-color);
		border-radius: 8px 8px 0 0;

		margin: 0 12px 0 12px;

		.sidebar-option-header {
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 16px 0;
			border-bottom: 1px solid var(--border-accent-color);

			.upload-btn {
				/* Centering */
				display: flex;
				align-items: center;
				justify-content: center;
				gap: 0.5rem;

				/* Shape and Size */
				background-color: #fff;
				border: none;
				padding: 0.625rem 1rem;
				border-radius: 100vmax;
				cursor: pointer;
				border: 2px solid transparent;

				/* Border Styling */
				box-shadow:
					0 2px 3px 0 rgba(60, 64, 67, 0.3),
					0 6px 10px 4px rgba(60, 64, 67, 0.15);

				font-size: 0.875rem;
				font-weight: 550;
				font-family: 'Open Sans', sans-serif;
				letter-spacing: 0.0175em;
				color: var(--text-color);
				transition: all 0.2s ease;

				&:last-of-type {
					margin-left: 16px;
				}

				.svg-icon {
					width: 24px;
					height: 24px;
					flex-shrink: 0;
					stroke-width: 2;
				}

				span {
					margin-right: 6px;
					line-height: 1;
				}

				&:hover {
					background-color: #3b82f633;
					color: #3b82f6;

					.svg-icon {
						color: #3b82f6;
					}
				}

				&:focus-visible {
					outline: none;
					background-color: #3b82f633;
					color: #3b82f6;
					border-color: #3b82f6;
					border-style: solid;
					border-width: 2px;

					box-shadow:
						0 1px 3px 0 rgba(60, 64, 67, 0.3),
						0 4px 8px 3px rgba(60, 64, 67, 0.15);

					.svg-icon {
						color: #3b82f6;
					}
				}

				&:active {
					background-color: #0062ff33;
					color: #3b82f6;
					border-color: #3b82f6;
					border-style: solid;
					border-width: 2px;

					box-shadow:
						0 4px 4px 0 rgba(60, 64, 67, 0.3),
						0 8px 12px 6px rgba(60, 64, 67, 0.15);

					.svg-icon {
						color: #3b82f6;
					}
				}

				&:disabled {
					cursor: not-allowed;
					background-color: #ffffff33;
					color: #9ca3af;
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
			min-height: 50%;
			max-height: 65%;
			margin-bottom: 1rem;
		}
	}
</style>
