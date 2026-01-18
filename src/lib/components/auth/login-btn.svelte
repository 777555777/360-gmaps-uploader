<script lang="ts">
	import { authState } from '$lib/auth-state.svelte';
	import { consentState } from '$lib/consent-state.svelte';
	import { showDialogById } from '$lib/utils/dialog-helpers';
	import { CONSENT_DIALOG_ID } from '$lib/globals';

	function handleSignIn() {
		// Check consent before allowing sign-in
		if (consentState.hasConsented() !== true) {
			showDialogById(CONSENT_DIALOG_ID);
			return;
		}
		authState.signIn();
	}
</script>

<button class="google-btn" onclick={handleSignIn} aria-label="Sign in with Google">
	<div class="google-btn-icon">
		<!-- Google Logo -->
		<svg viewBox="0 0 24 24" class="google-svg">
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			/>
		</svg>
	</div>
	<span>Sign in</span><span>&nbsp;with Google</span>
</button>

<style>
	:root[data-theme='light'] {
		--google-btn-bg: #202124;
	}
	:root[data-theme='dark'] {
		--google-btn-bg: #3d3e42;
	}

	@media (prefers-color-scheme: dark) {
		:root:not([data-theme]) {
			--google-btn-bg: #3d3e42;
		}
	}

	.google-btn {
		--google-logo-bg: #fff;
		--google-sign-in-text: #e8eaed;
		--google-btn-bg-hover: #555658;
		--google-btn-bg-active: #1a1a1b;

		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 100%;
		width: 100%;
		max-width: fit-content;
		height: 40px;
		padding: 0 12px;
		background: var(--google-btn-bg);
		border: none;
		border-radius: 100vmax;
		cursor: pointer;
		transition:
			background-color 0.2s,
			border-color 0.2s;

		&:hover {
			background-color: var(--google-btn-bg-hover);
		}

		&:active {
			background-color: var(--google-btn-bg-active);
			outline: 2px solid var(--button-primary);
		}

		&:focus-visible {
			outline: 2px solid var(--button-primary);
		}

		.google-btn-icon {
			height: 36px;
			margin-left: -10px;
			margin-right: 12px;
			min-width: 36px;
			width: 36px;

			display: flex;
			justify-content: center;
			align-items: center;

			background-color: var(--google-logo-bg);
			border-radius: 18px;

			svg.google-svg {
				width: 18px;
				height: 18px;
				display: block;
			}
		}

		span {
			color: var(--google-sign-in-text);
			font-size: 14px;
			letter-spacing: 0.25px;
			text-align: center;
			white-space: nowrap;
		}
	}

	@media (width < 576px) {
		.google-btn span:last-of-type {
			display: none;
		}
	}
</style>
