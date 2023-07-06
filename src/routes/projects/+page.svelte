<svelte:head>
	<title>projects</title>
	<meta name="description" content="Some of my projects" />
</svelte:head>

<div class="text-column">
	<h1>projects</h1>

	<section>
		<div class="project-grid">
			<a href="#">tramchecker</a>
			<a href="#">nettest</a>
			<a href="#">random project #1</a>
			<a href="#">random project #2</a>
		</div>
	</section>
</div>

<style>
	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		grid-template-rows: repeat(auto-fill, minmax(300px, 1fr));
		gap: 15px;
	}

	a {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		text-decoration: none;
		color: #333;
		font-size: 24px;
	}

	h1 {
		width:100%;
	}
</style>
