import { cn } from './utils';

describe('utils', () => {
  it('should export cn function', () => {
    expect(cn).toBeDefined();
    expect(typeof cn).toBe('function');
  });

  describe('cn function', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
    });

    it('should handle Tailwind merge conflicts', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
    });

    it('should handle undefined and null values', () => {
      expect(cn('class1', undefined, null, 'class2')).toBe('class1 class2');
    });
  });
});
