<script lang="ts">
	import { Info, ShieldCheck, Cookie } from '@lucide/svelte';
	import { INFO_DIALOG_ID, CONSENT_DIALOG_ID } from '$lib/globals';
	import { showDialogById } from '$lib/utils/dialog-helpers';
	import Dropdown from '$lib/components/util/dropdown.svelte';

	function openInfoDialog(closeDropdown: () => void) {
		closeDropdown();
		showDialogById(INFO_DIALOG_ID);
	}

	function openConsentDialog(closeDropdown: () => void) {
		closeDropdown();
		showDialogById(CONSENT_DIALOG_ID);
	}
</script>

<Dropdown>
	{#snippet trigger()}
		<span class="clickable-icon" title="Menu">
			<Info size={24} />
		</span>
	{/snippet}

	{#snippet content(closeDropdown)}
		<ul class="menu-list">
			<li>
				<button onclick={() => openInfoDialog(closeDropdown)}>
					<Info size={16} />
					<span>About this Application</span>
				</button>
			</li>
			<li>
				<a href="/privacy" onclick={() => closeDropdown()}>
					<ShieldCheck size={16} />
					<span>Privacy Policy</span>
				</a>
			</li>
			<li>
				<button onclick={() => openConsentDialog(closeDropdown)}>
					<Cookie size={16} />
					<span>Consent Management</span>
				</button>
			</li>
		</ul>
	{/snippet}
</Dropdown>

<style>
	.menu-list {
		list-style: none;
		margin: 0;
		padding: 0;
		min-width: 200px;

		li {
			margin: 0;
			padding: 0;

			button,
			a {
				display: flex;
				align-items: center;
				gap: 0.75rem;
				width: 100%;
				padding: 0.5rem 0.75rem;
				background-color: transparent;
				border: none;
				border-radius: 4px;
				text-decoration: none;
				color: var(--text-default);
				font-size: 0.875rem;
				cursor: pointer;
				transition: background-color 0.15s ease;

				&:hover {
					background-color: var(--dropdown-bg-hover);
				}

				&:active {
					background-color: var(--dropdown-bg-active);
				}

				&:focus-visible {
					outline: none;
					background-color: var(--dropdown-bg-hover);
				}

				span {
					white-space: nowrap;
				}
			}
		}
	}
</style>
