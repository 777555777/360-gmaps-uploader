<script lang="ts">
	import '../colors.css';
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { useWorkerPoolCleanup } from '$lib/actions/worker-lifecycle';

	let { children } = $props();

	// Cleanup Worker Pool beim App-Shutdown
	useWorkerPoolCleanup();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Pano Publisher</title>
</svelte:head>

{@render children()}
