<script lang="ts">
	import { fileState } from '$lib/file-state.svelte';
	import UploadListItem from './upload-list-item.svelte';

	let fileList = $derived(fileState.fileList);
</script>

<ul>
	{#each fileList as file, index (file)}
		<li>
			<UploadListItem {file} {index} />
		</li>
	{/each}
</ul>

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;

		li {
			margin-bottom: 16px;
			position: relative;
			overflow: clip;

			&:last-child {
				margin-bottom: 0;
			}

			&:hover {
				border-radius: 8px;
				box-shadow: 0 0 10px rgb(218, 220, 224);
				cursor: pointer;
			}
		}
	}
</style>
