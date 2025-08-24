import GigaNotesPlugin from "main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class GigaNotesSettingTab extends PluginSettingTab {
	plugin: GigaNotesPlugin;

	constructor(app: App, plugin: GigaNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		// Настройки GigaChat
		new Setting(containerEl).setName("GigaChat").setHeading();
		new Setting(containerEl).setName("Модель GigaChat").addText((text) =>
			text
				.setPlaceholder("Доступная модель GigaChat")
				.setValue(this.plugin.settings.model)
				.onChange(async (value) => {
					this.plugin.settings.model = value;
					await this.plugin.saveSettings();
				})
		);
		new Setting(containerEl).setName("Scope").addText((text) =>
			text
				.setValue(this.plugin.settings.scope)
				.onChange(async (value) => {
					this.plugin.settings.scope = value;
					await this.plugin.saveSettings();
				})
		);
		new Setting(containerEl)
			.setName("Ключ авторизации")
			.addTextArea((text) =>
				text
					.setValue(this.plugin.settings.authKey || "")
					.onChange(async (value) => {
						this.plugin.settings.authKey = value;
						await this.plugin.saveSettings();
					})
			);

		// Настройки генерации
		new Setting(containerEl).setName("Настройки генерации").setHeading();
		new Setting(containerEl)
			.setName("Промпт для генерации определения")
			.addTextArea((text) =>
				text
					.setValue(this.plugin.settings.definitionPrompt)
					.onChange(async (value) => {
						this.plugin.settings.definitionPrompt = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Промпт для генерации продления текста")
			.addTextArea((text) =>
				text
					.setValue(this.plugin.settings.textExpandPrompt)
					.onChange(async (value) => {
						this.plugin.settings.textExpandPrompt = value;
						await this.plugin.saveSettings();
					})
			);
		new Setting(containerEl)
			.setName("Промпт для получения ответа на кастомный запрос")
			.addTextArea((text) =>
				text
					.setValue(this.plugin.settings.customRequestPrompt)
					.onChange(async (value) => {
						this.plugin.settings.customRequestPrompt = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
