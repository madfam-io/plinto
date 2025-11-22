/**
 * Test setup for Janua TypeScript SDK
 */

// Mock localStorage for Node.js test environment
Object.defineProperty(global, 'localStorage', {
  value: {
    storage: new Map(),
    getItem(key: string) {
      return this.storage.get(key) || null;
    },
    setItem(key: string, value: string) {
      this.storage.set(key, value);
    },
    removeItem(key: string) {
      this.storage.delete(key);
    },
    clear() {
      this.storage.clear();
    },
    get length() {
      return this.storage.size;
    },
    key(index: number) {
      const keys = Array.from(this.storage.keys());
      return keys[index] || null;
    }
  },
  writable: true
});

// Mock window object for browser-specific features
Object.defineProperty(global, 'window', {
  value: {
    localStorage: global.localStorage
  },
  writable: true
});

// Increase test timeout for integration tests
jest.setTimeout(30000);

// Global test configuration
beforeEach(() => {
  // Clear localStorage before each test
  global.localStorage.clear();
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});