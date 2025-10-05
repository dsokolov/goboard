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

  /**
   * Загружает все файлы из папки data
   * @returns Объект с именами файлов как ключами и содержимым как значениями
   */
  loadAllTestData(): Record<string, string> {
    const testData: Record<string, string> = {};
    
    try {
      const files = fs.readdirSync(this.dataDir);
      
      for (const file of files) {
        if (file.endsWith('.txt')) {
          const content = this.loadTestData(file);
          const key = file.replace('.txt', '');
          testData[key] = content;
        }
      }
      
      return testData;
    } catch (error) {
      throw new Error(`Failed to load test data from directory ${this.dataDir}: ${error}`);
    }
  }

  /**
   * Проверяет существование файла с тестовыми данными
   * @param filename Имя файла
   * @returns true если файл существует
   */
  hasTestData(filename: string): boolean {
    const filePath = path.join(this.dataDir, filename);
    return fs.existsSync(filePath);
  }
}

// Создаем экземпляр по умолчанию для удобства
export const testDataLoader = new TestDataLoader();
