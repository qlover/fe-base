/**
 * @module TemplateEngine
 * @description Lightweight, safe template engine for variable interpolation.
 *
 * Supports path-based value lookup (e.g. `user.name`, `items[0].id`) without
 * executing arbitrary JavaScript. Designed as a drop-in replacement for
 * simple `lodash.template` use cases in scripts and configuration formatting.
 *
 * Default syntax: ES6 template-literal `${ path }`.
 *
 * @example Basic usage
 * ```typescript
 * const engine = new TemplateEngine();
 * engine.render('Hello ${user.name}!', { user: { name: 'Alice' } });
 * // => 'Hello Alice!'
 * ```
 *
 * @example Reusable compiled renderer
 * ```typescript
 * const render = engine.compile('git clone ${repo.url}');
 * render({ repo: { url: 'https://github.com/user/repo.git' } });
 * ```
 */

/**
 * Template engine configuration options.
 */
export interface TemplateOptions {
  /**
   * Interpolation regex with exactly one capture group for the variable path.
   * Defaults to {@link interpolatePreset.ES6}.
   */
  interpolate?: RegExp;
  /**
   * Required path prefix in templates (lodash `variable` option semantics).
   * e.g. `variable: 'data'` → use `${data.user.name}` with `{ user: { name } }`.
   */
  variable?: string;
  /** Default when value is missing (undefined/null) or path is invalid. */
  defaultValue?:
    | unknown
    | ((path: string, data: Record<string, unknown>) => unknown);
  /** Escape HTML entities in output. Default false. */
  escapeHtml?: boolean;
  /** Serialize objects via JSON.stringify. Default true. */
  stringifyObject?: boolean;
  /** Keep original placeholder when value is missing. Default false. */
  keepUnmatched?: boolean;
  /** Block prototype keys and only read own properties. Default true. */
  safePrototype?: boolean;
}

type TextToken = string;

type VariableToken = {
  type: 'variable';
  path: string;
  raw: string;
  keys: string[] | null;
};

type Token = TextToken | VariableToken;

/** Compiled render function returned by {@link TemplateEngine.compile}. */
export type RenderFn = (data: Record<string, unknown>) => string;

/**
 * Built-in interpolation regex presets.
 *
 * Pass one of these to `new TemplateEngine({ interpolate })` when you need
 * a syntax other than the default ES6-style delimiters.
 *
 * @example ES6 (default — no extra config needed)
 * ```typescript
 * new TemplateEngine().render('Hello ${name}!', { name: 'World' });
 * ```
 *
 * @example Lodash / EJS style
 * ```typescript
 * new TemplateEngine({ interpolate: interpolatePreset.LODASH })
 *   .render('Hello <%= name %>!', { name: 'World' });
 * ```
 *
 * @example Mustache style
 * ```typescript
 * new TemplateEngine({ interpolate: interpolatePreset.MUSTACHE })
 *   .render('Hello {{ name }}!', { name: 'World' });
 * ```
 */
export const interpolatePreset = {
  /**
   * ES6 template-literal style: `${ variable }`
   *
   * This is the default for {@link TemplateEngine}.
   *
   * @example
   * ```typescript
   * engine.render('${user.name}', { user: { name: 'Bob' } });
   * ```
   */
  ES6: /\$\{([\s\S]+?)\}/g,

  /**
   * Lodash / EJS style: `<%= variable %>`
   *
   * Useful when migrating existing lodash templates.
   *
   * @example
   * ```typescript
   * new TemplateEngine({ interpolate: interpolatePreset.LODASH })
   *   .render('<%= repo.url %>', { repo: { url: 'https://example.com' } });
   * ```
   */
  LODASH: /<%=([\s\S]+?)%>/g,

  /**
   * Mustache / Handlebars style: `{{ variable }}`
   *
   * @example
   * ```typescript
   * new TemplateEngine({ interpolate: interpolatePreset.MUSTACHE })
   *   .render('{{ user.name }}', { user: { name: 'Alice' } });
   * ```
   */
  MUSTACHE: /\{\{([\s\S]+?)\}\}/g
} as const;

const DANGEROUS_KEYS = new Set([
  '__proto__',
  'constructor',
  'prototype',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__'
]);

const SAFE_PATH = /^[\w.[\]]+$/;
const PATH_SEGMENT = /^(\d+|\w+)$/;

/** Clone a RegExp and ensure the global flag is set for tokenization. */
function cloneGlobalRegExp(regex: RegExp): RegExp {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  return new RegExp(regex.source, flags);
}

/** Convert bracket notation to dot notation: `items[0].name` → `items.0.name`. */
function normalizePath(path: string): string {
  return path.replace(/\[(\d+)\]/g, '.$1');
}

/**
 * Parse and validate a variable path into key segments.
 * Returns `null` when the path is invalid or fails the variable-prefix check.
 */
function parsePathKeys(path: string, variablePrefix: string): string[] | null {
  const trimmed = path.trim();
  if (!trimmed || !SAFE_PATH.test(trimmed)) {
    return null;
  }

  let actualPath = trimmed;

  if (variablePrefix) {
    if (actualPath === variablePrefix) {
      return [];
    }

    const prefix = `${variablePrefix}.`;
    if (!actualPath.startsWith(prefix)) {
      return null;
    }

    actualPath = actualPath.slice(prefix.length);
    if (!actualPath) {
      return null;
    }
  }

  const keys = normalizePath(actualPath).split('.');
  if (keys.length === 0 || keys.some((key) => !key || !PATH_SEGMENT.test(key))) {
    return null;
  }

  return keys;
}

