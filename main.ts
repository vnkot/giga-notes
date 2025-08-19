import { GigaChat } from 'entities/gigachat';
import { GigaNotesSettingTab } from 'GigaNotesSettingTab';
import { Editor, Notice, Plugin } from 'obsidian';

enum EGenerationType {
	DEFINITION,
	TEXT_EXPAND
}

const GENERATION_PROMPT: Record<EGenerationType, string> = {
	[EGenerationType.DEFINITION]:
		`Сгенерируй ёмкое, но компактное определение. Формат: "Термин - это [сущность], которая...". 
    Укажи 2-3 ключевые характеристики. Будь лаконичен (1-2 предложения). Используй markdown разметку`,

	[EGenerationType.TEXT_EXPAND]:
		`Дополни текст, сохраняя оригинальный стиль и контекст. Плавно продолжи мысль, 
    не изменяя существующий контент. Добавь 1-2 предложения, развивающие идею. Используй markdown разметку`
};

const GIGACHAT_CONFIG = {
	AUTH_URL: "http://85.198.81.98:8081/api/v2/oauth",
	API_URL: "http://85.198.81.98:8082/api/v1/chat/completions",
};

interface IGigaNotesSettings {
	model: string;
	scope: string;
	authKey?: string,
}

const DEFAULT_SETTINGS: IGigaNotesSettings = {
	model: 'GigaChat',
	scope: 'GIGACHAT_API_PERS'
}

export default class GigaNotesPlugin extends Plugin {
	private gigaChat: GigaChat;
	settings: IGigaNotesSettings;

	async onload() {
		console.log('loading GigaNotes');

		await this.loadSettings();

		this.addSettingTab(new GigaNotesSettingTab(this.app, this));
		this.initGigaChat()
	}

	private initGigaChat() {
		if (!this.settings.authKey) {
			new Notice('Не указан ключ доступа');
			return
		}

		this.gigaChat = new GigaChat({
			model: this.settings.model,
			scope: this.settings.scope,
			authKey: this.settings.authKey,

			apiUrl: GIGACHAT_CONFIG.API_URL,
			authUrl: GIGACHAT_CONFIG.AUTH_URL,
		})

		this.addCommand({
			id: 'definition',
			name: 'Сгенерировать определение',
			editorCallback: (editor) => this.generateDefinition(editor),
		});

		this.addCommand({
			id: 'text-expand',
			name: 'Дополнить текст',
			editorCallback: (editor) => this.generateExpandedText(editor),
		});

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				const selection = editor.getSelection();

				if (!selection) return;

				menu.addItem((item) =>
					item.setTitle("Сгенерировать определение")
						.setIcon("book")
						.onClick(() => this.generateDefinition(editor))
				);
				menu.addItem((item) =>
					item.setTitle("Дополнить текст")
						.setIcon("pencil")
						.onClick(() => this.generateExpandedText(editor))
				);
			})
		);
	}

	private async generateDefinition(editor: Editor) {
		const selection = editor.getSelection();

		if (!selection) return;

		try {
			editor.replaceSelection(await this.generateContent(GENERATION_PROMPT[EGenerationType.DEFINITION], selection));
		} catch (error) {
			if (error instanceof Error) {
				new Notice(`Ошибка генерации ответа: ${error.message}`)
			} else {
				new Notice(`Ошибка генерации`)
			}
		}
	}

	private async generateExpandedText(editor: Editor) {
		const selection = editor.getSelection();

		if (!selection) return;

		try {
			editor.replaceSelection(await this.generateContent(GENERATION_PROMPT[EGenerationType.TEXT_EXPAND], selection));
		} catch (error) {
			if (error instanceof Error) {
				new Notice(`Ошибка генерации ответа: ${error.message}`)
			} else {
				new Notice(`Ошибка генерации`)
			}
		}
	}


	private async generateContent(prompt: string, text: string) {
		if (!this.gigaChat) {
			throw Error('Не инициализирован GigaChat. Попробуйте позже или перезагрузите Obsidian');
		}

		return this.gigaChat.getAnswer([{ role: "system", content: prompt }, { role: "user", content: text }])
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.initGigaChat();
	}
}