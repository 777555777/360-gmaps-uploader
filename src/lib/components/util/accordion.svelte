<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		/** The name attribute for grouping accordions (allows only one open at a time) */
		name?: string;
		/** The title shown in the summary header */
		summaryTitle?: string;
		/** Header snippet to display before the title */
		header?: Snippet;
		/** Content snippet displayed after the separator line */
		content: Snippet;
		/** Whether the accordion should be open by default */
		open?: boolean;
	}

	let { name, summaryTitle, header, content, open = false }: Props = $props();
</script>

<details {name} {open}>
	<summary>
		{#if header}
			{@render header()}
		{/if}
		{#if summaryTitle}
			<span class="summary-title">{summaryTitle}</span>
		{/if}
	</summary>
	<div class="accordion-content">
		<hr class="separator" />
		{@render content()}
	</div>
</details>

<style>
	details {
		width: 100%;
		border-radius: 8px;
		padding: 0.5rem;
		background-color: var(--accordion-bg);
	}

	summary {
		display: flex;
		align-items: center;
		gap: 10px;
		cursor: pointer;
		list-style: none;
		position: relative;
		padding-inline: 0.5rem;
		border-radius: 6px;
		margin: -0.25rem;
		padding: 0.25rem 0.5rem;
		transition: background-color 0.15s ease;

		@media (max-width: 576px) {
			user-select: none;
		}
	}

	summary:hover {
		background-color: var(--accordion-bg-hover);
	}

	summary:active {
		background-color: var(--accordion-bg-active);
	}

	/* Hide default marker and add custom arrow on the right */
	summary::-webkit-details-marker {
		display: none;
	}

	summary::after {
		content: '▶';
		position: absolute;
		right: 8px;
		font-size: 10px;
		color: var(--text-muted);
		transition: transform 0.2s ease;
	}

	details[open] summary::after {
		transform: rotate(90deg);
	}

	.summary-title {
		font-size: 14px;
		font-weight: 500;
		color: var(--text-default);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 80%; /* Ensure truncated text does not overflow triangle */
		flex: 1;
	}

	.accordion-content {
		border-radius: 5px;
	}

	/* Make icons inherit text-muted color by default */
	details :global(svg) {
		flex-shrink: 0;
		color: var(--text-muted);
	}
</style>
