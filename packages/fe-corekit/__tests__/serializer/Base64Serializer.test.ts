import { Base64Serializer } from '../../src/serializer/Base64Serializer';

describe('Base64Serializer', () => {
  describe('Basic functionality', () => {
    it('should serialize and deserialize strings correctly', () => {
      const serializer = new Base64Serializer();
      const data = 'Hello World!';

      const encoded = serializer.serialize(data);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = serializer.deserialize(encoded);
      expect(decoded).toBe(data);
    });

    it('should handle UTF-8 characters correctly', () => {
      const serializer = new Base64Serializer();
      const data = 'Hello World! 你好世界！ 🌍🚀';

      const encoded = serializer.serialize(data);
      const decoded = serializer.deserialize(encoded);
      expect(decoded).toBe(data);
    });

    it('should handle empty strings', () => {
      const serializer = new Base64Serializer();

      const encoded = serializer.serialize('');
      expect(encoded).toBe('');

      const decoded = serializer.deserialize('');
      expect(decoded).toBe('');
    });

    it('should handle long strings', () => {
      const serializer = new Base64Serializer();
      const data = 'A'.repeat(10000) + '测试' + 'B'.repeat(5000);

      const encoded = serializer.serialize(data);
      const decoded = serializer.deserialize(encoded);
      expect(decoded).toBe(data);
    });
  });

  describe('URL-safe encoding', () => {
    it('should handle URL-safe encoding correctly', () => {
      const serializer = new Base64Serializer({ urlSafe: true });
      const data = 'Hello World!';

      const encoded = serializer.serialize(data);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');

      const decoded = serializer.deserialize(encoded);
      expect(decoded).toBe(data);
    });

    it('should handle strings that produce + and / in standard base64', () => {
      const serializer = new Base64Serializer({ urlSafe: true });
      // This string is known to produce + and / in standard base64
      const data = 'sure.';

      const encoded = serializer.serialize(data);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');

      const decoded = serializer.deserialize(encoded);
      expect(decoded).toBe(data);
    });

    it('should handle complex UTF-8 with URL-safe encoding', () => {
      const serializer = new Base64Serializer({ urlSafe: true });
      const data = '测试数据 + / = 特殊字符 🎉';

      const encoded = serializer.serialize(data);
      expect(encoded).not.toContain('+');
      expect(encoded).not.toContain('/');
      expect(encoded).not.toContain('=');

      const decoded = serializer.deserialize(encoded);
      expect(decoded).toBe(data);
    });
  });

  describe('Error handling', () => {
    it('should return default value for invalid base64', () => {
      const serializer = new Base64Serializer();
      const defaultValue = 'default';

      const result = serializer.deserialize('invalid base64!', defaultValue);
      expect(result).toBe(defaultValue);
    });

    it('should return empty string for invalid base64 without default', () => {
      const serializer = new Base64Serializer();

      const result = serializer.deserialize('invalid base64!');
      expect(result).toBe('');
    });

    it('should handle non-string input gracefully', () => {
      const serializer = new Base64Serializer();
      const defaultValue = 'default';

      // @ts-expect-error Testing runtime behavior
      const result = serializer.deserialize(123, defaultValue);
      expect(result).toBe(defaultValue);
    });

    it('should handle null and undefined inputs', () => {
      const serializer = new Base64Serializer();

      // @ts-expect-error Testing runtime behavior
      expect(serializer.deserialize(null)).toBe('');
      // @ts-expect-error Testing runtime behavior
      expect(serializer.deserialize(undefined)).toBe('');
    });

    it('should return empty string on serialization error', () => {
      const serializer = new Base64Serializer();

      // Mock TextEncoder to throw error in browser environment
      const originalTextEncoder = global.TextEncoder;
      global.TextEncoder = class {
        public encode(): Uint8Array {
          throw new Error('Mock error');
        }
      } as typeof TextEncoder;

      // Mock process to simulate browser environment
      const originalProcess = global.process;
      // @ts-expect-error Testing runtime behavior
      delete global.process;

      const result = serializer.serialize('test');
      expect(result).toBe('');

      // Restore mocks
      global.TextEncoder = originalTextEncoder;
      global.process = originalProcess;
    });
  });

  describe('Edge cases', () => {
    it('should handle strings with special characters', () => {
      const serializer = new Base64Serializer();
      const data = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      const encoded = serializer.serialize(data);
      const decoded = serializer.deserialize(encoded);
      expect(decoded).toBe(data);
    });

    it('should handle newlines and whitespace', () => {
      const serializer = new Base64Serializer();
      const data = 'Line 1\nLine 2\r\nLine 3\t\tTabbed';

      const encoded = serializer.serialize(data);
      const decoded = serializer.deserialize(encoded);
      expect(decoded).toBe(data);
    });

    it('should validate base64 format correctly', () => {
      const serializer = new Base64Serializer();

      // Valid base64 strings (using correct encodings)
      expect(serializer.deserialize('SGVsbG8=')).toBe('Hello');
      expect(serializer.deserialize('SGVsbG8gV29ybGQ=')).toBe('Hello World');
      expect(serializer.deserialize('VGVzdA==')).toBe('Test');

      // Invalid base64 strings
      expect(serializer.deserialize('SGVsbG8')).toBe(''); // Invalid padding
      expect(serializer.deserialize('Invalid!')).toBe('');
      expect(serializer.deserialize('SGVsb*8=')).toBe('');
    });
  });

  describe('Cross-platform compatibility', () => {
    it('should produce consistent results regardless of environment', () => {
      const serializer = new Base64Serializer();
      const data = 'Cross-platform test 跨平台测试 🌐';

      const encoded = serializer.serialize(data);

      // The encoded result should be valid base64
      expect(encoded).toMatch(/^[A-Za-z0-9+/]*=*$/);

      const decoded = serializer.deserialize(encoded);
      expect(decoded).toBe(data);
    });

    it('should handle URL-safe encoding consistently', () => {
      const standardSerializer = new Base64Serializer({ urlSafe: false });
      const urlSafeSerializer = new Base64Serializer({ urlSafe: true });
      const data = 'URL-safe test data with + and / characters';

      const standardEncoded = standardSerializer.serialize(data);
      const urlSafeEncoded = urlSafeSerializer.serialize(data);

      // URL-safe should not contain +, /, or =
      expect(urlSafeEncoded).not.toContain('+');
      expect(urlSafeEncoded).not.toContain('/');
      expect(urlSafeEncoded).not.toContain('=');

      // Both should decode to the same original data
      expect(standardSerializer.deserialize(standardEncoded)).toBe(data);
      expect(urlSafeSerializer.deserialize(urlSafeEncoded)).toBe(data);
    });
  });

  describe('Performance and large data', () => {
    it('should handle reasonably large strings efficiently', () => {
      const serializer = new Base64Serializer();
      const largeData = 'A'.repeat(100000);

      const startTime = Date.now();
      const encoded = serializer.serialize(largeData);
      const decoded = serializer.deserialize(encoded);
      const endTime = Date.now();

      expect(decoded).toBe(largeData);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle binary-like data correctly', () => {
      const serializer = new Base64Serializer();
      // Create string with characters that might cause encoding issues
      const binaryLikeData = Array.from({ length: 256 }, (_, i) =>
        String.fromCharCode(i % 256)
      ).join('');

      const encoded = serializer.serialize(binaryLikeData);
      const decoded = serializer.deserialize(encoded);
      expect(decoded).toBe(binaryLikeData);
    });
  });

  describe('Regression tests', () => {
    it('should maintain backward compatibility with existing encoded data', () => {
      const serializer = new Base64Serializer();

      // Known base64 encoded strings that should decode correctly
      const testCases = [
        { encoded: 'SGVsbG8gV29ybGQ=', expected: 'Hello World' },
        { encoded: 'VGVzdA==', expected: 'Test' },
        { encoded: 'YWJjZGVmZ2hpams=', expected: 'abcdefghijk' }
      ];

      testCases.forEach(({ encoded, expected }) => {
        expect(serializer.deserialize(encoded)).toBe(expected);
      });
    });

    it('should handle mixed encoding correctly', () => {
      const standardSerializer = new Base64Serializer({ urlSafe: false });
      const urlSafeSerializer = new Base64Serializer({ urlSafe: true });
      const data = 'Mixed encoding test';

      const standardEncoded = standardSerializer.serialize(data);
      const urlSafeEncoded = urlSafeSerializer.serialize(data);

      // Each serializer should be able to decode its own encoding
      expect(standardSerializer.deserialize(standardEncoded)).toBe(data);
      expect(urlSafeSerializer.deserialize(urlSafeEncoded)).toBe(data);
    });
  });
});
