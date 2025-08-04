/**
 * HBSTemplate test-suite
 *
 * Coverage:
 * 1. constructor       - Constructor tests with different configurations
 * 2. getTemplate      - Template content retrieval tests
 * 3. compile          - Single context compilation tests
 * 4. compileSource    - Batch compilation tests with different reflection kinds
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HBSTemplate } from '../../src/implments/HBSTemplate';
import { ReflectionKind } from 'typedoc';
import {
  FormatProjectValue,
  ReflectionKindName,
  FormatProjectKindName,
  ValueOf
} from '../../src/type';
import fsExtra from 'fs-extra';
import { join, resolve } from 'path';
import Handlebars from 'handlebars';

// Mock fs-extra
vi.mock('fs-extra', () => ({
  default: {
    readFileSync: vi.fn()
  }
}));

describe('HBSTemplate', () => {
  const mockTemplateContent = '# {{name}}\n\n{{description}}';
  const mockHbsRootDir = './templates';
  const resolvedMockHbsRootDir = resolve(mockHbsRootDir);

  // Test data
  const mockContext: FormatProjectValue = {
    id: 1,
    kind: ReflectionKind.Interface,
    kindName: 'Interface' as FormatProjectKindName,
    name: 'TestInterface',
    typeString: 'interface TestInterface',
    descriptions: []
  };

  const mockContextMap = {
    Project: [],
    Module: [],
    Namespace: [],
    Enum: [],
    EnumMember: [],
    Variable: [],
    Function: [],
    Class: [
      {
        id: 2,
        kind: ReflectionKind.Class,
        kindName: 'Class' as FormatProjectKindName,
        name: 'Class1',
        typeString: 'class Class1',
        descriptions: []
      }
    ],
    Interface: [
      {
        id: 3,
        kind: ReflectionKind.Interface,
        kindName: 'Interface' as FormatProjectKindName,
        name: 'Interface1',
        typeString: 'interface Interface1',
        descriptions: []
      },
      {
        id: 4,
        kind: ReflectionKind.Interface,
        kindName: 'Interface' as FormatProjectKindName,
        name: 'Interface2',
        typeString: 'interface Interface2',
        descriptions: []
      }
    ],
    Constructor: [],
    Property: [],
    Method: [],
    CallSignature: [],
    IndexSignature: [],
    ConstructorSignature: [],
    Parameter: [],
    TypeLiteral: [],
    TypeParameter: [],
    Accessor: [],
    GetSignature: [],
    SetSignature: [],
    TypeAlias: [],
    Reference: []
  } as const satisfies Record<
    ValueOf<typeof ReflectionKindName>,
    FormatProjectValue[]
  >;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    // Setup default mock implementation
    (fsExtra.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(
      mockTemplateContent
    );
  });

  afterEach(() => {
    // Clean up registered helpers
    Object.keys(Handlebars.helpers).forEach((key) => {
      delete (Handlebars.helpers as Record<string, unknown>)[key];
    });
  });

  describe('constructor', () => {
    it('should create instance with default name', () => {
      const template = new HBSTemplate({ hbsRootDir: mockHbsRootDir });
      expect(template).toBeInstanceOf(HBSTemplate);
      expect(fsExtra.readFileSync).toHaveBeenCalledWith(
        join(resolvedMockHbsRootDir, 'context.hbs'),
        'utf-8'
      );
    });

    it('should create instance with custom name without extension', () => {
      const template = new HBSTemplate({
        name: 'custom',
        hbsRootDir: mockHbsRootDir
      });
      expect(template).toBeInstanceOf(HBSTemplate);
      expect(fsExtra.readFileSync).toHaveBeenCalledWith(
        join(resolvedMockHbsRootDir, 'custom.hbs'),
        'utf-8'
      );
    });

    it('should create instance with custom name with .hbs extension', () => {
      const template = new HBSTemplate({
        name: 'custom.hbs',
        hbsRootDir: mockHbsRootDir
      });
      expect(template).toBeInstanceOf(HBSTemplate);
      expect(fsExtra.readFileSync).toHaveBeenCalledWith(
        join(resolvedMockHbsRootDir, 'custom.hbs'),
        'utf-8'
      );
    });

    it('should register custom helpers when provided', () => {
      const mockHelper = vi.fn((text: string) => text.toUpperCase());
      const template = new HBSTemplate({
        hbsRootDir: mockHbsRootDir,
        hbsHelpers: {
          uppercase: mockHelper
        }
      });
      expect(template).toBeInstanceOf(HBSTemplate);
      expect(Handlebars.helpers).toHaveProperty('uppercase');
    });

    it('should throw error when template file cannot be read', () => {
      (fsExtra.readFileSync as ReturnType<typeof vi.fn>).mockImplementation(
        () => {
          throw new Error('File not found');
        }
      );
      expect(() => new HBSTemplate({ hbsRootDir: mockHbsRootDir })).toThrow(
        'File not found'
      );
    });
  });

  describe('getTemplate', () => {
    it('should return template content', () => {
      const template = new HBSTemplate({ hbsRootDir: mockHbsRootDir });
      expect(template.getTemplate()).toBe(mockTemplateContent);
    });
  });

  describe('compile', () => {
    it('should compile template with single context', () => {
      const template = new HBSTemplate({ hbsRootDir: mockHbsRootDir });
      const result = template.compile(mockContext);
      expect(result).toContain('TestInterface');
    });

    it('should compile template with runtime options', () => {
      const template = new HBSTemplate({ hbsRootDir: mockHbsRootDir });
      const options = { allowProtoPropertiesByDefault: true };
      const result = template.compile(mockContext, options);
      expect(result).toContain('TestInterface');
    });

    it('should handle custom helpers in compilation', () => {
      const template = new HBSTemplate({
        hbsRootDir: mockHbsRootDir,
        hbsHelpers: {
          uppercase: (text: string) => text.toUpperCase()
        }
      });
      // Mock a simpler template for this test
      (fsExtra.readFileSync as ReturnType<typeof vi.fn>).mockReturnValue(
        '{{uppercase name}}'
      );
      const result = template.compile(mockContext);
      expect(result).toBe('# TestInterface\n\n');
    });
  });

  describe('compileSource', () => {
    it('should compile multiple contexts in correct order', () => {
      const template = new HBSTemplate({ hbsRootDir: mockHbsRootDir });
      const result = template.compileSource(mockContextMap);

      // Check order: Interfaces should come before Classes
      const interface1Index = result.indexOf('Interface1');
      const interface2Index = result.indexOf('Interface2');
      const class1Index = result.indexOf('Class1');

      expect(interface1Index).toBeLessThan(class1Index);
      expect(interface2Index).toBeLessThan(class1Index);
    });

    it('should handle empty context map', () => {
      const template = new HBSTemplate({ hbsRootDir: mockHbsRootDir });
      const emptyMap = {
        Project: [],
        Module: [],
        Namespace: [],
        Enum: [],
        EnumMember: [],
        Variable: [],
        Function: [],
        Class: [],
        Interface: [],
        Constructor: [],
        Property: [],
        Method: [],
        CallSignature: [],
        IndexSignature: [],
        ConstructorSignature: [],
        Parameter: [],
        TypeLiteral: [],
        TypeParameter: [],
        Accessor: [],
        GetSignature: [],
        SetSignature: [],
        TypeAlias: [],
        Reference: []
      } as const satisfies Record<
        ValueOf<typeof ReflectionKindName>,
        FormatProjectValue[]
      >;
      const result = template.compileSource(emptyMap);
      expect(result).toBe('');
    });

    it('should handle unknown reflection kinds', () => {
      const template = new HBSTemplate({ hbsRootDir: mockHbsRootDir });
      const result = template.compileSource(mockContextMap);
      expect(result).toContain('Interface1');
      expect(result).toContain('Class1');
    });
  });
});
