import { TEMPLATE_CLOSE, TEMPLATE_OPEN } from '../defaults';

interface Options {
  open: string;
  close: string;
}

export default class TemplateJson {
  constructor(private options?: Partial<Options>) {
    this.options = {
      open: TEMPLATE_OPEN,
      close: TEMPLATE_CLOSE,
      ...options
    };
  }

  /**
   * get the value of nested path, for example 'user.name.first'
   */
  getNested(
    context: Record<string, unknown>,
    path: string
  ): unknown | undefined {
    return path.split('.').reduce<unknown | undefined>((obj, key) => {
      if (typeof obj === 'object' && obj !== null && key in obj) {
        return (obj as Record<string, unknown>)[key];
      }
      return undefined;
    }, context);
  }

  /**
   * replace all placeholders with corresponding context values
   */
  resolveString(
    str: string,
    context: Record<string, unknown>,
    open: string,
    close: string
  ): string {
    const escapedOpen = open.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedClose = close.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(
      `${escapedOpen}\\s*([\\w.]+)\\s*${escapedClose}`,
      'g'
    );

    return str.replace(pattern, (_, key: string) => {
      const value = this.getNested(context, key);

      // if the value is undefined, return the placeholder
      if (value === undefined) {
        return _;
      }

      return typeof value !== 'string' ? JSON.stringify(value) : String(value);
    });
  }

  /**
   * safely handle template strings, replace placeholders with context values
   *
   * @param input - template string or object
   * @param context - context object containing values to replace
   * @param options - configuration options, such as custom placeholders
   * @returns replaced string or object
   */
  format<Input = unknown>(
    input: Input,
    context: Record<string, unknown>,
    options: Partial<Options> = {}
  ): Input {
    const open = options.open ?? this.options!.open;
    const close = options.close ?? this.options!.close;

    if (typeof input === 'string') {
      // check if this is a JSON string that needs to be parsed
      try {
        // try to parse the string as a JSON object
        const jsonObj = JSON.parse(input);
        // if successful, recursively process the object and stringify it again
        const processed = this.format(jsonObj, context, options);
        return JSON.stringify(processed) as Input;
      } catch {
        // if not a valid JSON, process the template string normally
        return this.resolveString(input, context, open!, close!) as Input;
      }
    }

    if (Array.isArray(input)) {
      return input.map((item) =>
        this.format(item, context, options)
      ) as unknown as Input;
    }

    if (input !== null && typeof input === 'object') {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(input)) {
        result[key] = this.format(value, context, options);
      }
      return result as Input;
    }

    return input;
  }

  static format(
    input: unknown,
    context: Record<string, unknown>,
    options: Partial<Options> = {}
  ): unknown {
    return new TemplateJson(options).format(input, context);
  }
}
