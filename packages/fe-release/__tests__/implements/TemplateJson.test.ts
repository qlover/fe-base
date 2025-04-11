import { expect, describe, test } from 'vitest';
import TemplateJson from '../../src/implments/TemplateJson';

describe('safeTemplate', () => {
  describe('Basic Functionality', () => {
    test('should correctly replace simple placeholders', () => {
      const template = 'Hello, {{name}}!';
      const context = { name: 'Jay' };
      expect(TemplateJson.format(template, context)).toBe('Hello, Jay!');
    });

    test('should handle multiple placeholders', () => {
      const template = '{{greeting}}, {{name}}!';
      const context = { greeting: 'Hello', name: 'Jay' };
      expect(new TemplateJson().format(template, context)).toBe('Hello, Jay!');
    });

    test('should replace non-existent placeholders with an empty string', () => {
      const template = 'Hello, {{name}}!';
      const context = {};
      const result = TemplateJson.format(template, context);
      expect(result).toBe('Hello, {{name}}!');
    });
  });

  describe('Nested Property Support', () => {
    test('should handle simple nested properties', () => {
      const template = '{{user.name}} age is {{user.age}}';
      const context = { user: { name: 'Jay', age: 25 } };
      expect(TemplateJson.format(template, context)).toBe('Jay age is 25');
    });

    test('should handle deeply nested properties', () => {
      const template =
        '{{user.profile.name}} works at {{user.profile.company.name}}';
      const context = {
        user: {
          profile: {
            name: 'Jay',
            company: {
              name: 'XX Tech Company'
            }
          }
        }
      };
      expect(TemplateJson.format(template, context)).toBe(
        'Jay works at XX Tech Company'
      );
    });

    test('should handle non-existent properties in nested paths', () => {
      const template = '{{user.profile.name}}';
      const context = { user: {} };
      const result = TemplateJson.format(template, context);
      expect(result).toBe('{{user.profile.name}}');
    });
  });

  describe('JSON Mode', () => {
    test('should correctly handle string values in JSON strings', () => {
      const template = '{"name": "{{user.name}}", "email": "{{user.email}}"}';
      const context = { user: { name: 'Jay', email: 'zhang@example.com' } };
      const result = TemplateJson.format(template, context) as string;

      expect(() => JSON.parse(result)).not.toThrow();
      expect(JSON.parse(result)).toEqual({
        name: 'Jay',
        email: 'zhang@example.com'
      });
    });

    test('should handle special characters in JSON strings', () => {
      const template = {
        name: '{{user.name}}',
        description: '{{user.description}}'
      };
      const context = {
        user: {
          name: 'Jay',
          description:
            'This is a text that contains "quotes" and \\backslashes and \nnewlines'
        }
      };
      const result = TemplateJson.format(template, context);

      expect(() => result).not.toThrow();
      expect(result).toEqual({
        name: context.user.name,
        description: context.user.description
      });
    });

    test('should handle numeric values in JSON strings', () => {
      const template = '{"name": "{{user.name}}", "age": {{user.age}}}';
      const context = { user: { name: 'Jay', age: 25 } };
      const result = TemplateJson.format(template, context) as string;

      expect(() => JSON.parse(result)).not.toThrow();
      expect(JSON.parse(result)).toEqual({
        name: 'Jay',
        age: 25
      });
    });

    test('should handle boolean values in JSON strings', () => {
      const template =
        '{"name": "{{user.name}}", "isActive": {{user.isActive}}}';
      const context = { user: { name: 'Jay', isActive: true } };
      const result = TemplateJson.format(template, context) as string;

      expect(() => JSON.parse(result)).not.toThrow();
      expect(JSON.parse(result)).toEqual({
        name: 'Jay',
        isActive: true
      });
    });

    test('should handle object values in JSON strings', () => {
      const template = '{"user": {{userInfo}}}';
      const context = {
        userInfo: { name: 'Jay', age: 25, hobbies: ['reading', 'traveling'] }
      };
      const result = TemplateJson.format(template, context) as string;

      expect(() => JSON.parse(result)).not.toThrow();
      expect(JSON.parse(result)).toEqual({
        user: {
          name: 'Jay',
          age: 25,
          hobbies: ['reading', 'traveling']
        }
      });
    });

    test('should handle array values in JSON strings', () => {
      const template = '{"name": "{{user.name}}", "hobbies": {{user.hobbies}}}';
      const context = {
        user: {
          name: 'Jay',
          hobbies: ['reading', 'traveling', 'coding']
        }
      };
      const result = TemplateJson.format(template, context) as string;

      expect(() => JSON.parse(result)).not.toThrow();
      expect(JSON.parse(result)).toEqual({
        name: 'Jay',
        hobbies: ['reading', 'traveling', 'coding']
      });
    });

    test('should handle email addresses containing @ symbols', () => {
      const template = '{"name": "{{user.name}}", "email": "{{user.email}}"}';
      const context = { user: { name: 'Jay', email: 'zhang@example.com' } };
      const result = TemplateJson.format(template, context) as string;

      expect(() => JSON.parse(result)).not.toThrow();
      expect(JSON.parse(result)).toEqual({
        name: 'Jay',
        email: 'zhang@example.com'
      });
    });
  });

  describe('Custom Placeholder', () => {
    test('should support custom placeholders', () => {
      const template = 'Hello, [[name]]!';
      const context = { name: 'Jay' };
      expect(
        TemplateJson.format(template, context, { open: '[[', close: ']]' })
      ).toBe('Hello, Jay!');
    });

    test('should support complex custom placeholders', () => {
      const template = 'Hello, ${name}!';
      const context = { name: 'Jay' };
      expect(
        TemplateJson.format(template, context, { open: '${', close: '}' })
      ).toBe('Hello, Jay!');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty string templates', () => {
      expect(TemplateJson.format('', { name: 'Jay' })).toBe('');
    });

    test('should handle empty context objects', () => {
      expect(TemplateJson.format('Hello, {{name}}!', {})).toBe(
        'Hello, {{name}}!'
      );
    });

    test('should handle templates with no placeholders', () => {
      const template = 'Hello, World!';
      const context = { name: 'Jay' };
      expect(TemplateJson.format(template, context)).toBe('Hello, World!');
    });

    test('should handle various types of primitive values', () => {
      const template = '{{str}}, {{num}}, {{bool}}, {{nil}}';
      const context = {
        str: 'string',
        num: 123,
        bool: true,
        nil: null
      };
      expect(TemplateJson.format(template, context)).toBe(
        'string, 123, true, null'
      );
    });
  });

  describe('Actual Use Cases', () => {
    test('should handle complex API response templates', () => {
      const template = `{
        "code": 0,
        "message": "success",
        "data": {
          "user": {
            "id": {{user.id}},
            "name": "{{user.name}}",
            "email": "{{user.email}}",
            "profile": {{user.profile}}
          }
        }
      }`;

      const context = {
        user: {
          id: 12345,
          name: 'Jay',
          email: 'zhang@example.com',
          profile: {
            age: 25,
            address: 'Beijing, China',
            hobbies: ['reading', 'traveling']
          }
        }
      };

      const result = TemplateJson.format(template, context) as string;
      expect(() => JSON.parse(result)).not.toThrow();

      const parsed = JSON.parse(result);
      expect(parsed.code).toBe(0);
      expect(parsed.message).toBe('success');
      expect(parsed.data.user.id).toBe(12345);
      expect(parsed.data.user.name).toBe('Jay');
      expect(parsed.data.user.email).toBe('zhang@example.com');
      expect(parsed.data.user.profile.age).toBe(25);
    });
  });

  describe('Additional Edge Cases', () => {
    test('should handle undefined values', () => {
      const template = '{{str}}, {{undef}}';
      const context = {
        str: 'string',
        undef: undefined
      };
      expect(TemplateJson.format(template, context)).toBe('string, {{undef}}');
    });

    test('should handle arrays in nested objects with dot notation', () => {
      const template = '{{user.hobbies.0}}, {{user.hobbies.1}}';
      const context = {
        user: {
          hobbies: ['reading', 'traveling']
        }
      };
      expect(TemplateJson.format(template, context)).toBe('reading, traveling');
    });

    test('should handle malformed placeholders without closing tag', () => {
      const template = 'Hello {{name, how are you?';
      const context = { name: 'Jay' };
      expect(TemplateJson.format(template, context)).toBe(
        'Hello {{name, how are you?'
      );
    });

    test('should handle custom placeholders with regex special characters', () => {
      const template = 'Hello, $*name*$!';
      const context = { name: 'Jay' };
      expect(
        TemplateJson.format(template, context, { open: '$*', close: '*$' })
      ).toBe('Hello, Jay!');
    });
  });

  describe('Input Type Handling', () => {
    test('should handle number input', () => {
      const input = 123;
      const context = { name: 'Jay' };
      expect(TemplateJson.format(input, context)).toBe(123);
    });

    test('should handle boolean input', () => {
      const input = true;
      const context = { name: 'Jay' };
      expect(TemplateJson.format(input, context)).toBe(true);
    });

    test('should handle deeply nested recursive objects', () => {
      const template = {
        level1: {
          level2: {
            level3: {
              value: '{{deep.path.value}}',
              array: ['{{deep.path.array.0}}', '{{deep.path.array.1}}']
            }
          }
        }
      };
      const context = {
        deep: {
          path: {
            value: 'nested value',
            array: ['item1', 'item2']
          }
        }
      };
      const result = TemplateJson.format(template, context);
      expect(result).toEqual({
        level1: {
          level2: {
            level3: {
              value: 'nested value',
              array: ['item1', 'item2']
            }
          }
        }
      });
    });
  });

  describe('Complex Placeholder Usage', () => {
    test('should handle placeholders in array indices', () => {
      const template = '{{user.hobbies.{{index}}}}';
      const context = {
        user: {
          hobbies: ['reading', 'traveling', 'coding']
        },
        index: 1
      };
      const result = TemplateJson.format(template, context);
      expect(result).toBe('{{user.hobbies.1}}');
      expect(TemplateJson.format(result, context)).toBe(
        context.user.hobbies[1]
      );
    });

    test('should handle JSON strings with escaped quotes and special characters', () => {
      const template = '{"message": "{{message}}"}';
      const context = {
        message: 'Line 1\nLine 2\t"Quoted text"'
      };
      const result = TemplateJson.format(template, context) as string;
      expect(JSON.parse(result)).toEqual({
        message: 'Line 1\nLine 2\t"Quoted text"'
      });
    });
  });
});
