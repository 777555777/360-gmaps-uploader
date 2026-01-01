<script lang="ts">
	import { Github } from '@lucide/svelte';

	const GITHUB_URL = import.meta.env.VITE_GITHUB_URL;
</script>

<a
	href={GITHUB_URL}
	target="_blank"
	rel="noopener noreferrer"
	aria-label="GitHub Repository"
	title="Navigate to the code on GitHub"
	class="clickable-icon"
>
	<Github size={24} />
</a>
