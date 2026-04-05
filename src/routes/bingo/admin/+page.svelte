<script lang="ts">
	import { onMount } from 'svelte';
	import type { BingoCard } from '$lib/bingo/types';

	let authenticated = false;
	let password = '';
	let authError = '';

	let cards: BingoCard[] = [];
	let newCardText = '';
	let loading = true;

	async function login() {
		authError = '';
		const res = await fetch('/api/bingo/auth', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ password })
		});

		if (res.ok) {
			authenticated = true;
			await fetchCards();
		} else {
			authError = 'Invalid password';
		}
	}

	async function fetchCards() {
		loading = true;
		const res = await fetch('/api/bingo/cards');
		cards = await res.json();
		loading = false;
	}

	async function addCard() {
		if (!newCardText.trim()) return;

		const res = await fetch('/api/bingo/cards', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ text: newCardText.trim() })
		});

		if (res.ok) {
			const card = await res.json();
			cards = [...cards, card];
			newCardText = '';
		} else if (res.status === 401) {
			authenticated = false;
		}
	}

	let editingId: string | null = null;
	let editText = '';

	function startEdit(card: BingoCard) {
		editingId = card.id;
		editText = card.text;
	}

	async function saveEdit(id: string) {
		if (!editText.trim()) return;

		const res = await fetch('/api/bingo/cards', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, text: editText.trim() })
		});

		if (res.ok) {
			const updated = await res.json();
			cards = cards.map((c) => (c.id === id ? updated : c));
			editingId = null;
		} else if (res.status === 401) {
			authenticated = false;
		}
	}

	async function deleteCard(id: string) {
		const res = await fetch('/api/bingo/cards', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id })
		});

		if (res.ok) {
			cards = cards.filter((c) => c.id !== id);
		} else if (res.status === 401) {
			authenticated = false;
		}
	}

	onMount(() => {
		loading = false;
	});
</script>

<main>
	{#if !authenticated}
		<div class="auth-form">
			<h1>Bingo Admin</h1>
			<form on:submit|preventDefault={login}>
				<input
					type="password"
					bind:value={password}
					placeholder="Lösenord"
					class="input"
				/>
				<button type="submit" class="btn">Logga in</button>
			</form>
			{#if authError}
				<p class="error">Fel lösenord</p>
			{/if}
		</div>
	{:else}
		<h1>Bingo Admin</h1>

		{#if cards.length < 24}
			<p class="warning">
				{cards.length}/24 kort tillagda. Lägg till minst {24 - cards.length} till för en full bricka.
			</p>
		{:else}
			<p class="count">{cards.length} kort</p>
		{/if}

		<form class="add-form" on:submit|preventDefault={addCard}>
			<input
				type="text"
				bind:value={newCardText}
				placeholder="Nytt bingokort..."
				class="input"
			/>
			<button type="submit" class="btn">Lägg till</button>
		</form>

		{#if loading}
			<p>Laddar...</p>
		{:else}
			<ul class="card-list">
				{#each cards as card (card.id)}
					<li class="card-item">
						{#if editingId === card.id}
							<form class="edit-form" on:submit|preventDefault={() => saveEdit(card.id)}>
								<input
									type="text"
									bind:value={editText}
									class="input"
								/>
								<button type="submit" class="btn">Spara</button>
								<button type="button" class="btn" on:click={() => (editingId = null)}>Avbryt</button>
							</form>
						{:else}
							<span on:dblclick={() => startEdit(card)}>{card.text}</span>
							<div class="card-actions">
								<button class="edit-btn" on:click={() => startEdit(card)}>&#9998;</button>
								<button class="delete-btn" on:click={() => deleteCard(card.id)}>&times;</button>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	{/if}
</main>

<style>
	main {
		max-width: 600px;
		margin: 0 auto;
		padding: 1rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 1rem;
	}

	.auth-form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 50vh;
	}

	.auth-form form {
		display: flex;
		gap: 0.5rem;
	}

	.add-form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.input {
		padding: 0.5rem;
		border: 1px solid var(--dot-color);
		border-radius: 6px;
		background-color: inherit;
		color: inherit;
		flex: 1;
	}

	.btn {
		padding: 0.5rem 1rem;
		border: 1px solid var(--dot-color);
		border-radius: 6px;
		background-color: inherit;
		color: inherit;
		cursor: pointer;
	}

	.btn:hover {
		opacity: 0.8;
	}

	.error {
		color: #e53e3e;
		margin-top: 0.5rem;
	}

	.warning {
		color: #dd6b20;
		margin-bottom: 1rem;
	}

	.count {
		color: var(--dot-color);
		opacity: 0.7;
		margin-bottom: 1rem;
	}

	.card-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.card-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--dot-color);
		border-radius: 6px;
		margin-bottom: 0.5rem;
	}

	.card-actions {
		display: flex;
		gap: 0.25rem;
	}

	.edit-form {
		display: flex;
		gap: 0.5rem;
		flex: 1;
	}

	.edit-btn {
		background: none;
		border: none;
		color: var(--dot-color);
		font-size: 1rem;
		cursor: pointer;
		padding: 0 0.25rem;
		line-height: 1;
	}

	.edit-btn:hover {
		opacity: 0.7;
	}

	.delete-btn {
		background: none;
		border: none;
		color: #e53e3e;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0 0.25rem;
		line-height: 1;
	}

	.delete-btn:hover {
		opacity: 0.7;
	}
</style>
