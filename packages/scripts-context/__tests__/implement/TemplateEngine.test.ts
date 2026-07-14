import { describe, expect, it } from 'vitest';
import { TemplateEngine, interpolatePreset } from '@qlover/scripts-context';

describe('TemplateEngine', () => {
  describe('basic substitution', () => {
    it('should replace simple variables with data values', () => {
      const engine = new TemplateEngine();
      const data = { user: { name: 'Alice' } };
      const result = engine.render('Hello ${user.name}!', data);
      expect(result).toBe('Hello Alice!');
    });

    it('should handle multiple variables', () => {
      const engine = new TemplateEngine();
      const data = { user: { name: 'Bob', age: 30 } };
      const result = engine.render(
        '${user.name} is ${user.age} years old.',
        data
      );
      expect(result).toBe('Bob is 30 years old.');
    });

    it('should handle whitespace in placeholders', () => {
      const engine = new TemplateEngine();
      const data = { value: 42 };
      const result = engine.render('Value: ${  value  }', data);
      expect(result).toBe('Value: 42');
    });

    it('should preserve falsy values except null and undefined', () => {
      const engine = new TemplateEngine();
      const data = { zero: 0, empty: '', no: false };
      const result = engine.render(
        'zero=${zero}, empty=${empty}, no=${no}',
        data
      );
      expect(result).toBe('zero=0, empty=, no=false');
    });
  });

  describe('path access', () => {
    it('should support deep nested paths', () => {
      const engine = new TemplateEngine();
      const data = { a: { b: { c: { d: 'deep' } } } };
      const result = engine.render('${a.b.c.d}', data);
      expect(result).toBe('deep');
    });

    it('should support array indices via [index] notation', () => {
      const engine = new TemplateEngine();
      const data = { items: [{ name: 'apple' }, { name: 'banana' }] };
      const result = engine.render(
        'First: ${items[0].name}, Second: ${items[1].name}',
        data
      );
      expect(result).toBe('First: apple, Second: banana');
    });

    it('should support mixed array and object paths', () => {
      const engine = new TemplateEngine();
      const data = { users: [{ profile: { age: 25 } }] };
      const result = engine.render('${users[0].profile.age}', data);
      expect(result).toBe('25');
    });

    it('should treat invalid path segments as missing values', () => {
      const engine = new TemplateEngine({ defaultValue: 'missing' });
      const result = engine.render('${user..name}', { user: { name: 'x' } });
      expect(result).toBe('missing');
    });
  });

  describe('custom interpolate regex', () => {
    it('should use ES6 syntax by default', () => {
      const engine = new TemplateEngine();
      const data = { user: { name: 'Charlie' } };
      const result = engine.render('Hello ${user.name}!', data);
      expect(result).toBe('Hello Charlie!');
    });

    it('should work with Lodash style <%= %> via preset', () => {
      const engine = new TemplateEngine({
        interpolate: interpolatePreset.LODASH
      });
      const data = { user: { name: 'Charlie' } };
      const result = engine.render('Hello <%= user.name %>!', data);
      expect(result).toBe('Hello Charlie!');
    });

    it('should work with Mustache style {{ }} via preset', () => {
      const engine = new TemplateEngine({
        interpolate: interpolatePreset.MUSTACHE
      });
      const data = { user: { name: 'Diana' } };
      const result = engine.render('Hello {{ user.name }}!', data);
      expect(result).toBe('Hello Diana!');
    });

    it('should work with custom regex', () => {
      const engine = new TemplateEngine({ interpolate: /\[%([\s\S]+?)%\]/g });
      const data = { value: 99 };
      const result = engine.render('Value: [% value %]', data);
      expect(result).toBe('Value: 99');
    });

    it('should not be affected by shared preset regex lastIndex', () => {
      interpolatePreset.ES6.lastIndex = 5;

      const engine = new TemplateEngine();
      const result = engine.render('${a}-${b}', { a: 1, b: 2 });

      expect(result).toBe('1-2');
      interpolatePreset.ES6.lastIndex = 0;
    });
  });

  describe('variable prefix', () => {
    it('should enforce variable prefix semantics', () => {
      const engine = new TemplateEngine({ variable: 'ctx' });
      const data = { user: { name: 'Eve' } };
      const result = engine.render('Hello ${ctx.user.name}', data);
      expect(result).toBe('Hello Eve');
    });

    it('should stringify root object when path equals variable prefix', () => {
      const engine = new TemplateEngine({ variable: 'ctx' });
      const data = { user: { name: 'Eve' } };
      const result = engine.render('${ctx}', data);
      expect(result).toBe(JSON.stringify(data));
    });

    it('should ignore paths without prefix', () => {
      const engine = new TemplateEngine({ variable: 'ctx' });
      const data = { user: { name: 'Frank' } };
      const result = engine.render('Hello ${user.name}', data);
      expect(result).toBe('Hello ');
    });
  });

  describe('defaultValue', () => {
    it('should use default value for missing variables', () => {
      const engine = new TemplateEngine({ defaultValue: 'N/A' });
      const data = { user: { name: 'Grace' } };
      const result = engine.render(
        'Name: ${user.name}, Age: ${user.age}',
        data
      );
      expect(result).toBe('Name: Grace, Age: N/A');
    });

    it('should use function as default value', () => {
      const engine = new TemplateEngine({
        defaultValue: (path: string) => `[${path} missing]`
      });
      const data = {};
      const result = engine.render('Missing: ${missing.path}', data);
      expect(result).toBe('Missing: [missing.path missing]');
    });

    it('should handle default value for null/undefined', () => {
      const engine = new TemplateEngine({ defaultValue: 'nullish' });
      const data = { a: null, b: undefined };
      const result = engine.render('a: ${a}, b: ${b}', data);
      expect(result).toBe('a: nullish, b: nullish');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const engine = new TemplateEngine({ escapeHtml: true });
      const data = { html: '<script>alert("xss")</script>' };
      const result = engine.render('${html}', data);
      expect(result).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should not escape when disabled (default)', () => {
      const engine = new TemplateEngine({ escapeHtml: false });
      const data = { html: '<b>bold</b>' };
      const result = engine.render('${html}', data);
      expect(result).toBe('<b>bold</b>');
    });

    it('should escape default value when missing', () => {
      const engine = new TemplateEngine({
        escapeHtml: true,
        defaultValue: '<&>'
      });
      const data = {};
      const result = engine.render('${missing}', data);
      expect(result).toBe('&lt;&amp;&gt;');
    });

    it('should escape apostrophes', () => {
      const engine = new TemplateEngine({ escapeHtml: true });
      const result = engine.render('${text}', { text: "it's" });
      expect(result).toBe('it&#39;s');
    });
  });

  describe('stringifyObject', () => {
    it('should stringify objects to JSON by default', () => {
      const engine = new TemplateEngine();
      const data = { obj: { a: 1, b: 2 } };
      const result = engine.render('${obj}', data);
      expect(result).toBe('{"a":1,"b":2}');
    });

    it('should output "[object Object]" when stringifyObject is false', () => {
      const engine = new TemplateEngine({ stringifyObject: false });
      const data = { obj: { a: 1 } };
      const result = engine.render('${obj}', data);
      expect(result).toBe('[object Object]');
    });

    it('should handle arrays as objects', () => {
      const engine = new TemplateEngine({ stringifyObject: false });
      const data = { arr: [1, 2, 3] };
      const result = engine.render('${arr}', data);
      expect(result).toBe('1,2,3');
    });

    it('should stringify Date values as ISO strings', () => {
      const engine = new TemplateEngine();
      const date = new Date('2024-01-01T00:00:00.000Z');
      const result = engine.render('${created}', { created: date });
      expect(result).toBe(JSON.stringify(date));
    });
  });

  describe('keepUnmatched', () => {
    it('should keep original placeholder when enabled', () => {
      const engine = new TemplateEngine({ keepUnmatched: true });
      const data = {};
      const result = engine.render('Value: ${missing}', data);
      expect(result).toBe('Value: ${missing}');
    });

    it('should replace with default when disabled (default)', () => {
      const engine = new TemplateEngine({
        keepUnmatched: false,
        defaultValue: '???'
      });
      const data = {};
      const result = engine.render('Value: ${missing}', data);
      expect(result).toBe('Value: ???');
    });
  });

  describe('safePrototype', () => {
    it('should block __proto__ path segments', () => {
      const engine = new TemplateEngine({ safePrototype: true });
      const polluted = JSON.parse(
        '{"user":{"name":"safe"},"__proto__":{"evil":"hack"}}'
      ) as Record<string, unknown>;
      expect(engine.render('${__proto__.evil}', polluted)).toBe('');
      expect(engine.render('${user.name}', polluted)).toBe('safe');
    });

    it('should block constructor path segments', () => {
      const engine = new TemplateEngine({ safePrototype: true });
      const data = { constructor: { name: 'Object' } };
      const result = engine.render('${constructor.name}', data);
      expect(result).toBe('');
    });

    it('should block inherited properties when safePrototype is true', () => {
      const engine = new TemplateEngine({ safePrototype: true });
      const data = Object.create({ inherited: 'leaked' }) as Record<
        string,
        unknown
      >;
      data.own = 'value';

      expect(engine.render('${inherited}', data)).toBe('');
      expect(engine.render('${own}', data)).toBe('value');
    });

    it('should allow inherited properties when safePrototype is false', () => {
      const engine = new TemplateEngine({ safePrototype: false });
      const data = Object.create({ inherited: 'leaked' }) as Record<
        string,
        unknown
      >;

      expect(engine.render('${inherited}', data)).toBe('leaked');
    });

    it('should block prototype path segments', () => {
      const engine = new TemplateEngine({ safePrototype: true, defaultValue: 'x' });
      expect(engine.render('${prototype.constructor}', {})).toBe('x');
    });
  });

  describe('compile', () => {
    it('should compile and reuse rendering function', () => {
      const engine = new TemplateEngine();
      const renderFn = engine.compile('Hello ${user.name}');
      const data1 = { user: { name: 'Henry' } };
      const data2 = { user: { name: 'Ivy' } };
      expect(renderFn(data1)).toBe('Hello Henry');
      expect(renderFn(data2)).toBe('Hello Ivy');
    });

    it('should throw if template is not a string', () => {
      const engine = new TemplateEngine();
      expect(() => engine.compile(123 as unknown as string)).toThrow(
        'Template must be a string'
      );
    });

    it('should handle many repeated renders efficiently with pre-parsed paths', () => {
      const engine = new TemplateEngine();
      const renderFn = engine.compile(
        '${user.name}-${user.role}-${user.team}'
      );
      const data = {
        user: { name: 'A', role: 'dev', team: 'core' }
      };

      for (let i = 0; i < 1000; i += 1) {
        expect(renderFn(data)).toBe('A-dev-core');
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty template', () => {
      const engine = new TemplateEngine();
      expect(engine.render('', {})).toBe('');
    });

    it('should handle numbers and booleans', () => {
      const engine = new TemplateEngine();
      const data = { num: 42, bool: true };
      const result = engine.render('num: ${num}, bool: ${bool}', data);
      expect(result).toBe('num: 42, bool: true');
    });

    it('should treat null and undefined as missing by default', () => {
      const engine = new TemplateEngine();
      const data = { nullVal: null, undefVal: undefined };
      const result = engine.render('${nullVal}, ${undefVal}', data);
      expect(result).toBe(', ');
    });

    it('should coerce non-object data to empty object', () => {
      const engine = new TemplateEngine({ defaultValue: 'fallback' });
      const renderFn = engine.compile('${missing}');
      expect(renderFn(null as unknown as Record<string, unknown>)).toBe(
        'fallback'
      );
    });

    it('should reject unsafe path characters', () => {
      const engine = new TemplateEngine({
        defaultValue: 'blocked',
        keepUnmatched: false
      });
      const result = engine.render('${user;drop}', {
        'user;drop': 'evil'
      });
      expect(result).toBe('blocked');
    });

    it('should handle template without placeholders', () => {
      const engine = new TemplateEngine();
      expect(engine.render('plain text', {})).toBe('plain text');
    });

    it('should handle adjacent placeholders', () => {
      const engine = new TemplateEngine();
      const result = engine.render('${a}${b}', { a: '1', b: '2' });
      expect(result).toBe('12');
    });
  });
});
