<script>
	import { page } from "$app/stores";
	import github from "$lib/images/github.svg";
	import linkedin from "$lib/images/linkedin.svg";
	import email from "$lib/images/email.svg";
	import cv from "$lib/cv.pdf";
</script>

<header>
	<nav>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L1,2 C1.5,3 1.5,3 2,3 L2,0 Z" />
		</svg>
		<ul>
			<li aria-current={$page.url.pathname === "/" ? "page" : undefined}>
				<a href="/">/home/</a>
			</li>
			<li
				aria-current={$page.url.pathname === "/whoami"
					? "page"
					: undefined}
			>
				<a href="/whoami">whoami</a>
			</li>
			<li
				aria-current={$page.url.pathname === "/resume"
					? "page"
					: undefined}
			>
				<a href={cv} download="Lukas_Sandman_CV">resume.pdf</a>
			</li>
		</ul>
		<svg viewBox="0 0 2 3" aria-hidden="true">
			<path d="M0,0 L0,3 C0.5,3 0.5,3 1,2 L2,0 Z" />
		</svg>
	</nav>

	<div class="corner">
		<a href="https://www.linkedin.com/in/lukas-sandman-1805a7190/">
			<img src={linkedin} alt="LinkedIn" />
		</a>
		<a href="https://github.com/sandmanlukas">
			<img src={github} alt="GitHub" />
		</a>
		<a href="mailto:sandmanlukas@gmail.com">
			<img src={email} alt="E-Mail" />
		</a>
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	.corner {
		width: 3em;
		height: 3em;
	}

	.corner a {
		margin: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
	}

	.corner img {
		width: 2em;
		height: 2em;
		object-fit: contain;
	}

	nav {
		margin: auto;
		display: flex;
		justify-content: center;
		--background: rgba(255, 255, 255, 0.7);
		text-align: center;
	}

	svg {
		width: 2em;
		height: 3em;
		display: block;
	}

	path {
		fill: var(--background);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current="page"]::before {
		--size: 6px;
		content: "";
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: var(--color-text);
		font-weight: 700;
		font-size: 1rem;
		text-transform: lowercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}
</style>
