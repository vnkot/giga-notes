import GigaNotesPlugin from "main";
import { PluginSettingTab, Setting } from "obsidian";

export class GigaNotesSettingTab extends PluginSettingTab {
	plugin: GigaNotesPlugin;

	constructor(app: App, plugin: GigaNotesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Модель GigaChat')
			.addText((text) =>
				text
					.setPlaceholder('Доступная модель GigaChat')
					.setValue(this.plugin.settings.model)
					.onChange(async (value) => {
						this.plugin.settings.model = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Scope')
			.addText((text) =>
				text
					.setValue(this.plugin.settings.scope)
					.onChange(async (value) => {
						this.plugin.settings.scope = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName('Ключ авторизации')
			.addText((text) =>
				text
					.setValue(this.plugin.settings.authKey || '')
					.onChange(async (value) => {
						this.plugin.settings.authKey = value;
						await this.plugin.saveSettings();
					})
			);
	}
}