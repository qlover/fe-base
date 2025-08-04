/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock modules
vi.mock('fs-extra', () => ({
  default: {
    removeSync: vi.fn(),
    ensureFileSync: vi.fn(),
    writeFileSync: vi.fn()
  }
}));

vi.mock('typedoc', () => ({
  Application: {
    bootstrap: vi.fn().mockResolvedValue({
      convert: vi.fn().mockResolvedValue({
        children: [
          {
            id: 1,
            kind: 1, // ReflectionKind.Class
            name: 'TestClass',
            comment: {
              summary: [{ text: 'Test class description' }],
              blockTags: [
                {
                  tag: '@since',
                  content: [{ text: '1.0.0' }]
                }
              ]
            },
            sources: [
              {
                fileName: 'test.ts',
                line: 1,
                character: 1
              }
            ]
          }
        ]
      }),
      serializer: {
        projectToObject: vi.fn().mockReturnValue({})
      }
    })
  },
  ReflectionKind: {
    Class: 1,
    Parameter: 32768,
    Property: 1024
  },
  TSConfigReader: class TSConfigReader {
    constructor() {}
    read(): void {}
  },
  TypeDocReader: class TypeDocReader {
    constructor() {}
    read(): void {}
  }
}));

/**
 * TypeDocJson plugin test suite
 *
 * Coverage:
 * 1. constructor     - Constructor initialization
 * 2. onBefore       - Main execution method
 * 3. formats        - TypeDoc reflection conversion
 * 4. formatters     - Helper methods for type and description formatting
 * 5. error handling - Invalid inputs and edge cases
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TypeDocJson from '../../src/plugins/typeDocs';
import Code2MDContext from '../../src/implments/Code2MDContext';
import { mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { Application, ProjectReflection } from 'typedoc';
import fsExtra from 'fs-extra';

// Test type definitions
interface TestComment {
  summary?: Array<{ text: string }>;
  blockTags?: Array<{
    tag: string;
    name?: string;
    content?: Array<{ text: string }>;
  }>;
}

interface TestType {
  type: string;
  name?: string;
  value?: string | number;
  typeArguments?: TestType[];
  types?: TestType[]; // Added for union types
  declaration?: {
    children?: TestReflection[];
  };
}

interface TestReflection {
  id: number;
  kind: number;
  name: string;
  type?: TestType;
  comment?: TestComment;
  sources?: Array<{
    fileName: string;
    line: number;
    character: number;
  }>;
  signatures?: Array<{
    parameters?: TestReflection[];
    type?: TestType;
  }>;
  parameters?: TestReflection[];
}

// Mock type for formatParameters
interface MockParameterReflection extends TestReflection {
  variant?: string;
  traverse?: () => void;
  toObject?: () => Record<string, unknown>;
  fromObject?: (obj: Record<string, unknown>) => void;
}

describe('TypeDocJson', () => {
  const TEST_DIR = './test-files';
  let context: Code2MDContext;
  let typeDocJson: TypeDocJson;

  // Test file structure setup
  beforeEach(() => {
    // Create test directory structure
    mkdirSync(TEST_DIR, { recursive: true });
    mkdirSync(join(TEST_DIR, 'src'), { recursive: true });

    // Create test files
    writeFileSync(
      join(TEST_DIR, 'src/test.ts'),
      `
      /**
       * Test class description
       * @since 1.0.0
       */
      export class TestClass {
        /**
         * Test method
         * @param name - The name parameter
         * @returns A greeting message
         */
        greet(name: string): string {
          return \`Hello, \${name}!\`;
        }
      }
      `
    );

    // Initialize context and plugin
    context = new Code2MDContext('code2markdown', {
      options: {
        sourcePath: join(TEST_DIR, 'src'),
        generatePath: join(TEST_DIR, 'docs'),
        readerOutputs: [
          {
            fullPath: join(TEST_DIR, 'src/test.ts'),
            name: 'test',
            dir: join(TEST_DIR, 'src'),
            ext: '.ts',
            relativePath: 'src/test.ts',
            outputPath: join(TEST_DIR, 'docs/test.md')
          }
        ]
      }
    });
    typeDocJson = new TypeDocJson(context);
  });

  // Cleanup test files
  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with valid context', () => {
      expect(typeDocJson).toBeInstanceOf(TypeDocJson);
      expect(typeDocJson['context']).toBe(context);
    });

    it('should throw error with invalid context', () => {
      expect(
        () => new TypeDocJson(undefined as unknown as Code2MDContext)
      ).toThrow();
    });
  });

  describe('onBefore', () => {
    it('should process TypeScript files and update context', async () => {
      await typeDocJson.onBefore();

      const { formatProject } = context.options;
      expect(formatProject).toBeDefined();
      expect(formatProject?.length).toBe(1);

      const testClass = formatProject?.[0];
      expect(testClass?.name).toBe('TestClass');
      expect(testClass?.kindName).toBe('Class');
      expect(testClass?.descriptions?.[0]?.content?.[0]?.text).toBe(
        'Test class description'
      );
      expect(testClass?.since).toBe('1.0.0');
    });

    it('should write JSON output when outputJSONFilePath is provided', async () => {
      typeDocJson.setConfig({
        outputJSONFilePath: join(TEST_DIR, 'typedoc.json')
      });

      await typeDocJson.onBefore();

      expect(fsExtra.writeFileSync).toHaveBeenCalledWith(
        join(TEST_DIR, 'typedoc.json'),
        expect.any(String),
        'utf-8'
      );
    });

    it('should write template data when tplPath is provided', async () => {
      typeDocJson.setConfig({
        tplPath: join(TEST_DIR, 'template.json')
      });

      await typeDocJson.onBefore();

      expect(fsExtra.writeFileSync).toHaveBeenCalledWith(
        join(TEST_DIR, 'template.json'),
        expect.any(String),
        'utf-8'
      );
    });
  });

  describe('formats', () => {
    it('should convert TypeDoc reflections to format values', () => {
      const project = {
        children: [
          {
            id: 1,
            kind: 1, // ReflectionKind.Class
            name: 'TestClass',
            comment: {
              summary: [{ text: 'Test class description' }]
            },
            sources: [
              {
                fileName: 'test.ts',
                line: 1,
                character: 1
              }
            ]
          }
        ]
      } as unknown as ProjectReflection;

      const result = typeDocJson['formats'](project);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        kind: 1,
        name: 'TestClass',
        descriptions: [
          {
            tag: '@summary',
            content: [{ text: 'Test class description' }]
          }
        ],
        source: {
          fileName: 'test.ts',
          line: 1,
          character: 1
        }
      });
    });

    it('should filter out .d.ts files', () => {
      const project = {
        children: [
          {
            id: 1,
            name: 'Test',
            sources: [{ fileName: 'test.d.ts' }]
          }
        ]
      } as unknown as ProjectReflection;

      const result = typeDocJson['formats'](project);
      expect(result).toHaveLength(0);
    });

    it('should handle empty project', () => {
      const project = {} as ProjectReflection;
      const result = typeDocJson['formats'](project);
      expect(result).toHaveLength(0);
    });
  });

  describe('getTypeString', () => {
    it('should handle intrinsic types', () => {
      const reflection: TestReflection = {
        id: 1,
        kind: 1,
        name: 'test',
        type: { type: 'intrinsic', name: 'string' }
      };
      expect(typeDocJson['getTypeString'](reflection)).toBe('string');
    });

    it('should handle reference types', () => {
      const reflection: TestReflection = {
        id: 1,
        kind: 1,
        name: 'test',
        type: {
          type: 'reference',
          name: 'Promise',
          typeArguments: [{ type: 'intrinsic', name: 'string' }]
        }
      };
      expect(typeDocJson['getTypeString'](reflection)).toBe('Promise<string>');
    });

    it('should handle literal types', () => {
      expect(
        typeDocJson['getTypeString']({
          id: 1,
          kind: 1,
          name: 'test',
          type: { type: 'literal', value: 'test' }
        } as TestReflection)
      ).toBe('"test"');
      expect(
        typeDocJson['getTypeString']({
          id: 1,
          kind: 1,
          name: 'test',
          type: { type: 'literal', value: 42 }
        } as TestReflection)
      ).toBe('42');
    });

    it('should handle union types', () => {
      const reflection: TestReflection = {
        id: 1,
        kind: 1,
        name: 'test',
        type: {
          type: 'union',
          types: [
            { type: 'intrinsic', name: 'string' },
            { type: 'intrinsic', name: 'number' }
          ]
        }
      };
      expect(typeDocJson['getTypeString'](reflection)).toBe(
        'string \\| number'
      );
    });

    it('should handle function signatures', () => {
      const reflection: TestReflection = {
        id: 1,
        kind: 1,
        name: 'test',
        signatures: [
          {
            parameters: [
              {
                id: 2,
                kind: 32768,
                name: 'name',
                type: { type: 'intrinsic', name: 'string' }
              }
            ],
            type: { type: 'intrinsic', name: 'string' }
          }
        ]
      };
      expect(typeDocJson['getTypeString'](reflection)).toBe(
        '(name: string) => string'
      );
    });
  });

  describe('formatDescription', () => {
    it('should format JSDoc comments', () => {
      const comment: TestComment = {
        summary: [{ text: 'Main description' }],
        blockTags: [
          {
            tag: '@param',
            name: 'name',
            content: [{ text: 'The name parameter' }]
          },
          {
            tag: '@returns',
            content: [{ text: 'A string value' }]
          }
        ]
      };

      const result = typeDocJson['formatDescription'](comment);

      expect(result).toHaveLength(3);
      expect(result[0].tag).toBe('@summary');
      expect(result[1].tag).toBe('@param');
      expect(result[2].tag).toBe('@returns');
    });

    it('should filter out specified tags', () => {
      const comment: TestComment = {
        summary: [{ text: 'Main description' }],
        blockTags: [
          { tag: '@default', content: [{ text: 'default value' }] },
          { tag: '@param', content: [{ text: 'param desc' }] }
        ]
      };

      const result = typeDocJson['formatDescription'](comment);

      expect(result).toHaveLength(2);
      expect(result[0].tag).toBe('@summary');
      expect(result[1].tag).toBe('@param');
    });

    it('should handle empty comments', () => {
      expect(typeDocJson['formatDescription'](null)).toHaveLength(0);
      expect(typeDocJson['formatDescription']({})).toHaveLength(0);
    });
  });

  describe('formatParameters', () => {
    it('should format simple parameters', () => {
      const parameters: MockParameterReflection[] = [
        {
          id: 1,
          kind: 32768, // ReflectionKind.Parameter
          name: 'name',
          type: { type: 'intrinsic', name: 'string' },
          comment: {
            summary: [{ text: 'The name parameter' }]
          },
          variant: 'test',
          traverse: () => {},
          toObject: () => ({}),
          fromObject: () => {}
        }
      ];

      const result = typeDocJson['formatParameters'](parameters as any);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        kind: 32768,
        name: 'name',
        typeString: 'string',
        descriptions: [
          {
            tag: '@summary',
            content: [{ text: 'The name parameter' }]
          }
        ]
      });
    });

    it('should format object parameters with nested properties', () => {
      const parameters: MockParameterReflection[] = [
        {
          id: 1,
          kind: 32768, // ReflectionKind.Parameter
          name: 'options',
          type: {
            type: 'reflection',
            declaration: {
              children: [
                {
                  id: 2,
                  kind: 1024, // ReflectionKind.Property
                  name: 'name',
                  type: { type: 'intrinsic', name: 'string' }
                }
              ]
            }
          },
          variant: 'test',
          traverse: () => {},
          toObject: () => ({}),
          fromObject: () => {}
        }
      ];

      const result = typeDocJson['formatParameters'](parameters as any);

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('options');
      expect(result[1].name).toBe('options.name');
    });

    it('should handle empty or invalid parameters', () => {
      expect(typeDocJson['formatParameters']([])).toHaveLength(0);
      expect(typeDocJson['formatParameters'](null as any)).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle TypeDoc conversion failure', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(Application.bootstrap).mockResolvedValueOnce({
        convert: vi.fn().mockResolvedValue(null),
        serializer: { projectToObject: vi.fn() }
      } as any);

      await expect(typeDocJson.onBefore()).rejects.toThrow(
        'Failed to convert project'
      );
    });

    it('should handle file writing errors', () => {
      vi.mocked(fsExtra.writeFileSync).mockImplementationOnce(() => {
        throw new Error('Write error');
      });

      expect(() => typeDocJson['writeJSON']({}, 'test.json')).toThrow(
        'Write error'
      );
    });

    it('should handle invalid reflection objects', () => {
      const invalidReflection: TestReflection = {
        id: 1,
        kind: 999999, // Invalid kind
        name: 'Invalid'
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = typeDocJson['convertReflectionToFormatValue'](
        invalidReflection as any
      );
      expect(result.kindName).toBe('Unknown');
    });
  });
});
