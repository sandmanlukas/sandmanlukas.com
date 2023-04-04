<script lang="ts">
	import Header from './Header.svelte';
	import './styles.css';
	import PageTransition from "./transition.svelte";
	import type { PageData } from './$types';

	export let data: PageData;
</script>

	<div class="app">
		<Header/>
		<PageTransition key={data.url} duration={350}>
			<main>
				<slot/>
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
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

</style>
