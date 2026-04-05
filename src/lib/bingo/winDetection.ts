import type { BingoSquare } from './types';

const LINES = [
	// Rows
	[0, 1, 2, 3, 4],
	[5, 6, 7, 8, 9],
	[10, 11, 12, 13, 14],
	[15, 16, 17, 18, 19],
	[20, 21, 22, 23, 24],
	// Columns
	[0, 5, 10, 15, 20],
	[1, 6, 11, 16, 21],
	[2, 7, 12, 17, 22],
	[3, 8, 13, 18, 23],
	[4, 9, 14, 19, 24],
	// Diagonals
	[0, 6, 12, 18, 24],
	[4, 8, 12, 16, 20]
];

function isSquareMarked(square: BingoSquare): boolean {
	if (square.isFree) return true;
	if (square.isCustom) return square.marked && !!square.customText;
	return square.marked;
}

export function checkWin(board: BingoSquare[]): { won: boolean; winningIndices: number[] } {
	for (const line of LINES) {
		if (line.every((i) => isSquareMarked(board[i]))) {
			return { won: true, winningIndices: line };
		}
	}
	return { won: false, winningIndices: [] };
}
