<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		dropdownId = crypto.randomUUID(),
		trigger,
		content
	}: {
		dropdownId?: string;
		trigger: Snippet;
		content: Snippet;
	} = $props();

	const anchorName = $derived(`--dropdown-anchor-${dropdownId}`);
	const popoverId = $derived(`dropdown-menu-${dropdownId}`);
</script>

<!-- Dropdown Trigger -->
<button
	commandfor={popoverId}
	command="toggle-popover"
	style="anchor-name: {anchorName};"
	class="dropdown-trigger"
	aria-haspopup="true"
>
	{@render trigger()}
</button>

<!-- Dropdown Menu -->
<div popover id={popoverId} style="position-anchor: {anchorName};" class="dropdown-menu">
	{@render content()}
</div>

<style>
	.dropdown-trigger {
		border: none;
		cursor: pointer;
		background-color: transparent;
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;

		&:focus-visible {
			outline: none;
			box-shadow: 0 0 0 2px var(--button-primary);
			border-radius: 4px;
		}
	}

	.dropdown-menu {
		--dropdown-menu-offset-x: 0px;
		--dropdown-menu-offset-y: 2px;

		/* Dropdown positioning using Anchor */
		position: absolute;
		inset: auto;
		top: anchor(bottom);
		right: anchor(right);

		margin-top: var(--dropdown-menu-offset-y);
		margin-right: var(--dropdown-menu-offset-x);

		text-align: left;
		padding: 0.5rem;
		user-select: none;
		background-color: var(--dropdown-bg);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		box-shadow:
			0 10px 15px -3px var(--shadow-inner),
			0 4px 6px -2px var(--shadow-outer);
	}

	@media (width <= 768px) {
		.dropdown-menu {
			position: fixed;
			bottom: 0;
			top: auto;
			right: 0;
			left: 0;
			margin-inline: 0.5rem;
			width: auto;
			padding: 1rem;
			border-radius: 8px 8px 0 0;
			transition:
				translate 0.3s cubic-bezier(0.4, 0, 0.2, 1),
				opacity 0.3s ease;
			translate: 0 0;
		}

		.dropdown-menu:popover-open {
			translate: 0 0;
		}

		@starting-style {
			.dropdown-menu:popover-open {
				translate: 0 100%;
			}
		}

		.dropdown-menu::backdrop {
			pointer-events: auto;
			background-color: var(--backdrop-color);
			backdrop-filter: blur(2px);
			transition:
				background-color 0.3s ease,
				backdrop-filter 0.3s ease;
		}

		@starting-style {
			.dropdown-menu::backdrop {
				background-color: transparent;
				backdrop-filter: blur(0);
			}
		}
	}
</style>
