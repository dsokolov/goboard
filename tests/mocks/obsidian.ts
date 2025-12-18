// Мок для obsidian модуля
export class App {
	version?: string;
}

export class Plugin {
	app: App;
	manifest: { version: string };
	
	constructor() {
		this.app = new App();
		this.manifest = { version: '0.0.0' };
	}
}

export class PluginSettingTab {
	app: App;
	plugin: Plugin;
	containerEl: HTMLElement;
	
	constructor(app: App, plugin: Plugin) {
		this.app = app;
		this.plugin = plugin;
		this.containerEl = document.createElement('div');
	}
}

export class Setting {
	controlEl: HTMLElement;
	
	constructor(containerEl: HTMLElement) {
		this.controlEl = document.createElement('div');
	}
	
	setName(name: string): this {
		return this;
	}
	
	setDesc(desc: string): this {
		return this;
	}
	
	setHeading(): this {
		return this;
	}
	
	addDropdown(callback: (dropdown: any) => void): this {
		return this;
	}
	
	addToggle(callback: (toggle: any) => void): this {
		return this;
	}
}

