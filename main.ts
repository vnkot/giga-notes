import { GigaChat } from 'entities/gigachat';
import { GigaNotesSettingTab } from 'GigaNotesSettingTab';
import { Editor, Notice, Plugin } from 'obsidian';

enum EGigaNotesStatus {
	READY_TO_WORK,
	NOT_AUTHORIZED,
	IN_PROGRESS
}

enum EGenerationType {
	DEFINITION,
	TEXT_EXPAND,
	CUSTOM_REQUEST,
}

const GENERATION_PROMPT: Record<EGenerationType, string> = {
	[EGenerationType.DEFINITION]:
		`Сгенерируй ёмкое, но компактное определение. Формат: "Термин - это [сущность], которая...". 
    Укажи 2-3 ключевые характеристики. Будь лаконичен (1-2 предложения). Используй markdown разметку`,

	[EGenerationType.TEXT_EXPAND]:
		`Дополни текст, сохраняя оригинальный стиль и контекст. Плавно продолжи мысль, 
    не изменяя существующий контент. Добавь 1-2 предложения, развивающие идею. Используй markdown разметку`,
	[EGenerationType.CUSTOM_REQUEST]: "Коротко ответь на следующее сообщение. Ты помощник для написания заметок в obsidian",
};

const GIGA_NOTES_STATUS_TEXT: Record<EGigaNotesStatus, string> = {
	[EGigaNotesStatus.READY_TO_WORK]:
		`GigaNotes готов к работе`,
	[EGigaNotesStatus.NOT_AUTHORIZED]:
		`GigaNotes не авторизован`,
	[EGigaNotesStatus.IN_PROGRESS]:
		`GigaNotes выполняет запрос`
}

const STATUS_ICONS: Record<EGigaNotesStatus, string> = {
	[EGigaNotesStatus.READY_TO_WORK]: "✅",
	[EGigaNotesStatus.NOT_AUTHORIZED]: "🔑",
	[EGigaNotesStatus.IN_PROGRESS]: "⏳"
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
	private statusBarItem: HTMLElement;

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
			this.changeStatusBarStatus(EGigaNotesStatus.NOT_AUTHORIZED);
			return
		}

		this.gigaChat = new GigaChat({
			model: this.settings.model,
			scope: this.settings.scope,
			authKey: this.settings.authKey,

			apiUrl: GIGACHAT_CONFIG.API_URL,
			authUrl: GIGACHAT_CONFIG.AUTH_URL,
		})

		this.changeStatusBarStatus(EGigaNotesStatus.READY_TO_WORK);

		this.addCommand({
			id: 'definition',
			name: 'Сгенерировать определение',
			editorCallback: async (editor) => {
				this.changeStatusBarStatus(EGigaNotesStatus.IN_PROGRESS)
				await this.generateDefinition(editor)
				this.changeStatusBarStatus(EGigaNotesStatus.READY_TO_WORK)
			},
		});

		this.addCommand({
			id: 'text-expand',
			name: 'Дополнить текст',
			editorCallback: async (editor) => {
				this.changeStatusBarStatus(EGigaNotesStatus.IN_PROGRESS)
				await this.generateExpandedText(editor)
				this.changeStatusBarStatus(EGigaNotesStatus.READY_TO_WORK)
			},
		});

		this.addCommand({
			id: 'custom-request',
			name: 'Получить ответ',
			editorCallback: async (editor) => {
				this.changeStatusBarStatus(EGigaNotesStatus.IN_PROGRESS)
				await this.generateAnswer(editor)
				this.changeStatusBarStatus(EGigaNotesStatus.READY_TO_WORK)
			},
		});

		this.registerEvent(
			this.app.workspace.on("editor-menu", (menu, editor, view) => {
				const selection = editor.getSelection();

				if (!selection) return;

				menu.addItem((item) =>
					item.setTitle("Сгенерировать определение")
						.setIcon("book")
						.onClick(async () => {
							this.changeStatusBarStatus(EGigaNotesStatus.IN_PROGRESS)
							await this.generateDefinition(editor)
							this.changeStatusBarStatus(EGigaNotesStatus.READY_TO_WORK)
						})
				);

				menu.addItem((item) =>
					item.setTitle("Дополнить текст")
						.setIcon("pencil")
						.onClick(async () => {
							this.changeStatusBarStatus(EGigaNotesStatus.IN_PROGRESS)
							await this.generateExpandedText(editor)
							this.changeStatusBarStatus(EGigaNotesStatus.READY_TO_WORK)
						})
				);

				menu.addItem((item) =>
					item.setTitle("Получить ответ")
						.setIcon("pencil")
						.onClick(async () => {
							this.changeStatusBarStatus(EGigaNotesStatus.IN_PROGRESS)
							await this.generateAnswer(editor)
							this.changeStatusBarStatus(EGigaNotesStatus.READY_TO_WORK)
						})
				);
			})
		);

	}

	private changeStatusBarStatus(status: EGigaNotesStatus) {
		if (!this.statusBarItem) {
			this.statusBarItem = this.addStatusBarItem();
		}

		const statusText = `${STATUS_ICONS[status]} ${GIGA_NOTES_STATUS_TEXT[status]}`;
		this.statusBarItem.setText(statusText);
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

	private async generateAnswer(editor: Editor) {
		const selection = editor.getSelection();

		if (!selection) return;

		try {
			editor.replaceSelection(await this.generateContent(GENERATION_PROMPT[EGenerationType.CUSTOM_REQUEST], selection));
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