<script lang="ts">
	import Header from "./Header.svelte";
	import "../app.css";
	import PageTransition from "./transition.svelte";
	import type { PageData } from "./$types";
	import ThemeSwitch from "$lib/ThemeSwitch/ThemeSwitch.svelte";

	export let data: PageData;
</script>

<div data-sveltekit-preload-data="hover" class="app">
	<Header />
	<PageTransition key={data.url} duration={350}>
		<main>
			<slot />
		</main>
	</PageTransition>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 70rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	@media (max-width: 580px) {
		main {
			padding-left: 0;
			padding-right: 0;
		}
	}
</style>
