<script lang="ts">
	import type { Snippet } from 'svelte';
	import { stopEventPropagation } from '$lib/utils/ui-helper.js';

	type BadgeLevel = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

	let {
		message,
		icon,
		level,
		anchorName,
		popoverTarget,
		title,
		disabled
	}: {
		message: string;
		icon?: Snippet;
		level?: BadgeLevel;
		anchorName?: string;
		popoverTarget?: string;
		title?: string;
		disabled?: boolean;
	} = $props();
</script>

{#if anchorName && popoverTarget}
	<button
		class="badge {level ? `badge-${level}` : 'badge-neutral'}"
		style="anchor-name: --{anchorName};"
		popovertarget={popoverTarget}
		{title}
		{disabled}
		onkeydown={stopEventPropagation}
	>
		{#if icon}
			{@render icon()}
		{/if}
		{#if message}
			<span>{message}</span>
		{/if}
	</button>
{:else}
	<div
		class="badge {level ? `badge-${level}` : 'badge-neutral'} {message ? '' : 'icon-only'}"
		{title}
	>
		{#if icon}
			{@render icon()}
		{/if}
		{#if message}
			<span>{message}</span>
		{/if}
	</div>
{/if}

<style>
	.badge {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 4px 8px;
		border-radius: 100vmax;
		max-width: 14rem;
		font-size: 13px;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: normal;
		background-color: var(--chip-danger-bg);
		color: var(--chip-danger-fg);

		&.icon-only {
			padding: 5px;
		}

		&.badge-success {
			background-color: var(--chip-success-bg);
			color: var(--chip-success-fg);
		}
		&.badge-warning {
			background-color: var(--chip-warn-bg);
			color: var(--chip-warn-fg);
		}
		&.badge-danger {
			background-color: var(--chip-danger-bg);
			color: var(--chip-danger-fg);
		}
		&.badge-info {
			background-color: var(--chip-primary-bg);
			color: var(--chip-primary-fg);
		}
		&.badge-neutral {
			background-color: var(--chip-neutral-bg);
			color: var(--chip-neutral-fg);
		}
	}

	button.badge {
		border: none;
		cursor: pointer;

		&:disabled {
			cursor: unset;
		}

		/* Success */
		&.badge-success:hover {
			background-color: var(--chip-success-hover-bg);
		}
		&.badge-success:active {
			background-color: var(--chip-success-active-bg);
		}
		&.badge-success:focus-visible {
			outline: 2px solid var(--chip-success-fg);
		}
		&.badge-neutral:disabled {
			background-color: var(--chip-success-bg);
		}

		/* Warning */
		&.badge-warning:hover {
			background-color: var(--chip-warn-hover-bg);
		}
		&.badge-warning:active {
			background-color: var(--chip-warn-active-bg);
		}
		&.badge-warning:focus-visible {
			outline: 2px solid var(--chip-warn-fg);
		}
		&.badge-neutral:disabled {
			background-color: var(--chip-warn-bg);
		}

		/* Danger */
		&.badge-danger:hover {
			background-color: var(--chip-danger-hover-bg);
		}
		&.badge-danger:active {
			background-color: var(--chip-danger-active-bg);
		}
		&.badge-danger:focus-visible {
			outline: 2px solid var(--chip-danger-fg);
		}
		&.badge-neutral:disabled {
			background-color: var(--chip-danger-bg);
		}

		/* Info */
		&.badge-info:hover {
			background-color: var(--chip-primary-hover-bg);
		}
		&.badge-info:active {
			background-color: var(--chip-primary-active-bg);
		}
		&.badge-info:focus-visible {
			outline: 2px solid var(--chip-primary-fg);
		}
		&.badge-neutral:disabled {
			background-color: var(--chip-primary-bg);
		}

		/* Neutral */
		&.badge-neutral:hover {
			background-color: var(--chip-neutral-hover-bg);
		}
		&.badge-neutral:active {
			background-color: var(--chip-neutral-active-bg);
		}
		&.badge-neutral:focus-visible {
			outline: 2px solid var(--chip-neutral-fg);
		}
		&.badge-neutral:disabled {
			background-color: var(--chip-neutral-bg);
		}
	}
</style>
