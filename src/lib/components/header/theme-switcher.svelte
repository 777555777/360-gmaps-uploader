<script lang="ts">
	import { Moon, Sun, SunMoon } from '@lucide/svelte';
	import { onMount } from 'svelte';

	type Theme = 'light' | 'dark' | 'system';

	let currentTheme: Theme = $state('system');

	function applyTheme(theme: Theme) {
		const root = document.documentElement;

		if (theme === 'system') {
			root.removeAttribute('data-theme');
		} else {
			root.setAttribute('data-theme', theme);
		}
	}

	function switchTheme(theme: Theme) {
		currentTheme = theme;
		applyTheme(theme);
		saveTheme(theme);
	}

	function saveTheme(theme: Theme) {
		localStorage.setItem('theme', theme);
	}

	function loadTheme() {
		const savedTheme = (localStorage.getItem('theme') as Theme | null) ?? 'system';
		currentTheme = savedTheme;
		applyTheme(savedTheme);
	}

	onMount(() => {
		loadTheme();

		const mq = window.matchMedia('(prefers-color-scheme: dark)');

		const handler = () => {
			if (currentTheme === 'system') {
				applyTheme('system');
			}
		};

		mq.addEventListener('change', handler);

		return () => mq.removeEventListener('change', handler);
	});
</script>

<div class="container-row">
	<div class="switcher-row">
		<div class="toggle" data-active={currentTheme}>
			<button
				aria-pressed={currentTheme === 'light'}
				title="Light mode"
				onclick={() => switchTheme('light')}
			>
				<Sun size={16} />
			</button>
			<button
				aria-pressed={currentTheme === 'dark'}
				title="Dark mode"
				onclick={() => switchTheme('dark')}
			>
				<Moon size={16} />
			</button>
			<button
				aria-pressed={currentTheme === 'system'}
				title="System mode"
				onclick={() => switchTheme('system')}
			>
				<SunMoon size={16} />
			</button>
		</div>
	</div>
</div>

<style>
	.container-row {
		padding: 0.5rem 0.75rem;
	}

	.switcher-row {
		margin: 0 auto;
		max-width: 450px;
	}

	.toggle {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.25rem;
		padding: 0.25rem;
		border-radius: 100vmax;
		border: 1px solid var(--border-subtle);
	}

	.toggle::before {
		content: '';
		position: absolute;
		top: 0.25rem;
		left: 0.25rem;
		bottom: 0.25rem;
		will-change: transform;

		width: calc((100% - 0.5rem) / 3);
		background-color: var(--surface-dark);
		border-radius: 100vmax;
		transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 0;
	}

	/* Positionen */

	.toggle[data-active='light']::before {
		transform: translateX(0%);
	}

	.toggle[data-active='dark']::before {
		transform: translateX(100%);
	}

	.toggle[data-active='system']::before {
		transform: translateX(200%);
	}

	button {
		position: relative;
		z-index: 1;
		border: none;
		background: none;
		color: var(--text-default);
		padding: 0.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		transition: color 150ms ease;
	}

	button[aria-pressed='true'] {
		color: var(--text-light);
	}
</style>
