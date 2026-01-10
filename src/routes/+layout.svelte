<script lang="ts">
	import '../colors.css';
	import '../app.css';
	import favicon from '$lib/assets/logo.svg';
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

	<meta name="robots" content="index, follow" />

	<!-- Global Open Graph tags (inherited by all pages) -->
	<meta property="og:site_name" content="Pano Publisher" />
	<meta property="og:image" content="https://panopublisher.net/og-image.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:type" content="website" />

	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			"name": "Pano Publisher",
			"applicationCategory": "MultimediaApplication",
			"operatingSystem": "Web",
			"description": "Web application for uploading individual 360° photos (Photo Spheres) to Google Maps and Google Street View. The application is local-first, free to use, open source and does not store any image data on its own servers.",
			"isAccessibleForFree": true,
			"license": "https://github.com/777555777/360-gmaps-uploader/blob/main/LICENSE"
		}
	</script>
</svelte:head>

{@render children()}

<Dialog dialogId={INFO_DIALOG_ID} title="Information" body={infoDialogContent} />
<Dialog dialogId={CONSENT_DIALOG_ID} title="Cookie & Data Consent" body={consentDialogContent} />
