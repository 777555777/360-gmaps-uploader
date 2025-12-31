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
		background-color: rgba(66, 133, 244, 0.1);
		color: rgb(66, 133, 244);
	}
</style>
