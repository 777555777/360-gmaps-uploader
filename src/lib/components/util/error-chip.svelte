<script lang="ts">
	import type { Snippet } from 'svelte';

	let { message, icon }: { message: string; icon?: Snippet } = $props();
</script>

<div class="error-chip">
	{#if icon}
		{@render icon()}
	{/if}
	<span>{message}</span>
</div>

<style>
	.error-chip {
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
	}
</style>
