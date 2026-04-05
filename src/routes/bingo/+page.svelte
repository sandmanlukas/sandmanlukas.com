<script lang="ts">
	import { onMount } from 'svelte';
	import { buildBoard } from '$lib/bingo/shuffle';
	import { checkWin } from '$lib/bingo/winDetection';
	import type { BingoCard, BingoSquare } from '$lib/bingo/types';

	let board: BingoSquare[] = [];
	let won = false;
	let winningIndices: number[] = [];
	let loading = true;

	let playerName = '';
	let nameSubmitted = false;

	const STORAGE_KEY = 'bingo:board';
	const NAME_KEY = 'bingo:name';

	function saveBoard() {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
	}

	function loadBoard(): BingoSquare[] | null {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (!saved) return null;
		try {
			return JSON.parse(saved);
		} catch {
			return null;
		}
	}

	function toggleSquare(index: number) {
		if (board[index].isFree) return;
		if (board[index].isCustom && !board[index].customText) return;

		board[index].marked = !board[index].marked;
		board = [...board];

		const result = checkWin(board);
		won = result.won;
		winningIndices = result.winningIndices;

		saveBoard();
	}

	function setCustomText(index: number, text: string) {
		board[index].customText = text;
		board = [...board];
		saveBoard();
	}

	async function newBoard() {
		const res = await fetch('/api/bingo/cards');
		const cards: BingoCard[] = await res.json();
		board = buildBoard(cards);
		won = false;
		winningIndices = [];
		saveBoard();
	}

	function isValidBoard(saved: BingoSquare[]): boolean {
		if (saved.length !== 25) return false;
		// Board is invalid if most squares are placeholders
		const realCards = saved.filter((s) => !s.isFree && !s.isCustom && s.text !== '???');
		return realCards.length > 0;
	}

	function submitName() {
		if (!playerName.trim()) return;
		playerName = playerName.trim();
		localStorage.setItem(NAME_KEY, playerName);
		nameSubmitted = true;
	}

	onMount(async () => {
		const savedName = localStorage.getItem(NAME_KEY);
		if (savedName) {
			playerName = savedName;
			nameSubmitted = true;
		}

		const saved = loadBoard();
		if (saved && isValidBoard(saved)) {
			board = saved;
			const result = checkWin(board);
			won = result.won;
			winningIndices = result.winningIndices;
		} else {
			await newBoard();
		}
		loading = false;
	});
</script>

