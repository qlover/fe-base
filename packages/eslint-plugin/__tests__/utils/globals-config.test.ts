import { describe, it, expect } from 'vitest';
import type { Linter } from 'eslint';
import {
  disableGlobals,
  restrictSpecificGlobals,
  restrictGlobals
} from '../../src/utils/globals-config';

describe('globals-config', () => {
  describe('disableGlobals', () => {
    it('should disable specified global variables', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
          globals: {
            window: 'readonly',
            document: 'readonly',
            console: 'readonly'
          }
        },
        rules: {}
      };

      const result = disableGlobals(config, {
        disabledGlobals: ['window', 'document']
      });

      expect(result.languageOptions?.globals).toEqual({
        window: 'off',
        document: 'off',
        console: 'readonly'
      });
    });

    it('should handle empty disabledGlobals array', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
          globals: {
            window: 'readonly'
          }
        },
        rules: {}
      };

      const result = disableGlobals(config, {
        disabledGlobals: []
      });

      expect(result.languageOptions?.globals).toEqual({
        window: 'readonly'
      });
    });

    it('should handle config without languageOptions', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        rules: {}
      };

      const result = disableGlobals(config, {
        disabledGlobals: ['window']
      });

      expect(result.languageOptions?.globals).toEqual({
        window: 'off'
      });
    });

    it('should preserve existing config properties', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
          globals: {
            window: 'readonly'
          }
        },
        rules: {
          'no-console': 'error'
        }
      };

      const result = disableGlobals(config, {
        disabledGlobals: ['window']
      });

      expect(result.files).toEqual(['src/**/*.{ts,tsx}']);
      expect(result.languageOptions?.globals).toBeDefined();
      expect(result.rules).toEqual({
        'no-console': 'error'
      });
    });
  });

  describe('restrictSpecificGlobals', () => {
    it('should restrict specified global variables with default message', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
          globals: {
            window: 'readonly',
            document: 'readonly'
          }
        },
        rules: {}
      };

      const result = restrictSpecificGlobals(config, {
        restrictedGlobals: ['window', 'document']
      });

      expect(result.rules?.['no-restricted-globals']).toEqual([
        'error',
        {
          name: 'window',
          message:
            'Do not use window directly, import from @/core/globals or use an allowed alternative'
        },
        {
          name: 'document',
          message:
            'Do not use document directly, import from @/core/globals or use an allowed alternative'
        }
      ]);
    });

    it('should use custom message template', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        rules: {}
      };

      const result = restrictSpecificGlobals(config, {
        restrictedGlobals: ['window'],
        message: 'Do not use ${name}, import from @/core/globals'
      });

      expect(result.rules?.['no-restricted-globals']).toEqual([
        'error',
        {
          name: 'window',
          message: 'Do not use window, import from @/core/globals'
        }
      ]);
    });

    it('should use custom message function', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        rules: {}
      };

      const result = restrictSpecificGlobals(config, {
        restrictedGlobals: ['window'],
        message: (name) => `Do not use global variable "${name}"`
      });

      expect(result.rules?.['no-restricted-globals']).toEqual([
        'error',
        {
          name: 'window',
          message: 'Do not use global variable "window"'
        }
      ]);
    });

    it('should prioritize customMessages over message template', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        rules: {}
      };

      const result = restrictSpecificGlobals(config, {
        restrictedGlobals: ['window', 'document'],
        message: 'Default message for ${name}',
        customMessages: {
          window: 'Do not use window object directly'
        }
      });

      expect(result.rules?.['no-restricted-globals']).toEqual([
        'error',
        {
          name: 'window',
          message: 'Do not use window object directly'
        },
        {
          name: 'document',
          message: 'Default message for document'
        }
      ]);
    });

    it('should preserve existing rules', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        rules: {
          'no-console': 'error'
        }
      };

      const result = restrictSpecificGlobals(config, {
        restrictedGlobals: ['window']
      });

      expect(result.rules?.['no-console']).toBe('error');
      expect(result.rules?.['no-restricted-globals']).toBeDefined();
    });

    it('should handle empty restrictedGlobals array', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        rules: {}
      };

      const result = restrictSpecificGlobals(config, {
        restrictedGlobals: []
      });

      expect(result.rules?.['no-restricted-globals']).toEqual(['error']);
    });
  });

  describe('restrictGlobals', () => {
    it('should restrict all globals except allowed ones', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
          globals: {
            window: 'readonly',
            document: 'readonly',
            console: 'readonly',
            setTimeout: 'readonly'
          }
        },
        rules: {}
      };

      const result = restrictGlobals(config, {
        allowedGlobals: ['console', 'setTimeout']
      });

      const restrictedRule = result.rules?.['no-restricted-globals'] as
        | ['error', ...Array<{ name: string; message: string }>]
        | undefined;
      expect(restrictedRule).toBeDefined();
      expect(Array.isArray(restrictedRule)).toBe(true);
      expect(restrictedRule?.[0]).toBe('error');
      expect(restrictedRule?.length).toBe(3); // error + 2 restricted globals

      const restrictedItems = restrictedRule?.slice(1) || [];
      const restrictedNames = restrictedItems
        .map((item) => (typeof item === 'string' ? item : item.name))
        .sort();
      expect(restrictedNames).toEqual(['document', 'window']);
    });

    it('should use allGlobals from options when provided', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
          globals: {
            console: 'readonly'
          }
        },
        rules: {}
      };

      const result = restrictGlobals(config, {
        allowedGlobals: ['console'],
        allGlobals: {
          window: 'readonly',
          document: 'readonly',
          console: 'readonly'
        }
      });

      const restrictedRule = result.rules?.['no-restricted-globals'] as
        | ['error', ...Array<{ name: string; message: string }>]
        | undefined;
      expect(restrictedRule).toBeDefined();
      expect(Array.isArray(restrictedRule)).toBe(true);
      expect(restrictedRule?.length).toBe(3); // error + 2 restricted globals
      const restrictedItems = restrictedRule?.slice(1) || [];
      const restrictedNames = restrictedItems
        .map((item) => (typeof item === 'string' ? item : item.name))
        .sort();
      expect(restrictedNames).toEqual(['document', 'window']);
    });

    it('should use custom message template', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
          globals: {
            window: 'readonly',
            console: 'readonly'
          }
        },
        rules: {}
      };

      const result = restrictGlobals(config, {
        allowedGlobals: ['console'],
        message: 'Do not use ${name}'
      });

      const restrictedRule = result.rules?.['no-restricted-globals'] as
        | ['error', ...Array<{ name: string; message: string }>]
        | undefined;

      expect(restrictedRule?.[1].message).toBe('Do not use window');
    });

    it('should use custom message function', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
          globals: {
            window: 'readonly',
            console: 'readonly'
          }
        },
        rules: {}
      };

      const result = restrictGlobals(config, {
        allowedGlobals: ['console'],
        message: (name) => `Do not use global variable "${name}"`
      });

      const restrictedRule = result.rules?.['no-restricted-globals'] as
        | ['error', ...Array<{ name: string; message: string }>]
        | undefined;

      expect(restrictedRule?.[1].message).toBe(
        'Do not use global variable "window"'
      );
    });

    it('should prioritize customMessages over message template', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
          globals: {
            window: 'readonly',
            document: 'readonly',
            console: 'readonly'
          }
        },
        rules: {}
      };

      const result = restrictGlobals(config, {
        allowedGlobals: ['console'],
        message: 'Default message for ${name}',
        customMessages: {
          window: 'Do not use window, import from @/core/globals'
        }
      });

      const restrictedRule = result.rules?.['no-restricted-globals'] as
        | ['error', ...Array<{ name: string; message: string }>]
        | undefined;
      expect(restrictedRule).toBeDefined();
      expect(Array.isArray(restrictedRule)).toBe(true);
      const restrictedItems = restrictedRule?.slice(1) || [];

      const windowRule = restrictedItems.find(
        (item) =>
          typeof item === 'object' && item !== null && item.name === 'window'
      ) as { name: string; message: string } | undefined;
      const documentRule = restrictedItems.find(
        (item) =>
          typeof item === 'object' && item !== null && item.name === 'document'
      ) as { name: string; message: string } | undefined;

      expect(windowRule?.message).toBe(
        'Do not use window, import from @/core/globals'
      );
      expect(documentRule?.message).toBe('Default message for document');
    });

    it('should handle config without languageOptions.globals', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        rules: {}
      };

      const result = restrictGlobals(config, {
        allowedGlobals: ['console']
      });

      const restrictedRule = result.rules?.['no-restricted-globals'] as
        | ['error', ...Array<{ name: string; message: string }>]
        | undefined;

      // Should have no restricted globals since there are no globals defined
      expect(restrictedRule).toBeDefined();
      expect(restrictedRule?.length).toBe(1); // Only 'error'
    });

    it('should preserve existing config properties', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
          globals: {
            window: 'readonly',
            console: 'readonly'
          }
        },
        rules: {
          'no-console': 'error'
        }
      };

      const result = restrictGlobals(config, {
        allowedGlobals: ['console']
      });

      expect(result.files).toEqual(['src/**/*.{ts,tsx}']);
      expect(result.languageOptions?.globals).toBeDefined();
      expect(result.rules?.['no-console']).toBe('error');
    });

    it('should allow all globals when allowedGlobals contains all', () => {
      const config: Linter.Config = {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
          globals: {
            window: 'readonly',
            console: 'readonly'
          }
        },
        rules: {}
      };

      const result = restrictGlobals(config, {
        allowedGlobals: ['window', 'console']
      });

      const restrictedRule = result.rules?.['no-restricted-globals'] as
        | ['error', ...Array<{ name: string; message: string }>]
        | undefined;

      // Should have no restricted globals since all are allowed
      expect(restrictedRule?.length).toBe(1); // Only 'error'
    });
  });
});
