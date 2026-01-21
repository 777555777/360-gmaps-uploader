<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** Callback when files are selected or dropped */
		onfiles: (files: FileList) => void | Promise<void>;
		/** Content to display when idle */
		idle: Snippet;
		/** Content to display when processing */
		processing?: Snippet;
		/** Whether files are currently being processed */
		isProcessing?: boolean;
		/** File input accept attribute (e.g., "image/jpeg,image/jpg") */
		accept?: string;
		/** Whether to allow multiple files */
		multiple?: boolean;
		/** Whether the drop zone is disabled */
		disabled?: boolean;
		/** Custom CSS class for the drop zone */
		class?: string;
	}

	let {
		onfiles,
		idle,
		processing,
		isProcessing = false,
		accept = '*/*',
		multiple = true,
		disabled = false,
		class: customClass = ''
	}: Props = $props();

	let isDragging = $state(false);
	let fileInput: HTMLInputElement | undefined;

	function handleDragEnter(event: DragEvent): void {
		event.preventDefault();
		if (!isProcessing && !disabled) {
			isDragging = true;
		}
	}

	function handleDragOver(event: DragEvent): void {
		event.preventDefault();
	}

	function handleDragLeave(event: DragEvent): void {
		event.preventDefault();
		isDragging = false;
	}

	function handleDrop(event: DragEvent): void {
		event.preventDefault();
		isDragging = false;

		if (isProcessing || disabled) {
			return;
		}

		const files = event.dataTransfer?.files;
		if (files && files.length > 0) {
			onfiles(files);
		}
	}

	function handleFileSelect(event: Event): void {
		const input = event.target;
		if (input instanceof HTMLInputElement && input.files && input.files.length > 0) {
			onfiles(input.files);
		}
	}

	function handleClick(): void {
		if (!isProcessing && !disabled) {
			fileInput?.click();
		}
	}

	export function resetInput(): void {
		if (fileInput) {
			fileInput.value = '';
		}
	}
</script>

<div
	class="drop-zone {isDragging ? 'dragging' : ''} {isProcessing ? 'processing' : ''} {disabled
		? 'disabled'
		: ''} {customClass}"
	ondragenter={handleDragEnter}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	onclick={handleClick}
	role="button"
	tabindex={disabled ? -1 : 0}
	onkeydown={(e) => e.key === 'Enter' && handleClick()}
	aria-disabled={isProcessing || disabled}
>
	{#if isProcessing && processing}
		{@render processing()}
	{:else}
		{@render idle()}
	{/if}

	<input
		bind:this={fileInput}
		type="file"
		{accept}
		{multiple}
		onchange={handleFileSelect}
		class="file-input"
		disabled={isProcessing || disabled}
	/>
</div>

<style>
	.drop-zone {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		padding: 48px 24px;
		border: 2px dashed var(--border-default);
		border-radius: 8px;
		background-color: var(--surface-subtle);
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 240px;
		color: var(--text-muted);
	}

	.drop-zone:hover,
	.drop-zone.dragging {
		border-color: var(--button-primary);
		background-color: var(--button-primary-bg);
		color: var(--button-primary);
	}

	.drop-zone.processing,
	.drop-zone.disabled {
		cursor: not-allowed;
		opacity: 0.8;
		pointer-events: none;
	}

	.drop-zone.processing:hover,
	.drop-zone.disabled:hover {
		border-color: var(--border-default);
		background-color: var(--surface-subtle);
		color: var(--text-muted);
	}

	.drop-zone:focus {
		outline: 2px solid var(--button-primary);
		outline-offset: 2px;
	}

	.file-input {
		display: none;
	}
</style>
