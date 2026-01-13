<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import Accordion from '$lib/components/util/accordion.svelte';
	import { MessageCircleQuestionMark } from '@lucide/svelte';
	import { page } from '$app/state';

	// Get full canonical URL
	const canonicalUrl = `https://panopublisher.net${page.url.pathname}`;
</script>

<svelte:head>
	<title>FAQ - Pano Publisher</title>
	<meta
		name="description"
		content="Frequently asked questions about Pano Publisher. Learn about supported image formats, metadata requirements, upload limits, and how to publish 360° photos to Google Street View."
	/>

	<!-- Canonical URL -->
	<link rel="canonical" href={canonicalUrl} />

	<!-- Open Graph / Social Media -->
	<meta property="og:title" content="FAQ - Pano Publisher" />
	<meta
		property="og:description"
		content="Answers to common questions about uploading 360° photos to Google Street View."
	/>
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:type" content="website" />
</svelte:head>

<div class="faq-page">
	<Header />

	<main>
		<h1>FAQ</h1>

		<h2>General</h2>
		<section class="faq general">
			<Accordion open={true}>
				{#snippet header()}
					<MessageCircleQuestionMark size={16} />
					<h3>Is Pano Publisher free to use?</h3>
				{/snippet}
				{#snippet content()}
					<p>Yes. Pano Publisher is completely free to use and does not charge any fees.</p>
				{/snippet}
			</Accordion>

			<Accordion open={true}>
				{#snippet header()}
					<MessageCircleQuestionMark size={16} />
					<h3>Is Pano Publisher an official Google product?</h3>
				{/snippet}
				{#snippet content()}
					<p>
						No. Pano Publisher is an independent, open-source, third-party application and is not
						affiliated with or endorsed by Google.
					</p>
				{/snippet}
			</Accordion>

			<Accordion open={true}>
				{#snippet header()}
					<MessageCircleQuestionMark size={16} />
					<h3>Does Pano Publisher store my images or personal data?</h3>
				{/snippet}
				{#snippet content()}
					<p>
						No, Pano Publisher does not store your images or personal data. Your images are uploaded
						directly from your browser to Google Street View. When you use the location search,
						search requests are sent to an external service <a
							href="https://www.maptiler.com/"
							target="_blank"
							rel="noopener noreferrer">MapTiler</a
						> to find places, but no images or personal information are stored by Pano Publisher.
					</p>
				{/snippet}
			</Accordion>

			<Accordion>
				{#snippet header()}
					<MessageCircleQuestionMark size={16} />
					<h3>Why does Pano Publisher only support uploading individual photo spheres?</h3>
				{/snippet}
				{#snippet content()}
					<p>
						The main goal of Pano Publisher is to fill the gap left by the in 2023 discontinued
						Google Street View mobile app, which previously allowed uploading individual photo
						spheres at any location. Google’s official successor tool, Street View Studio, does not
						support uploading individual photo spheres. Therefore, there was no alternative that is
						free and easy to use.
					</p>
				{/snippet}
			</Accordion>
		</section>

		<h2>Technical</h2>
		<section class="faq technical">
			<Accordion>
				{#snippet header()}
					<MessageCircleQuestionMark size={16} />
					<h3>Which image formats are supported?</h3>
				{/snippet}
				{#snippet content()}
					<p>
						JPG images with a 2:1 aspect ratio in equirectangular projection are supported. The
						maximum upload size per image is 75 MB, with a maximum resolution of 100 megapixels.
					</p>
				{/snippet}
			</Accordion>

			<Accordion>
				{#snippet header()}
					<MessageCircleQuestionMark size={16} />
					<h3>Do I need special metadata in my images?</h3>
				{/snippet}
				{#snippet content()}
					<p>
						Yes. Images must contain GPano metadata to be recognized as 360° panoramas by the Google
						Street View API. If your images do not contain this metadata or if it is incomplete,
						Pano Publisher will automatically add the required metadata before uploading.
					</p>
					<br />
					<p>
						Most 360° cameras (such as Ricoh Theta, Insta360, or GoPro Max) include this metadata
						automatically. However, exporting images from tools like Adobe Lightroom or Photoshop
						may remove it. More information about GPano metadata can be found
						<a
							href="https://developers.google.com/streetview/spherical-metadata?hl=en"
							target="_blank"
							rel="noopener noreferrer">here</a
						>.
					</p>
				{/snippet}
			</Accordion>

			<Accordion>
				{#snippet header()}
					<MessageCircleQuestionMark size={16} />
					<h3>How many images can I upload at once?</h3>
				{/snippet}
				{#snippet content()}
					<p>
						You can import up to 16 images at once into the application. Additionally, the Google
						Street View API allows up to 2,000 uploads per Google account per day.
					</p>
				{/snippet}
			</Accordion>
		</section>

		<h2>Features</h2>
		<section class="faq general">
			<Accordion>
				{#snippet header()}
					<MessageCircleQuestionMark size={16} />
					<h3>Can I upload videos or connected panoramas (blue lines)?</h3>
				{/snippet}
				{#snippet content()}
					<p>
						No. Pano Publisher is intentionally focused on uploading individual photo spheres only.
						To upload videos or create connected panoramas (blue lines), please use Google Street
						View Studio.
					</p>
				{/snippet}
			</Accordion>

			<Accordion>
				{#snippet header()}
					<MessageCircleQuestionMark size={16} />
					<h3>How can I delete an uploaded panorama?</h3>
				{/snippet}
				{#snippet content()}
					<p>
						To delete an uploaded panorama, open Google Maps, view your contributions, go to Photos,
						and delete the desired panorama there. Pano Publisher does not have the ability to
						delete uploaded panoramas.
					</p>
				{/snippet}
			</Accordion>

			<Accordion>
				{#snippet header()}
					<MessageCircleQuestionMark size={16} />
					<h3>My images don’t have GPS coordinates - can I still upload them?</h3>
				{/snippet}
				{#snippet content()}
					<p>
						Yes. Pano Publisher allows you to manually set the location on the map where the
						panorama was taken. The location preview uses OpenStreetMap, if precise placement is
						important to you, we recommend copying and pasting exact coordinates from Google Maps.
					</p>
				{/snippet}
			</Accordion>

			<Accordion>
				{#snippet header()}
					<MessageCircleQuestionMark size={16} />
					<h3>How long does it take until my panorama is visible on Google Maps?</h3>
				{/snippet}
				{#snippet content()}
					<p>
						This can vary. In most cases, the panorama becomes accessible within 1-5 minutes after
						upload by dragging the yellow "Pegman" icon onto the map at the upload location, even if
						no blue circle is visible yet. The blue photo sphere circle usually appears later and
						may take several hours or even days.
					</p>
				{/snippet}
			</Accordion>
		</section>

		<section class="others">
			<h3>Image Credits</h3>
			<section class="image-credits">
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

			<h3>Disclaimers</h3>
			<section class="disclaimers">
				<p>
					This application uses the Google Street View Publish API, Google Identity Services, and
					the Google People API. Google Maps, Google Street View, and related trademarks are
					property of Google LLC.
				</p>
			</section>
		</section>
	</main>
</div>

<style>
	.faq-page {
		background-color: var(--surface-subtle);
		color: var(--text-default);
		display: flex;
		flex-direction: column;
	}

	section.faq {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;

		h3 {
			margin: 0 !important;
			font-size: 1rem;
			font-weight: 400;
			margin-top: 2rem;
			margin-bottom: 0.75rem;
			color: var(--text-default);
		}
	}

	:global(summary) {
		padding: 0.5rem 1rem !important;
		padding-right: 1.5rem !important;
	}

	:global(.accordion-content p) {
		padding-inline: 2.5rem;
		margin-bottom: 0rem !important;
		color: var(--text-medium);
	}

	@media (max-width: 576px) {
		:global(.faq svg) {
			display: none;
		}
		:global(.faq .accordion-content p) {
			padding-inline: 0.75rem;
		}
	}

	.others {
		margin-top: 3rem;
		border-top: 2px solid var(--border-subtle);
		padding-top: 1.5rem;

		.image-credits {
			span {
				color: var(--text-muted);
			}
		}

		.disclaimers {
			p {
				margin: 0.5rem 0 0 0;
				color: var(--text-muted);
				font-size: 14px;
			}
		}
	}

	/* ======================= */

	main {
		max-width: 960px;
		width: 100%;
		margin: 0 auto;
		padding: 2rem;
		flex: 1;
	}

	h1 {
		font-size: 2rem;
		font-weight: 600;
		margin-bottom: 2rem;
		color: var(--text-default);
		border-bottom: 2px solid var(--border-subtle);
		padding-bottom: 1rem;
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 3rem;
		margin-bottom: 1rem;
		color: var(--text-default);
	}

	h3 {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 0.75rem;
		color: var(--text-default);
	}

	ul {
		margin: 0.5rem 0 1rem 0;
		padding-left: 1.5rem;
		line-height: 1.7;
	}

	li {
		margin-bottom: 0.5rem;
		color: var(--text-muted);
	}

	a {
		color: var(--link-color);
		text-decoration: none;
		word-break: break-word;

		&:hover {
			text-decoration: underline;
		}
	}

	@media (width < 960px) {
		main {
			max-width: 90%;
		}
	}

	@media (width < 600px) {
		main {
			padding: 1.5rem 1rem;
		}

		h1 {
			font-size: 1.75rem;
		}

		h2 {
			font-size: 1.25rem;
		}

		h3 {
			font-size: 1.1rem;
		}
	}
</style>
