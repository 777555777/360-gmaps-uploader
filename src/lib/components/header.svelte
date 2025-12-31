<script lang="ts">
	import { onMount } from 'svelte';
	import { authState } from '$lib/auth-state.svelte';
	import logo from '$lib/assets/icon-32x32.png';
	import LoginBtn from './auth/login-btn.svelte';
	import LogoutBtn from './auth/logout-btn.svelte';

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

	onMount(() => {
		// Initialize Google Identity Services Token Client (for API access)
		const initializeAuth = () => {
			if (typeof google !== 'undefined' && google.accounts) {
				authState.initializeGIS(GOOGLE_CLIENT_ID, SCOPES);
			} else {
				// Retry if script not loaded yet
				setTimeout(initializeAuth, 100);
			}
		};

		initializeAuth();
	});
</script>

<header>
	<div class="logo-container">
		<img src={logo} alt="Logo" height="32" />
		<span>360 Image Uploader</span>
	</div>
	<div class="g-container">
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
		background-color: var(--header-color);

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
				font-family: 'Product Sans', Arial, sans-serif;
				font-size: 22px;
				line-height: 48px;
				color: var(--logo-text-color);
				text-rendering: optimizeLegibility;
			}
		}

		.g-container {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.375rem;

			padding: 0 4px;
			padding-left: 30px;

			.g-profile {
				padding: 6px;
			}
		}

		@media (width < 576px) {
			.logo-container span {
				font-size: 18px;
			}
		}

		@media (width < 376px) {
			.logo-container span {
				font-size: 16px;
			}
		}
	}
</style>
