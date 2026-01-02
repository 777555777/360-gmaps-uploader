<script lang="ts">
	import '../app.css';
	import '../colors.css';
	import favicon from '$lib/assets/favicon.svg';
	import { useWorkerPoolCleanup } from '$lib/actions/worker-lifecycle';

	let { children } = $props();

	// Cleanup Worker Pool beim App-Shutdown
	useWorkerPoolCleanup();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
