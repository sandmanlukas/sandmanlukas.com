import { getRedis } from '$lib/bingo/redis';
import { json, error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { BingoCard } from '$lib/bingo/types';
import type { RequestHandler } from './$types';

const KV_KEY = 'bingo:cards';

export const GET: RequestHandler = async () => {
	const redis = getRedis();
	const raw = await redis.get(KV_KEY);
	const cards: BingoCard[] = raw ? JSON.parse(raw) : [];
	return json(cards);
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	if (cookies.get('bingo_admin') !== env.BINGO_ADMIN_PASSWORD) {
		throw error(401, 'Unauthorized');
	}

	const { text } = await request.json();
	if (!text || typeof text !== 'string') {
		throw error(400, 'Card text is required');
	}

	const redis = getRedis();
	const raw = await redis.get(KV_KEY);
	const cards: BingoCard[] = raw ? JSON.parse(raw) : [];
	const newCard: BingoCard = { id: crypto.randomUUID(), text: text.trim() };
	cards.push(newCard);
	await redis.set(KV_KEY, JSON.stringify(cards));
	return json(newCard, { status: 201 });
};

export const PUT: RequestHandler = async ({ request, cookies }) => {
	if (cookies.get('bingo_admin') !== env.BINGO_ADMIN_PASSWORD) {
		throw error(401, 'Unauthorized');
	}

	const { id, text } = await request.json();
	if (!text || typeof text !== 'string') {
		throw error(400, 'Card text is required');
	}

	const redis = getRedis();
	const raw = await redis.get(KV_KEY);
	const cards: BingoCard[] = raw ? JSON.parse(raw) : [];
	const card = cards.find((c) => c.id === id);
	if (!card) throw error(404, 'Card not found');
	card.text = text.trim();
	await redis.set(KV_KEY, JSON.stringify(cards));
	return json(card);
};

export const DELETE: RequestHandler = async ({ request, cookies }) => {
	if (cookies.get('bingo_admin') !== env.BINGO_ADMIN_PASSWORD) {
		throw error(401, 'Unauthorized');
	}

	const { id } = await request.json();
	const redis = getRedis();
	const raw = await redis.get(KV_KEY);
	const cards: BingoCard[] = raw ? JSON.parse(raw) : [];
	const filtered = cards.filter((c) => c.id !== id);
	await redis.set(KV_KEY, JSON.stringify(filtered));
	return json({ success: true });
};
