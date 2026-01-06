<script lang="ts">
	import { authState } from '$lib/auth-state.svelte';
	import { getInitials, getAvatarColor } from '$lib/utils/avatar-helpers';

	let { dropdownId = crypto.randomUUID() }: { dropdownId?: string } = $props();
	let user = $derived(authState.user);
	let imageError = $state(false);

	function handleSignOut() {
		console.log('triggered sign out');
		authState.signOut();
	}

	function handleImageError() {
		imageError = true;
	}
</script>

<!-- Dropdown Trigger Button -->
<button
	id="toggleBtn"
	commandfor="cf-dropdown-logout-menu-{dropdownId}"
	command="toggle-popover"
	style="anchor-name: --dropdown-logout-anchor-{dropdownId};"
	class="dropdown-toggle"
	aria-label="Sign out from Google"
>
	<div class="google-btn-icon">
		{#if !imageError && user?.picture}
			<img src={user.picture} alt={user.name} class="user-avatar" onerror={handleImageError} />
		{:else}
			<div class="user-avatar-fallback" style="background-color: {getAvatarColor(user?.name)}">
				{getInitials(user?.name)}
			</div>
		{/if}
	</div>
</button>

<!-- Dropdown Menu -->
<div
	popover
	id="cf-dropdown-logout-menu-{dropdownId}"
	style="position-anchor: --dropdown-logout-anchor-{dropdownId};"
	class="dropdown-menu"
>
	<h3>{user?.name}</h3>
	<p>{user?.email}</p>

	<hr class="separator" />
	<ul>
		<li><a href="/" onclick={handleSignOut}>Logout</a></li>
	</ul>
</div>

<style>
	.dropdown-toggle {
		--google-logout-btn-hover: rgba(0, 0, 0, 0.05);
		--google-logout-btn-active: rgba(0, 0, 0, 0.1);
		--google-logout-btn-text: #fff;

		/* anchor-name is set via dynamic inline style */
		border: none;
		cursor: pointer;
		background-color: transparent;
		border-radius: 100vmax;

		.google-btn-icon {
			background: none;
			border: none;
			outline: none;
			display: flex;
			align-items: center;
			justify-content: center;

			img,
			.user-avatar-fallback {
				width: 32px;
				height: 32px;
				cursor: pointer;
				margin: 4px;
				border-radius: 100vmax;
			}

			.user-avatar-fallback {
				display: flex;
				align-items: center;
				justify-content: center;
				color: var(--google-logout-btn-text);
				font-family: 'Open Sans', sans-serif;
				font-size: 12px;
				font-weight: 500;
				letter-spacing: 0.05em;
				user-select: none;
			}
		}

		&:hover {
			background-color: var(--google-logout-btn-hover);
		}

		&:active {
			background-color: var(--google-logout-btn-active);
		}

		&:focus-visible {
			outline: none;
			box-shadow: 0 0 0 2px var(--button-primary);
		}
	}

	.dropdown-menu {
		--dropdown-menu-offset-x: 0px;
		--dropdown-menu-offset-y: 2px;

		/* Dropdown positioning using Anchor */
		/* position-anchor is set via dynamic inline style */
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

		h3 {
			font-size: 0.875rem; /* 14px */
			font-weight: 600;
			margin: 0;
			margin-right: 1rem; /* Added spacing to give the dropdown more width while being based on the content */
			padding: 0.5rem 0.75rem;
			padding-bottom: 0;
		}

		p {
			font-size: 0.75rem;
			text-align: left;
			color: var(--text-subtle);
			margin-right: 1rem;
			padding-left: 0.75rem;
		}

		hr.separator {
			border: none;
			border-top: 1px solid var(--border-subtle);
			margin-block: 0.5rem;
			margin-inline: 0.25rem;
		}

		ul {
			list-style: none;
			margin: 0;
			padding: 0;

			li {
				margin: 0;
				padding: 0;
				background-color: transparent;
				border-radius: 4px;
				transition: background-color 0.15s ease;

				&:hover {
					background-color: var(--dropdown-bg-hover);
				}

				a {
					display: block;
					user-select: none;
					padding: 0.5rem 0.75rem;
					background-color: transparent;
					text-decoration: none;
					color: var(--text-default);
					font-size: 0.875rem; /* 14px */
					transition: color 0.15s ease;

					&:active {
						border-radius: 4px;
						background-color: var(--dropdown-bg-active);
					}

					&:focus-visible {
						outline: none;
						border-radius: 4px;
						background-color: var(--dropdown-bg-hover);
					}
				}
			}
		}
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

			h3 {
				padding-top: 0;
			}
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
