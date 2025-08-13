import { UUIDHelper } from "helpers/uuid";
import { requestUrl } from "obsidian";

export interface IGigaChatConfig {
	model: string;
	scope: string;
	apiUrl: string;
	authUrl: string;
	authKey: string;
}

export class GigaChat {
	model: string;
	scope: string;
	apiUrl: string;
	authUrl: string;
	authKey: string;
	accessToken: string;

	constructor({ model, apiUrl, authUrl, authKey, scope }: IGigaChatConfig) {
		this.model = model;
		this.scope = scope;
		this.apiUrl = apiUrl;
		this.authUrl = authUrl;
		this.authKey = authKey;
	}

	private async getAccessToken(): Promise<string> {
		try {
			const rqUID = UUIDHelper.generate();

			const response = await requestUrl({
				url: this.authUrl,
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Accept': 'application/json',
					'Authorization': `Basic ${this.authKey}`,
					'RqUID': rqUID
				},
				body: `scope=${this.scope}`
			});

			return response.json.access_token
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Ошибка получения токена: ${error.message}`);
			} else {
				throw new Error('Неизвестная ошибка');
			}
		}
	}

	public async getAnswer(messages: { role: string, content: string }[]): Promise<string> {
		try {
			const token = this.accessToken || await this.getAccessToken();

			this.accessToken = token;

			const response = await requestUrl({
				url: this.apiUrl,
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ model: this.model, messages: messages })
			});

			return response.json.choices[0]?.message?.content || '';
		} catch (error) {
			if (error instanceof Error) {
				throw new Error(`Ошибка генерации ответа: ${error.message}`);
			} else {
				throw new Error('Неизвестная ошибка');
			}
		}
	}
}