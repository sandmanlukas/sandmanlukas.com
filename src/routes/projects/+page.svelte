<script>
	let cards = [
		{
			title: "nettest",
			description:
				'cli app to determine internet speed, based on <a href="https://fast.com/">fast.com</a>',
			imageUrl: "/images/nettest.png",
			tech: ["Rust"],
			url: "https://github.com/sandmanlukas/nettest",
		},
		{
			title: "tram checker",
			description:
				"cli app to check next buses and trams from stations around gothenburg.",
			imageUrl: "/images/tram_checker.png",
			tech: ["Rust"],
			url: "https://github.com/sandmanlukas/tram_checker",
		},
		{
			title: "weather app",
			description:
				"a simple weather app. displays current weather information and forecasts for user's location.",
			imageUrl: "/images/weather_app.png",
			tech: ["Flutter", "Dart"],
			url: "https://github.com/sandmanlukas/flutter_summer_2023/tree/main/assignment3",
		},
		{
			title: "streck counter",
			description:
				"website for committee at chalmers. handles internal stuff. 🕵️‍♂️",
			imageUrl: "/images/streck_counter.png",
			tech: ["React.js", "Typescript", "CSS", "HTML", "MongoDB"],
			url: "https://streck.up.railway.app/login",
		},
		{
			title: "personal website",
			description: "portfolio website for myself.",
			imageUrl: "/images/svelte-logo.svg",
			tech: ["SvelteKit", "Typescript", "CSS", "HTML"],
			url: "https://sandmanlukas.com/",
		},
	];
</script>

<svelte:head>
	<title>projects</title>
	<meta name="description" content="Some of my projects" />
</svelte:head>

<div class="card-container">
	{#each cards as card (card.title)}
		<div class="card">
			{#if card.imageUrl}
				<img src={card.imageUrl} alt={card.title} />
			{/if}
			<a href={card.url}><h2>{card.title}</h2></a>
			<p>{@html card.description}</p>
			<div class="technology-pill-container">
				{#each card.tech as tech}
					<div class="technology-pill">{tech}</div>
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	:root {
		--background-color-light: #fff;
		--text-color-light: #fff;
		--background-color-dark: #333;
		--text-color-dark: #333;
		--border-color-light: #ddd;
		--border-color-dark: #333;
	}
	/* Styles for the card container */
	.card-container {
		display: grid;
		grid-gap: 20px;
		grid-template-columns: 1fr 1fr;
		/* color: var(--text-color-dark); */
	}

	.card:last-child:nth-last-child(odd) {
		grid-column: auto / span 2;
	}
	/* Styles for each card */
	.card {
		display: flex;
		flex-direction: column;
		align-items: center; /* Center content horizontally */
		text-align: center; /* Center text horizontally */
		justify-content: flex-end;
		width: 100%; /* Adjust the width of each card as needed */

		border: 1px solid;
		margin-bottom: 20px; /* Add spacing between cards */
		padding: 15px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		border-radius: 10px;
	}

	.card.dark {
		border-color: var(--border-color-light);
		/* color: #ddd; */
	}

	/* Style for the card image */
	.card img {
		max-width: 100%;
		height: auto;
		max-height: 10rem;
		border-radius: 10px;
		justify-content: start;
	}

	/* Style for the card title */
	.card h2 {
		font-size: 18px;
		margin-top: 1rem;
	}

	/* Style for the card text */
	.card p {
		font-size: 14px;
		/* color: #777; */
		margin-bottom: 0.5rem;
	}

	.technology-pill-container {
		display: flex;
		flex-direction: row;
	}
	/* Styles for the technology pills */
	.technology-pill {
		display: flex;
		background-color: #ff3e00;
		color: #ddd;
		padding: 5px 10px;
		margin: 5px 5px 0 0; /* Add spacing between pills */
		border-radius: 20px;
		font-size: 12px;
		justify-content: center;
	}

	@media (max-width: 580px) {
		.card-container {
			display: block;
		}

		.technology-pill-container {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}

		.technology-pill-container > :last-child:nth-child(odd) {
			grid-template-columns: 1fr;
			grid-column: span 2;
			justify-content: center;
		}
	}
</style>