function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
}

function formatValue(value: unknown, stringifyObject: boolean): string {
  if (value === undefined || value === null) {
    return '';
  }

  if (typeof value === 'object') {
    return stringifyObject ? JSON.stringify(value) : String(value);
  }

  return String(value);
}

/**
 * Resolve a value from data using pre-parsed key segments.
 * When `safePrototype` is true, only own properties are read and
 * dangerous keys are blocked.
 */
function getValueByKeys(
  data: Record<string, unknown>,
  keys: string[] | null,
  safePrototype: boolean
): unknown {
  if (keys === null) {
    return undefined;
  }

  if (keys.length === 0) {
    return data;
  }

  let current: unknown = data;

  for (const key of keys) {
    if (safePrototype && DANGEROUS_KEYS.has(key)) {
      return undefined;
    }

    if (current === null || typeof current !== 'object') {
      return undefined;
    }

    const record = current as Record<string, unknown>;

    if (safePrototype) {
      if (!Object.hasOwn(record, key)) {
        return undefined;
      }
    } else if (!(key in record)) {
      return undefined;
    }

    current = record[key];
  }

  return current;
}

/** Split a template string into literal text and variable tokens. */
function tokenize(template: string, interpolate: RegExp): Token[] {
  const tokens: Token[] = [];
  const regex = cloneGlobalRegExp(interpolate);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(template)) !== null) {
    if (match[0].length === 0) {
      regex.lastIndex += 1;
      continue;
    }

    if (match.index > lastIndex) {
      tokens.push(template.slice(lastIndex, match.index));
    }

    const rawPath = match[1]?.trim() ?? '';
    tokens.push({
      type: 'variable',
      path: rawPath,
      raw: match[0],
      keys: null
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    tokens.push(template.slice(lastIndex));
  }

  return tokens;
}

/**
 * Lightweight template engine for safe variable interpolation.
 *
 * Features:
 * - ES6 `${ path }` syntax by default
 * - Nested path access and numeric array indices
 * - Prototype pollution protection (`safePrototype`, enabled by default)
 * - Compile-once, render-many for performance
 *
 * Does NOT execute `<% code %>` logic blocks or arbitrary JavaScript.
 */
export class TemplateEngine {
  private readonly options: Required<Omit<TemplateOptions, 'defaultValue'>> & {
    defaultValue: TemplateOptions['defaultValue'];
  };

  /**
   * @param options - Engine configuration. All fields are optional;
   *   defaults to ES6 `${}` interpolation with safe prototype access.
   */
  constructor(options: TemplateOptions = {}) {
    const defaults = {
      interpolate: interpolatePreset.ES6,
      variable: '',
      defaultValue: '',
      escapeHtml: false,
      stringifyObject: true,
      keepUnmatched: false,
      safePrototype: true
    };

    this.options = {
      ...defaults,
      ...options,
      interpolate: cloneGlobalRegExp(
        options.interpolate ?? defaults.interpolate
      )
    };
  }

  /**
   * Compile a template into a reusable render function.
   *
   * Path parsing and validation happen once at compile time; subsequent
   * renders only perform value lookup and string assembly.
   *
   * @param template - Template string containing placeholders
   * @returns Render function bound to the compiled template
   * @throws {TypeError} When template is not a string
   */
  public compile(template: string): RenderFn {
    if (typeof template !== 'string') {
      throw new TypeError('Template must be a string');
    }

    const {
      variable,
      defaultValue,
      escapeHtml: shouldEscapeHtml,
      stringifyObject,
      keepUnmatched,
      safePrototype
    } = this.options;

    const tokens = tokenize(template, this.options.interpolate).map(
      (token): Token => {
        if (typeof token === 'string') {
          return token;
        }

        return {
          ...token,
          keys: parsePathKeys(token.path, variable)
        };
      }
    );

    return (input: Record<string, unknown>): string => {
      const data =
        input !== null && typeof input === 'object'
          ? input
          : ({} as Record<string, unknown>);

      const parts: string[] = [];

      for (const token of tokens) {
        if (typeof token === 'string') {
          parts.push(token);
          continue;
        }

        const value = getValueByKeys(data, token.keys, safePrototype);

        if (value === undefined || value === null) {
          if (keepUnmatched) {
            parts.push(token.raw);
            continue;
          }

          let resolvedDefault: unknown = defaultValue;
          if (typeof defaultValue === 'function') {
            resolvedDefault = defaultValue(token.path, data);
          }

          const defaultStr = formatValue(resolvedDefault, stringifyObject);
          parts.push(shouldEscapeHtml ? escapeHtml(defaultStr) : defaultStr);
          continue;
        }

        let output = formatValue(value, stringifyObject);
        if (shouldEscapeHtml) {
          output = escapeHtml(output);
        }
        parts.push(output);
      }

      return parts.join('');
    };
  }

  /**
   * Render a template in one shot.
   *
   * Convenience wrapper around `compile(template)(data)`.
   * Prefer {@link compile} when the same template is rendered multiple times.
   *
   * @param template - Template string containing placeholders
   * @param data - Context object for variable substitution
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public render(template: string, data: Record<string, any>): string {
    return this.compile(template)(data);
  }
}
