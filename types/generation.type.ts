export enum EGenerationType {
	DEFINITION,
	TEXT_EXPAND,
	CUSTOM_REQUEST,
}

export interface IGigaNotesSettings {
	model: string;
	scope: string;
	authKey?: string;
	textExpandPrompt: string;
	definitionPrompt: string;
	customRequestPrompt: string;
}