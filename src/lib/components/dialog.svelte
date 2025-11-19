<script lang="ts">
	let { dialogId = 'dialog', title, body } = $props();
</script>

<dialog id={dialogId}>
	<div class="dialog-header">
		{#if title}
			<h2 class="dialog-title">{title}</h2>
		{/if}
		<button class="clickable-icon" commandfor={dialogId} command="close" aria-label="Schließen">
			<!-- close icon -->
			<svg
				class="svg-icon"
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 28 28"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<line x1="20" y1="8" x2="8" y2="20"></line>
				<line x1="8" y1="8" x2="20" y2="20"></line>
			</svg>
		</button>
	</div>

	<div class="dialog-body">
		{@render body()}
	</div>
</dialog>

<style>
	dialog {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		max-width: 90vw;
		max-height: 90vh;
		width: 600px;
		padding: 0;
		border-radius: 8px;
		border: none;
		box-shadow:
			0 1px 3px 0 rgba(60, 64, 67, 0.3),
			0 4px 8px 3px rgba(60, 64, 67, 0.15);
		background-color: #fff;
	}

	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(2px);
	}

	.dialog-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 16px 16px 24px;
		border-bottom: 1px solid #e0e0e0;
	}

	.dialog-title {
		margin: 0;
		font-size: 20px;
		font-weight: 500;
		color: #1f2937;
		line-height: 1.5;
	}

	.dialog-body {
		padding: 24px;
	}

	dialog :global(p) {
		line-height: 1.5;
		font-size: 14px;
		color: #5f6368;
		margin: 0 0 16px 0;
	}

	dialog :global(p:last-child) {
		margin-bottom: 0;
	}
</style>
