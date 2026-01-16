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
		<div class="toggle">
			<button
				class={currentTheme === 'dark' ? 'active' : ''}
				onclick={() => switchTheme('dark')}
				aria-label="Dark mode"
			>
				<Moon size={16} />
			</button>
			<button
				class={currentTheme === 'light' ? 'active' : ''}
				onclick={() => switchTheme('light')}
				aria-label="Light mode"
			>
				<Sun size={16} />
			</button>
			<button
				class={currentTheme === 'system' ? 'active' : ''}
				onclick={() => switchTheme('system')}
				aria-label="System theme"
			>
				<SunMoon size={16} />
			</button>
		</div>
	</div>
</div>

<style>
	.container-row {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		padding: 0.5rem 0.35rem;
	}

	.switcher-row {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	button {
		border: none;
		background-color: transparent;
		cursor: pointer;
		color: var(--text-default);
		display: flex;
		padding: 0.25rem;
	}

	button.active {
		background-color: var(--surface-dark);
		color: var(--text-light);
		border-radius: 100vmax;
	}

	.toggle {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0.5rem;
		border-radius: 100vmax;
		border: 1px solid var(--border-subtle);
		background-color: transparent;
		width: fit-content;
		padding: 0.125rem;
	}
</style>
