<script lang="ts">
	import { DateTime } from "luxon";

	const date = DateTime.local(2023, 8, 29, 12, 0, 0);
	const streak = Math.round(Math.abs(date.diffNow("days").days));

	const spotifyTrack = "track/0LbZxI8FZU1E48EqF9XgC0?si=cc2a9508809d4939";
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Personal website of sandmanlukas" />
	<script
		src="https://open.spotify.com/embed-podcast/iframe-api/v1"
		async
	></script>
</svelte:head>

<section>
	<h1>hello there, I'm Lukas</h1>

	<div class="main-container">
		<p>
			I'm a software developer interested in ML, cyber security and web
			development. When I'm not coding I'm either running or trying to
			learn how to DJ.
		</p>

		<p class="running-p">
			Current run streak 🏃‍♂️: {streak} days
		</p>

		<p class="song-p">Current song on repeat 💿:</p>

		<div id="embed-iframe" class="song-container">
			<iframe
				title="spotify-embed"
				style="border-radius:12px"
				src="https://open.spotify.com/embed/{spotifyTrack}?utm_source=generator&theme=1"
				width="100%"
				height="152"
				frameBorder="0"
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				loading="lazy"
			/>
		</div>
	</div>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin: 0 auto;
	}

	h1 {
		margin-top: 3rem;
		margin-bottom: 1rem;
		width: 80%;
		display: flex;
	}

	p {
		text-align: start;
	}

	.running-p {
		font-weight: bold;
		margin-top: 1rem;
		margin-bottom: 1rem;
	}

	.song-p {
		margin-bottom: 1rem;
		font-weight: bold;
	}
	.main-container {
		width: 80%;
	}

	.song-container {
		align-self: center;
		margin: 0;
		padding: 0;

		z-index: 50;
	}

	@media (max-width: 580px) {
		h1 {
			margin-top: 0;
		}

		.song-p {
			font-weight: normal;
			font-size: small;
		}

		.running-p {
			font-size: small;
		}
	}
</style>
