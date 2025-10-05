import * as fs from 'fs';
import * as path from 'path';

export class TestDataLoader {
  private dataDir: string;

  constructor(dataDir: string = path.join(__dirname, 'data')) {
    this.dataDir = dataDir;
  }

  /**
   * Загружает содержимое файла с тестовыми данными
   * @param filename Имя файла в папке data
   * @returns Содержимое файла как строка
   */
  loadTestData(filename: string): string {
    const filePath = path.join(this.dataDir, filename);
    
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to load test data from ${filePath}: ${error}`);
    }
  }
}

// Создаем экземпляр по умолчанию для удобства
export const testDataLoader = new TestDataLoader();
