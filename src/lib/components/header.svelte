<script lang="ts">
	import { page } from '$app/state';
	import { authState } from '$lib/auth-state.svelte';
	import { consentState } from '$lib/consent-state.svelte';
	import logo from '$lib/assets/logo.svg';
	import LoginBtn from './auth/login-btn.svelte';
	import LogoutBtn from './auth/logout-btn.svelte';
	import GithubLink from './header/github-link.svelte';
	import InfoMenu from './header/info-menu.svelte';
	import { ArrowLeft } from '@lucide/svelte';
	import SearchInput from './header/search-input.svelte';
	import MobileSearch from './header/mobile-search.svelte';
	import { env } from '$env/dynamic/public';

	const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
	const ENABLE_MAP_SEARCH = env.PUBLIC_ENABLE_MAP_SEARCH !== 'false';

	// Scopes for Street View Publish API
	// Documentation: https://developers.google.com/streetview/publish/first-app
	const SCOPES = [
		'https://www.googleapis.com/auth/streetviewpublish',
		'https://www.googleapis.com/auth/userinfo.email',
		'https://www.googleapis.com/auth/userinfo.profile'
	];

	let user = $derived(authState.user);
	let isAuthenticated = $derived(authState.isAuthenticated);
	let googleScriptLoaded = $derived(consentState.googleScriptLoaded);
	let isHomePage = $derived(page.url.pathname === '/');

	// Initialize GIS when script is loaded (reactive)
	$effect(() => {
		if (googleScriptLoaded && typeof google !== 'undefined' && google.accounts) {
			authState.initializeGIS(GOOGLE_CLIENT_ID, SCOPES);
		}
	});
</script>

<header>
	{#if isHomePage}
		<div class="logo-container">
			<img src={logo} alt="Logo" height="32" />
			<span>Pano Publisher</span>
		</div>
	{:else}
		<a href="/" class="back-link">
			<div class="logo-container">
				<div class="logo-placeholder">
					<ArrowLeft size={20} />
				</div>
				<span>Back to App</span>
			</div>
		</a>
	{/if}

	{#if ENABLE_MAP_SEARCH}
		<div class="search desktop-search">
			<SearchInput />
		</div>
	{/if}

	<div class="g-container">
		{#if ENABLE_MAP_SEARCH}
			<div class="search mobile-search">
				<MobileSearch />
			</div>
		{/if}

		<InfoMenu />
		<div class="github">
			<GithubLink />
		</div>
		<div class="g-profile">
			{#if isAuthenticated && user}
				<LogoutBtn />
			{:else}
				<LoginBtn />
			{/if}
		</div>
	</div>
</header>

<style>
	header {
		height: 4rem;
		padding: 0.5rem;
		display: flex;
		justify-content: space-between;
		background-color: var(--surface-base);
		position: sticky;
		top: 0;
		z-index: 1;

		.logo-container {
			width: 200px;
			padding-left: 12px;
			display: flex;
			align-items: center;
			justify-content: left;
			gap: 0.25rem;

			user-select: none;
			cursor: pointer;

			span {
				display: block;
				font-size: 22px;
				line-height: 48px;
				color: var(--text-muted);
				text-rendering: optimizeLegibility;
				letter-spacing: -0.025em;
			}
		}

		a.back-link {
			display: flex;
			text-decoration: none;
			color: var(--text-default);
		}

		.logo-placeholder {
			padding-inline: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.g-container {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.375rem;

			padding: 0 4px;

			.g-profile {
				padding: 6px;
			}
		}

		/* Search handling */
		.desktop-search {
			width: 40%;
		}

		.mobile-search {
			display: none;
		}

		@media (width < 992px) {
			.desktop-search {
				display: none;
			}

			.mobile-search {
				display: block;
			}

			.logo-container {
				width: auto;
			}
		}

		/* Github Button */

		.github {
			display: block;
		}

		@media (width < 768px) {
			.github {
				display: none;
			}
		}

		/* Logo handling */
		@media (width < 576px) {
			.logo-container span {
				font-size: 18px;
			}
		}

		@media (width < 476px) {
			.g-container {
				padding-left: 16px;
				gap: 0;
			}
		}

		@media (width < 405px) {
			.logo-container {
				img,
				.logo-placeholder {
					display: none;
				}
			}
		}

		@media (width < 370px) {
			.logo-container {
				span {
					display: none;
				}

				img,
				.logo-placeholder {
					display: flex;
				}
			}
		}
	}
</style>
