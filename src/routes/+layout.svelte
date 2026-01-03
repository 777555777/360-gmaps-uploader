<script lang="ts">
	import '../colors.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { useWorkerPoolCleanup } from '$lib/actions/worker-lifecycle';
	import Dialog from '$lib/components/util/dialog.svelte';
	import ConsentDialog from '$lib/components/consent/consent-dialog.svelte';
	import InfoDialog from '$lib/components/info-dialog.svelte';
	import { INFO_DIALOG_ID, CONSENT_DIALOG_ID } from '$lib/globals';
	import { consentState } from '$lib/consent-state.svelte';
	import { showDialogById, closeDialogById } from '$lib/utils/dialog-helpers';

	let { children } = $props();

	// Cleanup Worker Pool beim App-Shutdown
	useWorkerPoolCleanup();

	// Consent-Dialog automatisch öffnen wenn Consent noch null ist
	$effect(() => {
		if (consentState.hasConsented() === null) {
			showDialogById(CONSENT_DIALOG_ID);
		} else {
			closeDialogById(CONSENT_DIALOG_ID);
		}
	});
</script>

{#snippet consentDialogContent()}
	<ConsentDialog />
{/snippet}

{#snippet infoDialogContent()}
	<InfoDialog />
{/snippet}

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Pano Publisher</title>
</svelte:head>

{@render children()}

<Dialog dialogId={INFO_DIALOG_ID} title="Information" body={infoDialogContent} />
<Dialog dialogId={CONSENT_DIALOG_ID} title="Cookie & Data Consent" body={consentDialogContent} />
