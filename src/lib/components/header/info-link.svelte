<script lang="ts">
	import { BadgeInfo } from '@lucide/svelte';
	import { INFO_DIALOG_ID } from '$lib/globals';
</script>

<button
	title="Information about this application"
	class="clickable-icon"
	commandfor={INFO_DIALOG_ID}
	command="show-modal"
>
	<BadgeInfo size={24} />
</button>
