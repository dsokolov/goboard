/**
 * Утилиты для работы с темами в Obsidian
 */

export interface ThemeColors {
	textNormal: string;
	textMuted: string;
	textFaint: string;
	backgroundPrimary: string;
	backgroundSecondary: string;
	interactiveAccent: string;
	textAccent: string;
}

/**
 * Определяет, является ли текущая тема тёмной
 * @param containerEl - контейнер для анализа стилей
 * @returns true если тема тёмная, false если светлая
 */
export function isDarkTheme(containerEl: HTMLElement): boolean {
	// Стандартный способ определения темы в Obsidian
	// Проверяем наличие класса theme-dark на body элементе
	const body = document.body;
	if (body.classList.contains('theme-dark')) {
		return true;
	}
	
	// Дополнительная проверка для совместимости со старыми версиями
	if (body.classList.contains('obsidian-theme-dark') || 
		document.documentElement.classList.contains('theme-dark')) {
		return true;
	}
	
	// Fallback: анализ яркости фона (для случаев, когда классы не установлены)
	const computedStyle = getComputedStyle(containerEl);
	const backgroundColor = computedStyle.getPropertyValue('--background-primary');
	
	if (backgroundColor) {
		const rgb = backgroundColor.match(/\d+/g);
		if (rgb && rgb.length >= 3) {
			const r = parseInt(rgb[0]);
			const g = parseInt(rgb[1]);
			const b = parseInt(rgb[2]);
			// Если средняя яркость меньше 128, считаем тему тёмной
			return (r + g + b) / 3 < 128;
		}
	}
	
	// По умолчанию считаем светлой темой
	return false;
}

/**
 * Извлекает цвета темы из CSS-переменных
 * @param containerEl - контейнер для анализа стилей
 * @returns объект с цветами темы
 */
export function getThemeColors(containerEl: HTMLElement): ThemeColors {
	// Пробуем получить стили из разных источников
	const docStyle = getComputedStyle(document.documentElement);
	const bodyStyle = getComputedStyle(document.body);
	const containerStyle = getComputedStyle(containerEl);
	
	// Функция для получения значения с fallback
	const getColor = (varName: string): string => {
		// Пробуем разные источники
		let value = docStyle.getPropertyValue(varName).trim();
		if (!value) value = bodyStyle.getPropertyValue(varName).trim();
		if (!value) value = containerStyle.getPropertyValue(varName).trim();
		return value;
	};
	
	const themeColors = {
		textNormal: getColor('--text-normal') || '#000000',
		textMuted: getColor('--text-muted') || '#666666',
		textFaint: getColor('--text-faint') || '#999999',
		backgroundPrimary: getColor('--background-primary') || '#ffffff',
		backgroundSecondary: getColor('--background-secondary') || '#f8f8f8',
		interactiveAccent: getColor('--interactive-accent') || '#007acc',
		textAccent: getColor('--text-accent') || '#007acc'
	};
	
	return themeColors;
}

/**
 * Создает слушатель изменений темы
 * @param callback - функция, вызываемая при изменении темы
 * @returns объект с методами для управления слушателем
 */
export function createThemeChangeListener(callback: () => void) {
	// Слушаем изменения в DOM, которые могут указывать на смену темы
	const observer = new MutationObserver((mutations) => {
		let themeChanged = false;
		
		for (const mutation of mutations) {
			if (mutation.type === 'attributes' && 
				(mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
				themeChanged = true;
				break;
			}
		}
		
		if (themeChanged) {
			callback();
		}
	});

	// Наблюдаем за изменениями в body и html элементах
	observer.observe(document.body, { 
		attributes: true, 
		attributeFilter: ['class', 'data-theme'] 
	});
	observer.observe(document.documentElement, { 
		attributes: true, 
		attributeFilter: ['class', 'data-theme'] 
	});

	// Также слушаем события изменения темы, если они есть
	const themeChangeHandler = () => callback();
	document.addEventListener('theme-change', themeChangeHandler);

	// Возвращаем объект для управления слушателем
	return {
		disconnect: () => {
			observer.disconnect();
			document.removeEventListener('theme-change', themeChangeHandler);
		}
	};
}
