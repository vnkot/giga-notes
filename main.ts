import { GigaChat } from 'api/gigachat';
import { DEFAULT_SETTINGS, PROXY_CONFIG } from 'config';
import { GIGA_NOTES_STATUS_TEXT, GIGA_NOTES_STAUS_ICON } from 'const';
import { GigaNotesSettingTab } from 'GigaNotesSettingTab';
import { Editor, Notice, Plugin } from 'obsidian';
import { EGenerationType, EGigaNotesStatus, IGigaNotesSettings } from 'types';

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

			apiUrl: PROXY_CONFIG.API_URL,
			authUrl: PROXY_CONFIG.AUTH_URL,
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

		const statusText = `${GIGA_NOTES_STAUS_ICON[status]} ${GIGA_NOTES_STATUS_TEXT[status]}`;
		this.statusBarItem.setText(statusText);
	}

	private async generateDefinition(editor: Editor) {
		const selection = editor.getSelection();

		if (!selection) return;

		try {
			editor.replaceSelection(await this.generateContent(this.settings.definitionPrompt, selection));
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
			editor.replaceSelection(await this.generateContent(this.settings.textExpandPrompt, selection));
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
			editor.replaceSelection(await this.generateContent(this.settings.customRequestPrompt, selection));
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