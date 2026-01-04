<script lang="ts"></script>

<div class="info-content">
	<section>
		<h3>About this Application</h3>
		<p>
			This application lets you upload individual 360° photo spheres directly to Google Maps /
			Street View. These images appear as the blue circles on Google Maps.
		</p>
		<p>
			It was created to fill a gap in Google's official tools: Google Street View Studio does not
			support uploading single images, and Google has discontinued the Street View mobile app, which
			was previously the only alternative for publishing standalone photo spheres.
		</p>
		<p>
			<strong>Important:</strong> This project is intentionally focused on uploading individual photo
			spheres only. It does not support:
		</p>
		<ul>
			<li>Video uploads</li>
			<li>Connecting panoramas</li>
			<li>Creating street-level imagery from video footage</li>
		</ul>
		<p>
			If you want to upload videos or create connected street-level imagery, please use
			<a href="https://streetviewstudio.maps.google.com" target="_blank" rel="noopener noreferrer">
				Google Street View Studio
			</a>.
		</p>
	</section>
	<section>
		<h3>Disclaimers</h3>
		<p>
			This application uses Google Maps and Street View APIs. Google Maps and Street View are
			trademarks of Google.
		</p>
	</section>
	<section>
		<h3>Image Credits</h3>
		<ul>
			<li>
				<span>Map Placeholder Image: </span>
				<a
					href="https://www.freepik.com/free-vector/damask-seamless-pattern_6541371.htm#fromView=search&page=2&position=2&uuid=1ad6ecdf-1808-4ae4-8017-90719b5050c4&query=topography"
					target="_blank"
					rel="noopener noreferrer">by GarryKillian on Freepik</a
				>
			</li>
		</ul>
	</section>
</div>

<style>
	.info-content {
		font-size: 14px;
		line-height: 1.6;
		text-align: justify;
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

	ul {
		margin: 0.5rem 0 0.75rem 1.5rem;
		padding: 0;
	}

	li {
		margin-bottom: 0.25rem;
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
