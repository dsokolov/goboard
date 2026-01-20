import i18next from 'i18next';
import { App, moment } from 'obsidian';
import en from '../locales/en.json';
import ru from '../locales/ru.json';
import zh from '../locales/zh.json';

/**
 * Initialize i18n with Obsidian locale detection
 * Uses the same approach as Tasks plugin: moment.locale() with localStorage fallback
 */
export async function initI18n(_app: App): Promise<void> {
	// Detect language using the same approach as Tasks plugin
	// 1. Try moment.locale() from Obsidian (may be stuck at 'en' in some Obsidian versions)
	// 2. Fallback to localStorage.getItem('language') which is more reliable
	// 3. Final fallback to 'en'
	let locale = moment.locale();
	
	// Use localStorage as more reliable source (as recommended in Obsidian forums)
	// Note: Using window.localStorage directly as it's the standard way to detect language in Obsidian plugins
	// The 'language' key is a standard Obsidian setting, not plugin-specific
	if (!locale || locale === 'en') {
		const storedLanguage = window.localStorage.getItem('language');
		if (storedLanguage) {
			locale = storedLanguage;
		}
	}
	
	// Extract language code (e.g., 'ru' from 'ru-RU' or 'zh' from 'zh-CN')
	const languageCode = (locale || 'en').split('-')[0].toLowerCase();

	// Map locale codes to our supported languages
	const language = (languageCode === 'ru' || languageCode === 'zh') ? languageCode : 'en';

	await i18next.init({
		lng: language,
		fallbackLng: 'en',
		resources: {
			en: { translation: en as Record<string, unknown> },
			ru: { translation: ru as Record<string, unknown> },
			zh: { translation: zh as Record<string, unknown> },
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
