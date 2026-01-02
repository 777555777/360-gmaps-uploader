<script lang="ts">
	import { Globe } from '@lucide/svelte';
</script>

<div class="published-chip" title="Published to Google Maps">
	<Globe size={16} />
</div>

<style>
	.published-chip {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 4px 5px;
		border-radius: 100vmax;

		background-color: var(--chip-neutral-bg);
		color: var(--chip-neutral-fg);
	}
</style>
