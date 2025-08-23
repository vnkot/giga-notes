import { IGigaNotesSettings } from "types";

export const DEFAULT_SETTINGS: IGigaNotesSettings = {
	model: 'GigaChat',
	scope: 'GIGACHAT_API_PERS',
	definitionPrompt: `Сгенерируй ёмкое, но компактное определение. Формат: "Термин - это [сущность], которая...". 
	Укажи 2-3 ключевые характеристики. Будь лаконичен (1-2 предложения). Используй markdown разметку`,
	textExpandPrompt: `Дополни текст, сохраняя оригинальный стиль и контекст. Плавно продолжи мысль, 
	не изменяя существующий контент. Добавь 1-2 предложения, развивающие идею. Используй markdown разметку`,
	customRequestPrompt: `Коротко ответь на следующее сообщение. Ты помощник для написания заметок в obsidian`
} as const;