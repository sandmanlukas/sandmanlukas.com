export interface BingoCard {
	id: string;
	text: string;
}

export interface BingoSquare {
	id: string;
	text: string;
	marked: boolean;
	isFree: boolean;
	isCustom: boolean;
	customText?: string;
}
