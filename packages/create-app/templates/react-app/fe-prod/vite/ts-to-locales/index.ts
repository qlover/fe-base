import type { Plugin } from 'vite';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';

type Ts2LocalesValue = {
  /**
   * @description The path to the source file
   * @example
   *
   * ```ts
   * './config/ErrorIdentifier.ts'
   * ```
   */
  source: string;

  /**
   * @description The path to the target file
   * @example
   *
   * ```ts
   * {
   *  source: './config/ErrorIdentifier.ts',
   *  target: './locales/{{lng}}/common.json'
   * }
   * // or
   * {
   *  source: './config/ErrorIdentifier.ts',
   *  target: './locales/common.{{lng}}.json'
   * }
   * ```
   */
  target: string;
};

type Ts2LocalesOptions = {
  /**
   *
   * @default `['en', 'zh']`
   */
  locales?: string[];
  /**
   *
   * @default `[]`
   */
  options?: Ts2LocalesValue[];
};

type SourceParseValue = {
  key: string;
  value: string;
  description: string;
  localeZh: string;
  localeEn: string;
};

/**
 * Ts2Locales class
 *
 * @description A utility class for extracting internationalization information from TypeScript files and generating localization files
 * @class
 */
export class Ts2Locales {
  /**
   * Creates a new Ts2Locales instance
   *
   * @param locales - Array of supported locale codes, e.g. ['zh', 'en']
   */
  constructor(private locales: string[]) {}

  /**
   * Extracts internationalization information from the source file
   *
   * @param source - Source file path
   * @returns Array of extracted internationalization information objects
   */
  getSourceParseValue(source: string): SourceParseValue[] {
    const content = readFileSync(source, 'utf-8');
    const results: SourceParseValue[] = [];

    // Use regular expressions to match JSDoc comments and exported constant declarations
    const regex =
      /\/\*\*\s*([\s\S]*?)\s*\*\/\s*export\s+const\s+([A-Z_]+)\s*=\s*['"]([^'"]+)['"]/g;

    let match;
    while ((match = regex.exec(content)) !== null) {
      const jsdoc = match[1];
      const key = match[2];
      const value = match[3];

      // Extract description from JSDoc
      const descriptionMatch = /@description\s+(.*?)(\r?\n|$)/m.exec(jsdoc);
      const description = descriptionMatch ? descriptionMatch[1].trim() : '';

      // Create basic entry
      const entry: SourceParseValue = {
        key,
        value,
        description,
        localeZh: '',
        localeEn: ''
      };

      // Dynamically extract all tags starting with @local
      const localRegex = /@local([A-Za-z]+)\s+(.*?)(\r?\n|$)/gm;
      let localMatch;

      while ((localMatch = localRegex.exec(jsdoc)) !== null) {
        const locale = localMatch[1].toLowerCase(); // e.g. Zh, En, etc.
        const localValue = localMatch[2].trim();

        // Dynamically set localization values

        // For other languages, dynamically add to the object
        (entry as Record<string, string>)[
          `locale${locale.charAt(0).toUpperCase()}${locale.slice(1)}`
        ] = localValue;
      }

      results.push(entry);
    }

    return results;
  }

  /**
   * Creates localization file content based on extracted internationalization information
   *
   * @param locale - Locale code, e.g. 'zh', 'en'
   * @param sourceParseValues - Array of internationalization information extracted from the source file
   * @returns Object containing the localization content
   */
  createLocaleFile(
    locale: string,
    sourceParseValues: SourceParseValue[]
  ): Record<string, string> {
    const result: Record<string, string> = {};

    for (const item of sourceParseValues) {
      // Dynamically get the localization value for the current language
      const localeKey = `locale${locale.charAt(0).toUpperCase()}${locale.slice(1)}`;

      if ((item as any)[localeKey]) {
        result[item.value] = (item as any)[localeKey];
      } else {
        // If there is no corresponding localization content, use the description or original value
        result[item.value] = item.description || item.value || item.key;
      }
    }

    return result;
  }

  /**
   * Generates localization files
   *
   * @param value - Object containing source file path and target file path
   * @returns Returns a Promise indicating the completion of the generation operation
   */
  async generate(value: Ts2LocalesValue): Promise<void> {
    const { source, target } = value;

    if (!existsSync(source)) {
      throw new Error(`Source file ${source} does not exist`);
    }

    // 1. Get internationalization information from the source file
    const sourceParseValues = this.getSourceParseValue(source);

    for (const locale of this.locales) {
      // 2. Create localization file content
      const localeFile = this.createLocaleFile(locale, sourceParseValues);

      // 3. Read target file path
      const targetPath = target.replace('{{lng}}', locale);

      // 4. Write to target file, merge content if file exists
      if (existsSync(targetPath)) {
        const targetFile = readFileSync(targetPath, 'utf-8');
        const targetFileJson = JSON.parse(targetFile);
        const mergedFile = { ...targetFileJson, ...localeFile };
        writeFileSync(targetPath, JSON.stringify(mergedFile, null, 2));
      } else {
        // If it doesn't exist, create directory path and new file
        const dirPath = dirname(targetPath);
        if (!existsSync(dirPath)) {
          mkdirSync(dirPath, { recursive: true });
        }
        writeFileSync(targetPath, JSON.stringify(localeFile, null, 2));
      }
    }
  }
}

export default (opts: Ts2LocalesOptions = {}): Plugin => {
  const { locales, options = [] } = opts;

  return {
    name: 'vite-env-config',
    async configResolved(config) {
      const ts2Locale = new Ts2Locales(locales);
      for (const value of options) {
        await ts2Locale.generate(value);
      }
    }
  };
};
