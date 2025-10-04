import { GoPluginSettings } from './data';
import { isDarkTheme } from './theme';

export class Toolbar {
	private settings: GoPluginSettings;
	private selectedStoneType: 'black' | 'white' | null = null;
	private onStoneTypeChange: ((stoneType: 'black' | 'white' | null, container: HTMLElement) => void) | null = null;
	private currentContainer: HTMLElement | null = null;

	constructor(settings: GoPluginSettings) {
		this.settings = settings;
	}

	createToolbar(source: string, containerEl: HTMLElement): HTMLElement {
		this.currentContainer = containerEl;
		return this.createToolbarElement(source, containerEl);
	}

	setStoneTypeChangeCallback(callback: (stoneType: 'black' | 'white' | null, container: HTMLElement) => void) {
		this.onStoneTypeChange = callback;
	}

	getSelectedStoneType(): 'black' | 'white' | null {
		return this.selectedStoneType;
	}

	private createToolbarElement(source: string, containerEl: HTMLElement): HTMLElement {
		const toolbar = document.createElement('div');
		toolbar.classList.add('go-board-toolbar');
		
		// Кнопка "Чёрный камень"
		const blackButton = document.createElement('button');
		blackButton.innerHTML = this.createStoneSVG('black', containerEl, false);
		blackButton.classList.add('go-board-stone-button', 'go-board-black-stone-button');
		blackButton.title = 'Чёрный камень';
		blackButton.addEventListener('click', () => {
			this.selectStoneType('black');
		});
		
		// Кнопка "Белый камень"
		const whiteButton = document.createElement('button');
		whiteButton.innerHTML = this.createStoneSVG('white', containerEl, false);
		whiteButton.classList.add('go-board-stone-button', 'go-board-white-stone-button');
		whiteButton.title = 'Белый камень';
		whiteButton.addEventListener('click', () => {
			this.selectStoneType('white');
		});
		
		toolbar.appendChild(blackButton);
		toolbar.appendChild(whiteButton);
		return toolbar;
	}

	private selectStoneType(stoneType: 'black' | 'white') {
		// Если та же кнопка нажата, отменяем выбор
		if (this.selectedStoneType === stoneType) {
			this.selectedStoneType = null;
		} else {
			this.selectedStoneType = stoneType;
		}
		
		// Обновляем визуальное состояние кнопок
		this.updateButtonStates();
		
		// Уведомляем о изменении
		if (this.onStoneTypeChange && this.currentContainer) {
			this.onStoneTypeChange(this.selectedStoneType, this.currentContainer);
		}
	}

	private updateButtonStates() {
		if (!this.currentContainer) return;
		
		const toolbar = this.currentContainer.querySelector('.go-board-toolbar');
		if (!toolbar) return;
		
		const blackButton = toolbar.querySelector('.go-board-black-stone-button');
		const whiteButton = toolbar.querySelector('.go-board-white-stone-button');
		
		// Сбрасываем все состояния
		blackButton?.classList.remove('active', 'inactive');
		whiteButton?.classList.remove('active', 'inactive');
		
		// Активируем выбранную кнопку и обновляем SVG
		if (this.selectedStoneType === 'black') {
			blackButton?.classList.add('active');
			whiteButton?.classList.add('inactive');
			blackButton!.innerHTML = this.createStoneSVG('black', this.currentContainer, true);
			whiteButton!.innerHTML = this.createStoneSVG('white', this.currentContainer, false);
		} else if (this.selectedStoneType === 'white') {
			whiteButton?.classList.add('active');
			blackButton?.classList.add('inactive');
			whiteButton!.innerHTML = this.createStoneSVG('white', this.currentContainer, true);
			blackButton!.innerHTML = this.createStoneSVG('black', this.currentContainer, false);
		} else {
			// Обе кнопки неактивны
			blackButton?.classList.add('inactive');
			whiteButton?.classList.add('inactive');
			blackButton!.innerHTML = this.createStoneSVG('black', this.currentContainer, false);
			whiteButton!.innerHTML = this.createStoneSVG('white', this.currentContainer, false);
		}
	}

	/**
	 * Создает SVG камень для кнопки
	 */
	private createStoneSVG(stoneColor: 'black' | 'white', containerEl: HTMLElement, isActive: boolean = false): string {
		const isDark = isDarkTheme(containerEl);
		
		let fill: string;
		let stroke: string;
		
		// Для неактивных кнопок используем правильные цвета камней
		if (!isActive) {
			if (this.settings.useThemeColors) {
				// Для неактивных кнопок используем правильные цвета камней, но с приглушенной обводкой
				fill = stoneColor === 'black' ? 
					(isDark ? 'var(--background-primary)' : 'var(--text-normal)') : 
					(isDark ? 'var(--text-normal)' : 'var(--background-primary)');
				stroke = 'var(--text-muted, #999999)';
			} else {
				fill = stoneColor === 'black' ? this.settings.blackStoneColor : this.settings.whiteStoneColor;
				stroke = '#999999';
			}
		} else {
			if (this.settings.useThemeColors) {
				fill = stoneColor === 'black' ? 
					(isDark ? 'var(--background-primary)' : 'var(--text-normal)') : 
					(isDark ? 'var(--text-normal)' : 'var(--background-primary)');
				stroke = 'var(--text-muted)';
			} else {
				fill = stoneColor === 'black' ? 
					this.settings.blackStoneColor : this.settings.whiteStoneColor;
				stroke = this.settings.lineColor;
			}
		}
		
		// Создаем SVG камень размером подходящим для кнопки
		const size = 20; // размер камня в пикселях (уменьшен для меньших кнопок)
		const radius = size / 2;
		
		return `
			<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
				<circle cx="${radius}" cy="${radius}" r="${radius - 1}" 
					fill="${fill}" 
					stroke="${stroke}" 
					stroke-width="1"/>
			</svg>
		`;
	}

}