<main>
	{#if loading}
		<div class="centered">
			<p>Laddar bingobrickan...</p>
			<div class="spinner">
				<div class="dot"></div>
				<div class="dot"></div>
				<div class="dot"></div>
			</div>
		</div>
	{:else if !nameSubmitted}
		<div class="centered">
			<h1>BINGO</h1>
			<p>Skriv ditt namn för att börja spela</p>
			<form class="name-form" on:submit|preventDefault={submitName}>
				<input
					type="text"
					bind:value={playerName}
					placeholder="Ditt namn"
					class="name-input"
				/>
				<button type="submit" class="name-btn">Spela</button>
			</form>
		</div>
	{:else}
		<h1>BINGO</h1>
		<p class="greeting">Spelar som <strong>{playerName}</strong></p>

		{#if won}
			<div class="win-banner">BINGO!</div>
		{/if}

		<div class="board">
			{#each board as square, i}
				<button
					class="square"
					class:marked={square.marked}
					class:free={square.isFree}
					class:winning={winningIndices.includes(i)}
					on:click={() => toggleSquare(i)}
					disabled={square.isFree}
				>
					{#if square.isCustom}
						{#if square.customText}
							<span class="square-text">{square.customText}</span>
						{:else}
							<input
								type="text"
								class="custom-input"
								placeholder="Skriv eget..."
								on:click|stopPropagation
								on:keydown={(e) => {
									if (e.key === 'Enter' && e.currentTarget.value.trim()) {
										setCustomText(i, e.currentTarget.value.trim());
									}
								}}
								on:blur={(e) => {
									if (e.currentTarget.value.trim()) {
										setCustomText(i, e.currentTarget.value.trim());
									}
								}}
							/>
						{/if}
					{:else}
						<span class="square-text">{square.text}</span>
					{/if}
				</button>
			{/each}
		</div>

	{/if}
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
	}

	h1 {
		font-size: 2rem;
		font-weight: bold;
		letter-spacing: 0.5rem;
		margin-bottom: 1rem;
	}

	.board {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 4px;
		max-width: 500px;
		width: 100%;
	}

	.square {
		display: flex;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--dot-color);
		border-radius: 6px;
		background-color: inherit;
		color: inherit;
		cursor: pointer;
		padding: 4px;
		font-size: 0.7rem;
		text-align: center;
		word-break: break-word;
		overflow: hidden;
		transition: background-color 0.15s, transform 0.1s;
		min-width: 0;
		min-height: 80px;
	}

	.square:hover:not(.free) {
		opacity: 0.85;
	}

	.square:active:not(.free) {
		transform: scale(0.95);
	}

	.square.marked {
		background-color: var(--color-theme-1, #ff3e00);
		color: white;
	}

	.square.free {
		background-color: var(--color-theme-1, #ff3e00);
		color: white;
		cursor: default;
		font-weight: bold;
	}

	.square.winning {
		animation: pulse 0.6s ease-in-out infinite alternate;
	}

	.square-text {
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 6;
		-webkit-box-orient: vertical;
		line-height: 1.3;
	}

	.custom-input {
		width: 90%;
		border: none;
		border-bottom: 1px solid var(--dot-color);
		background: transparent;
		color: inherit;
		text-align: center;
		font-size: 0.7rem;
		outline: none;
		padding: 2px;
	}

	.win-banner {
		font-size: 1.5rem;
		font-weight: bold;
		color: var(--color-theme-1, #ff3e00);
		margin-bottom: 1rem;
		animation: pulse 0.6s ease-in-out infinite alternate;
	}

	.greeting {
		opacity: 0.7;
		margin-bottom: 1rem;
		font-size: 0.9rem;
	}

	.name-form {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.name-input {
		padding: 0.5rem;
		border: 1px solid var(--dot-color);
		border-radius: 6px;
		background-color: inherit;
		color: inherit;
		font-size: 1rem;
	}

	.name-btn {
		padding: 0.5rem 1.5rem;
		border: 1px solid var(--dot-color);
		border-radius: 6px;
		background-color: inherit;
		color: inherit;
		cursor: pointer;
		font-size: 1rem;
	}

	.name-btn:hover {
		opacity: 0.8;
	}

	@keyframes pulse {
		from {
			opacity: 1;
		}
		to {
			opacity: 0.7;
		}
	}

	.centered {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 50vh;
	}

	.spinner {
		width: 60px;
		display: flex;
		justify-content: space-around;
		margin-top: 1rem;
	}

	.dot {
		width: 15px;
		height: 15px;
		background-color: var(--dot-color);
		border-radius: 50%;
		animation: dot-bounce 1s infinite ease-in-out both;
	}

	.dot:nth-child(1) {
		animation-delay: -0.32s;
	}
	.dot:nth-child(2) {
		animation-delay: -0.16s;
	}

	@keyframes dot-bounce {
		0%,
		80%,
		100% {
			transform: scale(0);
		}
		40% {
			transform: scale(1);
		}
	}

	@media (max-width: 580px) {
		main {
			padding: 0.5rem;
		}

		.board {
			max-width: 100vw;
			width: calc(100vw - 1rem);
			gap: 2px;
		}

		.square {
			font-size: 0.5rem;
			padding: 2px;
			border-radius: 4px;
			min-height: 60px;
		}

		.custom-input {
			font-size: 0.5rem;
		}

		h1 {
			font-size: 1.5rem;
			letter-spacing: 0.3rem;
		}
	}
</style>
