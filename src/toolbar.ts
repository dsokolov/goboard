import { GoPluginSettings } from './data';

export class Toolbar {
	private settings: GoPluginSettings;
	private selectedStoneType: 'black' | 'white' | null = null;
	private onStoneTypeChange: ((stoneType: 'black' | 'white' | null) => void) | null = null;

	constructor(settings: GoPluginSettings) {
		this.settings = settings;
	}

	createToolbar(source: string, containerEl: HTMLElement): HTMLElement {
		return this.createToolbarElement(source, containerEl);
	}

	setStoneTypeChangeCallback(callback: (stoneType: 'black' | 'white' | null) => void) {
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
		blackButton.innerHTML = '●';
		blackButton.classList.add('go-board-stone-button', 'go-board-black-stone-button');
		blackButton.title = 'Чёрный камень';
		blackButton.addEventListener('click', () => {
			this.selectStoneType('black');
		});
		
		// Кнопка "Белый камень"
		const whiteButton = document.createElement('button');
		whiteButton.innerHTML = '●';
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
		if (this.onStoneTypeChange) {
			this.onStoneTypeChange(this.selectedStoneType);
		}
	}

	private updateButtonStates() {
		const toolbar = document.querySelector('.go-board-toolbar');
		if (!toolbar) return;
		
		const blackButton = toolbar.querySelector('.go-board-black-stone-button');
		const whiteButton = toolbar.querySelector('.go-board-white-stone-button');
		
		// Сбрасываем все активные состояния
		blackButton?.classList.remove('active');
		whiteButton?.classList.remove('active');
		
		// Активируем выбранную кнопку
		if (this.selectedStoneType === 'black') {
			blackButton?.classList.add('active');
		} else if (this.selectedStoneType === 'white') {
			whiteButton?.classList.add('active');
		}
	}

}
