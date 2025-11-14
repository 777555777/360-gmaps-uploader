<script>
	import logo from '$lib/assets/icon-32x32.png';
	import appSwitchIcon from '$lib/assets/icon-app-switch.svg';
	import profileIcon from '$lib/assets/icon-profile.png';
</script>

<header>
	<div class="logo-container">
		<img src={logo} alt="Logo" height="32" />
		<span>360 Image Uploader</span>
	</div>
	<div class="g-container">
		<div class="g-app-switch">
			<img src={appSwitchIcon} alt="App Switch" />
		</div>
		<div class="g-profile">
			<img src={profileIcon} alt="Profile Options" />
		</div>
	</div>
</header>

<style>
	header {
		height: 4rem;
		padding: 0.5rem;
		display: flex;
		justify-content: space-between;
		background-color: var(--header-color);

		.logo-container {
			padding-left: 12px;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.25rem;

			user-select: none;
			cursor: pointer;

			span {
				display: block;
				font-family: 'Product Sans', Arial, sans-serif;
				font-size: 22px;
				line-height: 48px;
				color: var(--logo-text-color);
				text-rendering: optimizeLegibility;
			}
		}

		.g-container {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.375rem;

			padding: 0 4px;
			padding-left: 30px;

			/* width: 124px;
			height: 48px; */

			.g-profile {
				padding: 6px;

				img {
					background-size: 32px 32px;
					border: 0;
					border-radius: 50%;
					display: block;
					margin: 0px;
					position: relative;
					height: 32px;
					width: 32px;
					z-index: 0;
				}
			}

			.g-app-switch {
				padding: 8px;
				display: grid;
				place-items: center;

				img {
					height: 22px; /* 24px in original */
					width: 22px; /* 24px in original */
				}
			}
		}
	}
</style>
