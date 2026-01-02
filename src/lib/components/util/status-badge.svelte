<script lang="ts">
	let { statusClass, label } = $props<{ statusClass: string; label: string }>();
</script>

<span class="badge {statusClass}">{label}</span>

<style>
	.badge {
		padding: 0.125rem 0.75rem;
		border-radius: 100vmax;
		font-size: 11px;
		text-transform: uppercase;
		font-weight: 500;
	}

	.badge.ready {
		background-color: var(--chip-neutral-bg);
		color: var(--chip-neutral-fg);
	}

	.badge.waiting {
		background-color: var(--chip-warn-bg);
		color: var(--chip-warn-fg);
	}

	.badge.uploading {
		background-color: var(--chip-primary-bg);
		color: var(--chip-primary-fg);
	}

	.badge.success {
		background-color: var(--chip-success-bg);
		color: var(--chip-success-fg);
	}

	.badge.error {
		background-color: var(--chip-danger-bg);
		color: var(--chip-danger-fg);
	}
</style>
