<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		dropdownId = crypto.randomUUID(),
		trigger,
		content
	}: {
		dropdownId?: string;
		trigger: Snippet;
		content: Snippet<[() => void]>;
	} = $props();

	const anchorName = $derived(`--dropdown-anchor-${dropdownId}`);
	const popoverId = $derived(`dropdown-menu-${dropdownId}`);

	function closeDropdown() {
		const popover = document.getElementById(popoverId);
		if (popover) {
			popover.hidePopover();
		}
	}
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
	{@render content(closeDropdown)}
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
		background-color: var(--dropdown-bg);
		border: 1px solid var(--border-subtle);
		border-radius: 8px;
		box-shadow:
			0 10px 15px -3px var(--shadow-inner),
			0 4px 6px -2px var(--shadow-outer);
	}
</style>
