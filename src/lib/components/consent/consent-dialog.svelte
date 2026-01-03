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
		This application uses Google services To publish panoramas to Google Street View, Google Login
		and the Google Street View API are used. This involves the transfer of personal data (e.g., IP
		address) to Google.
	</p>

	<p>
		Without this consent, logging in with your Google account and publishing panoramas to Google
		Street View is not possible.
	</p>

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
