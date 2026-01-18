<script lang="ts">
	import { GITHUB_URL } from '$lib/globals';
	import { Github } from '@lucide/svelte';
</script>

<a
	href={GITHUB_URL}
	target="_blank"
	rel="noopener noreferrer"
	aria-label="GitHub Repository"
	title="View source code on GitHub"
	class="clickable-icon"
>
	<Github size={24} />
</a>
