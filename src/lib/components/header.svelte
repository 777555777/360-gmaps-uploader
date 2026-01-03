<script lang="ts">
	import { page } from '$app/state';
	import { authState } from '$lib/auth-state.svelte';
	import { consentState } from '$lib/consent-state.svelte';
	import logo from '$lib/assets/icon-32x32.png';
	import LoginBtn from './auth/login-btn.svelte';
	import LogoutBtn from './auth/logout-btn.svelte';
	import GithubLink from './header/github-link.svelte';
	import InfoMenu from './header/info-menu.svelte';
	import { ArrowLeft } from '@lucide/svelte';

	const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

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

	<div class="g-container">
		<InfoMenu />
		<GithubLink />
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

		.logo-container {
			padding-left: 12px;
			display: flex;
			align-items: center;
			justify-content: center;
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
			padding-left: 20px;

			.g-profile {
				padding: 6px;
			}
		}

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

		@media (width < 400px) {
			.logo-container {
				img,
				.logo-placeholder {
					display: none;
				}
			}
		}

		@media (width < 365px) {
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
