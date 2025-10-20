// Настройка для тестового окружения
import '@testing-library/jest-dom';

// Полифилл для XMLSerializer в Node.js окружении
if (typeof XMLSerializer === 'undefined') {
  global.XMLSerializer = class XMLSerializer {
    serializeToString(node: Node): string {
      if (node.nodeType === Node.DOCUMENT_NODE) {
        return this.serializeNode((node as Document).documentElement);
      }
      return this.serializeNode(node as Element);
    }
    
    private serializeNode(node: Element): string {
      // Безопасная сериализация без использования outerHTML
      const tagName = node.tagName.toLowerCase();
      let result = `<${tagName}`;
      
      // Добавляем атрибуты
      for (let i = 0; i < node.attributes.length; i++) {
        const attr = node.attributes[i];
        result += ` ${attr.name}="${this.escapeAttribute(attr.value)}"`;
      }
      
      result += '>';
      
      // Добавляем содержимое
      for (let i = 0; i < node.childNodes.length; i++) {
        const child = node.childNodes[i];
        if (child.nodeType === Node.TEXT_NODE) {
          result += this.escapeText(child.textContent || '');
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          result += this.serializeNode(child as Element);
        }
      }
      
      result += `</${tagName}>`;
      return result;
    }
    
    private escapeAttribute(value: string): string {
      return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    
    private escapeText(text: string): string {
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
  };
}
