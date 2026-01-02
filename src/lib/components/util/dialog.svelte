<script lang="ts">
	import { X } from '@lucide/svelte';

	let {
		dialogId = 'dialog',
		title,
		body,
		onClose
	}: { dialogId?: string; title?: string; body: () => any; onClose?: () => void } = $props();

	function handleClose() {
		onClose?.();
	}
</script>

<dialog id={dialogId} onclose={handleClose}>
	<div class="dialog-header">
		{#if title}
			<h2 class="dialog-title">{title}</h2>
		{/if}
		<button class="clickable-icon" commandfor={dialogId} command="close" aria-label="Schließen">
			<X size={24} />
		</button>
	</div>

	<div class="dialog-body">
		{@render body()}
	</div>
</dialog>

<style>
	dialog {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-width: 90vw;
		max-height: 90vh;
		width: 600px;
		padding: 0;
		border-radius: 8px;
		border: none;
		box-shadow:
			0 1px 3px 0 var(--shadow-inner),
			0 4px 8px 3px var(--shadow-outer);
		background-color: var(--surface-base);
	}

	dialog::backdrop {
		background-color: var(--backdrop-color);
		backdrop-filter: blur(2px);
	}

	.dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 16px 16px 24px;
		border-bottom: 1px solid var(--border-subtle);
	}

	.dialog-title {
		margin: 0;
		font-size: 20px;
		font-weight: 500;
		color: var(--text-default);
		line-height: 1.5;
	}

	.dialog-body {
		padding: 24px;
	}

	dialog :global(p) {
		line-height: 1.5;
		font-size: 14px;
		margin: 0 0 16px 0;
	}

	dialog :global(p:last-child) {
		margin-bottom: 0;
	}
</style>
