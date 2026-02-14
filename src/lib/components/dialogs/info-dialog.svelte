<script lang="ts">
	import { closeDialogById } from '$lib/utils/dialog-helpers';
	import { INFO_DIALOG_ID } from '$lib/globals';

	function closeInfoDialog() {
		closeDialogById(INFO_DIALOG_ID);
	}
</script>

<div class="info-content">
	<section>
		<h3>About this Application</h3>
		<p>
			This application lets you upload individual 360° photo spheres directly to Google Maps /
			Street View for <strong>free</strong>. Uploaded images appear as blue photo circles on Google
			Maps.
		</p>
		<p>
			The app was created to fill a gap in Google's official tools.
			<span class="no-wrap">Street View Studio</span> does not support uploading single photo spheres,
			and Google has discontinued the Street View mobile app, which previously allowed this.
		</p>
		<p>
			<strong>Important:</strong> This app is intentionally focused on uploading individual photo spheres
			only. It does not support video uploads or connected panoramas (blue lines).
		</p>
		<p>
			If you want to upload videos or create connected panoramas (blue lines), please use
			<a href="https://streetviewstudio.maps.google.com" target="_blank" rel="noopener noreferrer">
				<span class="no-wrap">Street View Studio</span>
			</a>.
		</p>
	</section>

	<!-- Actions -->
	<div class="dialog-actions">
		<button class="secondary-btn" onclick={closeInfoDialog} aria-label="Close Info Dialog">
			Close
		</button>
	</div>
</div>

<style>
	.info-content {
		font-size: 14px;
		line-height: 1.6;
	}

	.no-wrap {
		white-space: nowrap;
	}

	section {
		margin-bottom: 1rem;
	}

	h3 {
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 0.75rem 0;
	}

	p {
		margin: 0 0 0.75rem 0;
		color: var(--text-muted);
	}

	a {
		color: var(--link-color);
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}
</style>
