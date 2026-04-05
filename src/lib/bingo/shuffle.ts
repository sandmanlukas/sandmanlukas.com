import type { BingoCard, BingoSquare } from './types';

function fisherYatesShuffle<T>(array: T[]): T[] {
	const shuffled = [...array];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
}

export function buildBoard(cards: BingoCard[]): BingoSquare[] {
	const board: BingoSquare[] = new Array(25);

	// Place FREE at center (index 12)
	board[12] = {
		id: 'free',
		text: 'GRATIS',
		marked: true,
		isFree: true,
		isCustom: false
	};

	// Remaining 24 slots (excluding index 12)
	const slots = Array.from({ length: 25 }, (_, i) => i).filter((i) => i !== 12);

	// Pick a random slot for the custom "enter your own" square
	const customSlotIndex = Math.floor(Math.random() * slots.length);
	const customSlot = slots[customSlotIndex];
	slots.splice(customSlotIndex, 1);

	board[customSlot] = {
		id: 'custom',
		text: '',
		marked: false,
		isFree: false,
		isCustom: true
	};

	// Shuffle cards and fill remaining 23 slots
	const shuffled = fisherYatesShuffle(cards);
	const slotsToFill = fisherYatesShuffle(slots);

	for (let i = 0; i < slotsToFill.length; i++) {
		const slot = slotsToFill[i];
		if (i < shuffled.length) {
			board[slot] = {
				id: shuffled[i].id,
				text: shuffled[i].text,
				marked: false,
				isFree: false,
				isCustom: false
			};
		} else {
			board[slot] = {
				id: `placeholder-${i}`,
				text: '???',
				marked: true,
				isFree: false,
				isCustom: false
			};
		}
	}

	return board;
}
