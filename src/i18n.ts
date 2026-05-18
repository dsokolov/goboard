import i18next from 'i18next';
import { App, getLanguage } from 'obsidian';
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import zh from '../locales/zh.json';

/**
 * Initialize i18n with Obsidian locale detection
 */
export async function initI18n(_app: App): Promise<void> {
	const locale = getLanguage();

	// Extract language code (e.g., 'ru' from 'ru-RU' or 'zh' from 'zh-CN')
	const languageCode = locale.split('-')[0].toLowerCase();

	// Map locale codes to our supported languages
	const language = (languageCode === 'ru' || languageCode === 'zh') ? languageCode : 'en';

	await i18next.init({
		lng: language,
		fallbackLng: 'en',
		resources: {
			en: { translation: en },
			ru: { translation: ru },
			zh: { translation: zh },
		},
		interpolation: {
			escapeValue: false, // We handle escaping manually when needed
		},
	});
}

/**
 * Get translated string by key
 * @param key Translation key (supports dot notation, e.g., 'settings.defaultBoardSize.name')
 * @param options Optional interpolation options
 * @returns Translated string
 */
export function t(key: string, options?: Record<string, string | number>): string {
	return i18next.t(key, options);
}
