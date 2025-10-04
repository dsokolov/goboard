import { App } from 'obsidian';
import { GoGame } from '../data';
import { GoGameParser } from '../parser';

export class FileService {
	private app: App;
	private parser: GoGameParser;

	constructor(app: App, parser: GoGameParser) {
		this.app = app;
		this.parser = parser;
	}

	/**
	 * Обновляет блок кода goboard в активном файле
	 */
	async updateCodeBlock(game: GoGame, originalSource: string): Promise<void> {
		try {
			const newContent = this.parser.generateCodeContent(game);
			const activeFile = this.app.workspace.getActiveFile();
			
			if (!activeFile) {
				console.warn('No active file to update');
				return;
			}
			
			const content = await this.app.vault.read(activeFile);
			const updatedContent = this.replaceGoboardBlock(content, newContent, originalSource);
			
			if (updatedContent !== content) {
				await this.app.vault.modify(activeFile, updatedContent);
			}
		} catch (error) {
			console.error('Error updating code block:', error);
			throw error;
		}
	}

	/**
	 * Заменяет блок кода goboard в содержимом файла
	 */
	replaceGoboardBlock(content: string, newContent: string, originalSource: string): string {
		// Экранируем специальные символы для регулярного выражения
		const escapedSource = originalSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const goboardRegex = new RegExp(`\`\`\`goboard\\n${escapedSource}\\n\`\`\``, 'g');
		const newCodeBlock = `\`\`\`goboard\n${newContent}\n\`\`\``;
		
		if (goboardRegex.test(content)) {
			return content.replace(goboardRegex, newCodeBlock);
		}
		
		return content;
	}
}
