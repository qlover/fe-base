import { ExecutorError } from '@qlover/fe-corekit';
import { omit } from 'lodash';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
import { localesSchema } from '@migrations/schema/LocalesSchema';
import type { LocaleType } from '@config/i18n';
import { i18nConfig } from '@config/i18n';
import {
  type ValidationFaildResult,
  type ValidatorInterface
} from '../port/ValidatorInterface';
import type { ExtendedExecutorError } from './ExtendedExecutorError';
import type { ImportLocalesData } from '../services/ApiLocaleService';

export class LocalesValidator implements ValidatorInterface {
  validate(data: unknown): void | ValidationFaildResult {
    if (typeof data !== 'object' || data === null) {
      return {
        path: ['form'],
        message: 'form is required'
      };
    }

    const result = localesSchema
      .omit({ id: true, created_at: true, updated_at: true })
      .safeParse(data);

    if (!result.success) {
      return result.error.issues[0];
    }
  }

  getThrow(
    data: unknown
  ): Omit<LocalesSchema, 'id' | 'created_at' | 'updated_at'> {
    const result = this.validate(data);

    if (result == null) {
      return omit(data as LocalesSchema, ['id', 'created_at', 'updated_at']);
    }

    const error: ExtendedExecutorError = new ExecutorError(result.message);
    error.issues = [result];
    throw error;
  }
}

export class LocalesImportValidator implements ValidatorInterface {
  getHasAnyFilesLocale(
    values: FormData
  ): { language: LocaleType; value: FormDataEntryValue }[] {
    const hasAnyFilesLocale = [];
    for (const language of i18nConfig.supportedLngs) {
      const value = values.get(language);
      if (value != null) {
        hasAnyFilesLocale.push({ language, value });
      }
    }
    return hasAnyFilesLocale;
  }

  async validate(data: {
    namespace?: string;
    values: unknown;
  }): Promise<void | ValidationFaildResult> {
    const values = data.values;
    if (!(values instanceof FormData)) {
      return {
        path: ['form'],
        message: 'FormData is required'
      };
    }

    const hasAnyFilesLocale = this.getHasAnyFilesLocale(values);

    if (hasAnyFilesLocale.length === 0) {
      return {
        path: ['form'],
        message: 'At least one language file is required'
      };
    }

    for (const { language, value } of hasAnyFilesLocale) {
      if (!(value instanceof File) || value.type !== 'application/json') {
        return {
          path: [language],
          message: `File for language ${language} is not a JSON File`
        };
      }

      try {
        const content = await (value as File).text();
        JSON.parse(content);
      } catch {
        return {
          path: [language],
          message: `File for language ${language} is not a valid JSON`
        };
      }
    }
  }

  async getThrow(data: {
    namespace?: string;
    values: unknown;
  }): Promise<ImportLocalesData> {
    const result = await this.validate(data);

    console.log(result);
    if (result == null) {
      const hasAnyFilesLocales = this.getHasAnyFilesLocale(
        data.values as FormData
      );
      const result: { [key in LocaleType]?: Record<string, string> } = {};

      for (const { language, value } of hasAnyFilesLocales) {
        const content = await (value as File).text();
        const jsonData = JSON.parse(content);
        result[language as LocaleType] = jsonData;
      }

      return {
        namespace: data.namespace || 'common',
        values: result
      };
    }

    const error: ExtendedExecutorError = new ExecutorError(result.message);
    error.issues = [result];
    throw error;
  }
}
