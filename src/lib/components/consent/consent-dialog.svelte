<script lang="ts">
	import { consentState } from '$lib/consent-state.svelte';
	import { closeDialogById } from '$lib/utils/dialog-helpers';
	import { CONSENT_DIALOG_ID } from '$lib/globals';

	function acceptCookies() {
		consentState.setConsent(true);
		closeDialogById(CONSENT_DIALOG_ID);
	}

	function declineCookies() {
		consentState.setConsent(false);
		closeDialogById(CONSENT_DIALOG_ID);
	}
</script>

<div class="consent-container">
	<p>
		This application uses Google services To publish panoramas to Google Street View, <strong
			>Google Login</strong
		>
		and the <strong>Google Street View API</strong> are used. This involves the transfer of personal data
		(e.g., IP address) to Google.
	</p>

	<p>
		<strong>OpenStreetMap</strong> is used to display and edit photo locations on an interactive map.
		This involves loading map tiles and related data from OpenStreetMap servers.
	</p>

	<p>
		Without your consent, logging in with your Google account and publishing panoramas to Google
		Street View as well as loading the interactive map is not possible.
	</p>

	<p>You may withdraw your consent at any time via the consent management.</p>

	<div class="actions">
		<button class="primary-btn" onclick={acceptCookies}>Accept</button>
		<button class="secondary-btn" onclick={declineCookies}>Decline</button>
	</div>
</div>

<style>
	.actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border-subtle);
	}

	p {
		color: var(--text-muted);
	}
</style>
