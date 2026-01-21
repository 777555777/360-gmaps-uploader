<script lang="ts">
	import type { Snippet } from 'svelte';

	type BadgeLevel = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

	let {
		message,
		icon,
		level
	}: {
		message: string;
		icon?: Snippet;
		level?: BadgeLevel;
	} = $props();
</script>

<div class="badge {level ? `badge-${level}` : 'badge-neutral'}">
	{#if icon}
		{@render icon()}
	{/if}
	<span>{message}</span>
</div>

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
		line-height: normal;
		background-color: var(--chip-danger-bg);
		color: var(--chip-danger-fg);

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
</style>
