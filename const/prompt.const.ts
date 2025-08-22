import { EGenerationType } from "types";

export const GENERATION_PROMPT: Record<EGenerationType, string> = {
	[EGenerationType.DEFINITION]:
		`Сгенерируй ёмкое, но компактное определение. Формат: "Термин - это [сущность], которая...". 
	Укажи 2-3 ключевые характеристики. Будь лаконичен (1-2 предложения). Используй markdown разметку`,

	[EGenerationType.TEXT_EXPAND]:
		`Дополни текст, сохраняя оригинальный стиль и контекст. Плавно продолжи мысль, 
	не изменяя существующий контент. Добавь 1-2 предложения, развивающие идею. Используй markdown разметку`,
	[EGenerationType.CUSTOM_REQUEST]: "Коротко ответь на следующее сообщение. Ты помощник для написания заметок в obsidian",
};