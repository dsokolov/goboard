// Настройка для тестового окружения
import '@testing-library/jest-dom';

// Полифилл для XMLSerializer в Node.js окружении
if (typeof XMLSerializer === 'undefined') {
  global.XMLSerializer = class XMLSerializer {
    serializeToString(node: Node): string {
      if (node.nodeType === Node.DOCUMENT_NODE) {
        return (node as Document).documentElement.outerHTML;
      }
      return (node as Element).outerHTML;
    }
  };
}
