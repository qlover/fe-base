import { RuleTester } from '@typescript-eslint/rule-tester';
import {
  tsClassMemberAccessibility as rule,
  RULE_NAME
} from '../../src/rules/ts-class-member-accessibility';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // Public method
    {
      code: `
        class Example {
          public method(): void {
            console.log('Hello');
          }
        }
      `
    },
    // Private method
    {
      code: `
        class Example {
          private method(): void {
            console.log('Hello');
          }
        }
      `
    },
    // Protected method
    {
      code: `
        class Example {
          protected method(): void {
            console.log('Hello');
          }
        }
      `
    },
    // Constructor (allowed by default)
    {
      code: `
        class Example {
          constructor() {
            console.log('init');
          }
        }
      `
    },
    // Public property
    {
      code: `
        class Example {
          public value: number = 42;
        }
      `
    },
    // Private property
    {
      code: `
        class Example {
          private value: number = 42;
        }
      `
    },
    // Protected property
    {
      code: `
        class Example {
          protected value: number = 42;
        }
      `
    },
    // Getter with accessibility
    {
      code: `
        class Example {
          public get value(): number {
            return 42;
          }
        }
      `
    },
    // Setter with accessibility
    {
      code: `
        class Example {
          public set value(v: number) {
            this._value = v;
          }
        }
      `
    },
    // Static method with accessibility
    {
      code: `
        class Example {
          public static method(): void {
            console.log('static');
          }
        }
      `
    },
    // Static property with accessibility
    {
      code: `
        class Example {
          public static value: number = 42;
        }
      `
    },
    // Private field (#field) when allowPrivateFields is true
    {
      code: `
        class Example {
          #privateField: number = 42;
        }
      `,
      options: [{ allowPrivateFields: true }]
    },
    // Protected field when allowProtectedFields is true
    {
      code: `
        class Example {
          protected field: number = 42;
        }
      `,
      options: [{ allowProtectedFields: true }]
    },
    // Abstract method (has accessibility)
    {
      code: `
        abstract class Example {
          public abstract method(): void;
        }
      `
    },
    // Implicit public method when allowImplicitPublic is true
    {
      code: `
        class Example {
          method(): void {
            console.log('Hello');
          }
        }
      `,
      options: [{ allowImplicitPublic: true }]
    },
    // Implicit public property when allowImplicitPublic is true
    {
      code: `
        class Example {
          value: number = 42;
        }
      `,
      options: [{ allowImplicitPublic: true }]
    },
    // Implicit public static method when allowImplicitPublic is true
    {
      code: `
        class Example {
          static method(): void {
            console.log('static');
          }
        }
      `,
      options: [{ allowImplicitPublic: true }]
    },
    // Mix of implicit public and explicit modifiers when allowImplicitPublic is true
    {
      code: `
        class Example {
          method(): void {}
          private privateMethod(): void {}
          protected protectedMethod(): void {}
        }
      `,
      options: [{ allowImplicitPublic: true }]
    },
    // Computed method when allowComputedProperties is true
    {
      code: `
        class Example {
          [Symbol.iterator](): void {
            console.log('iterator');
          }
        }
      `,
      options: [{ allowComputedProperties: true }]
    },
    // Computed property when allowComputedProperties is true
    {
      code: `
        class Example {
          [getKey()]: number = 42;
        }
      `,
      options: [{ allowComputedProperties: true }]
    },
    // Computed static method when allowComputedProperties is true
    {
      code: `
        class Example {
          static [Symbol.iterator](): void {
            console.log('static iterator');
          }
        }
      `,
      options: [{ allowComputedProperties: true }]
    },
    // Computed static property when allowComputedProperties is true
    {
      code: `
        class Example {
          static [getKey()]: number = 42;
        }
      `,
      options: [{ allowComputedProperties: true }]
    },
    // Computed method with explicit modifier (always valid)
    {
      code: `
        class Example {
          public [Symbol.iterator](): void {
            console.log('iterator');
          }
        }
      `
    },
    // Computed property with explicit modifier (always valid)
    {
      code: `
        class Example {
          private [getKey()]: number = 42;
        }
      `
    },
    // Readonly property with accessibility
    {
      code: `
        class Example {
          public readonly value: number = 42;
        }
      `
    },
    // Private readonly property
    {
      code: `
        class Example {
          private readonly value: number = 42;
        }
      `
    },
    // Protected readonly property
    {
      code: `
        class Example {
          protected readonly value: number = 42;
        }
      `
    },
    // Static readonly property with accessibility
    {
      code: `
        class Example {
          public static readonly value: number = 42;
        }
      `
    },
    // Private static method
    {
      code: `
        class Example {
          private static method(): void {}
        }
      `
    },
    // Protected static method
    {
      code: `
        class Example {
          protected static method(): void {}
        }
      `
    },
    // Private static property
    {
      code: `
        class Example {
          private static value: number = 42;
        }
      `
    },
    // Protected static property
    {
      code: `
        class Example {
          protected static value: number = 42;
        }
      `
    },
    // Abstract class with private abstract method
    {
      code: `
        abstract class Example {
          private abstract method(): void;
        }
      `
    },
    // Abstract class with protected abstract method
    {
      code: `
        abstract class Example {
          protected abstract method(): void;
        }
      `
    },
    // Abstract class with private abstract static method
    {
      code: `
        abstract class Example {
          private abstract static method(): void;
        }
      `
    },
    // Abstract class with protected abstract static method
    {
      code: `
        abstract class Example {
          protected abstract static method(): void;
        }
      `
    },
    // Abstract class with non-abstract method (should have modifier)
    {
      code: `
        abstract class Example {
          public method(): void {}
        }
      `
    },
    // Abstract class with private non-abstract method
    {
      code: `
        abstract class Example {
          private method(): void {}
        }
      `
    },
    // Abstract class with protected non-abstract method
    {
      code: `
        abstract class Example {
          protected method(): void {}
        }
      `
    },
    // Abstract readonly property
    {
      code: `
        abstract class Example {
          public abstract readonly value: number;
        }
      `
    },
    // Private abstract readonly property
    {
      code: `
        abstract class Example {
          private abstract readonly value: number;
        }
      `
    },
    // Async method with accessibility
    {
      code: `
        class Example {
          public async fetch(): Promise<void> {}
        }
      `
    },
    // Private async method
    {
      code: `
        class Example {
          private async fetch(): Promise<void> {}
        }
      `
    },
    // Static async method with accessibility
    {
      code: `
        class Example {
          public static async fetch(): Promise<void> {}
        }
      `
    },
    // Getter with private modifier
    {
      code: `
        class Example {
          private get value(): number {
            return 42;
          }
        }
      `
    },
    // Getter with protected modifier
    {
      code: `
        class Example {
          protected get value(): number {
            return 42;
          }
        }
      `
    },
    // Setter with private modifier
    {
      code: `
        class Example {
          private set value(v: number) {
            this._value = v;
          }
        }
      `
    },
    // Setter with protected modifier
    {
      code: `
        class Example {
          protected set value(v: number) {
            this._value = v;
          }
        }
      `
    },
    // Static getter with accessibility
    {
      code: `
        class Example {
          public static get value(): number {
            return 42;
          }
        }
      `
    },
    // Static setter with accessibility
    {
      code: `
        class Example {
          public static set value(v: number) {
            Example._value = v;
          }
        }
      `
    },
    // Class expression
    {
      code: `
        const Example = class {
          public method(): void {}
        };
      `
    },
    // Nested class
    {
      code: `
        class Outer {
          public static Inner = class {
            public method(): void {}
          };
        }
      `
    },
    // Method with generic type parameters
    {
      code: `
        class Example {
          public method<T>(): T {
            return {} as T;
          }
        }
      `
    },
    // Static method with generic type parameters
    {
      code: `
        class Example {
          public static method<T>(): T {
            return {} as T;
          }
        }
      `
    },
    // Property with complex type
    {
      code: `
        class Example {
          public value: Map<string, number> = new Map();
        }
      `
    },
    // Method with return type annotation
    {
      code: `
        class Example {
          public method(): string {
            return 'hello';
          }
        }
      `
    },
    // Abstract method with return type
    {
      code: `
        abstract class Example {
          public abstract method(): string;
        }
      `
    },
    // Multiple modifiers combination: private static readonly
    {
      code: `
        class Example {
          private static readonly value: number = 42;
        }
      `
    },
    // Multiple modifiers combination: protected static readonly
    {
      code: `
        class Example {
          protected static readonly value: number = 42;
        }
      `
    },
    // Abstract static readonly property
    {
      code: `
        abstract class Example {
          public abstract static readonly value: number;
        }
      `
    },
    // Method with optional parameter
    {
      code: `
        class Example {
          public method(param?: string): void {}
        }
      `
    },
    // Method with default parameter
    {
      code: `
        class Example {
          public method(param: string = 'default'): void {}
        }
      `
    },
    // Method with rest parameter
    {
      code: `
        class Example {
          public method(...args: string[]): void {}
        }
      `
    },
    // Property without initializer
    {
      code: `
        class Example {
          public value!: number;
        }
      `
    },
    // Private field with explicit private modifier
    {
      code: `
        class Example {
          private #privateField: number = 42;
        }
      `
    },
    // Protected field with explicit protected modifier
    {
      code: `
        class Example {
          protected #protectedField: number = 42;
        }
      `
    },
    // Static private field
    {
      code: `
        class Example {
          private static #privateField: number = 42;
        }
      `
    },
    // Abstract getter
    {
      code: `
        abstract class Example {
          public abstract get value(): number;
        }
      `
    },
    // Abstract setter
    {
      code: `
        abstract class Example {
          public abstract set value(v: number);
        }
      `
    },
    // Abstract static getter
    {
      code: `
        abstract class Example {
          public abstract static get value(): number;
        }
      `
    },
    // Abstract static setter
    {
      code: `
        abstract class Example {
          public abstract static set value(v: number);
        }
      `
    },
    // Computed abstract method
    {
      code: `
        abstract class Example {
          public abstract [Symbol.iterator](): Iterator<number>;
        }
      `
    },
    // Computed abstract property
    {
      code: `
        abstract class Example {
          public abstract [getKey()]: number;
        }
      `
    },
    // Method with overload signatures (only implementation needs modifier)
    {
      code: `
        class Example {
          public method(): void;
          public method(param: string): void;
          public method(param?: string): void {}
        }
      `
    },
    // Static method with overload signatures
    {
      code: `
        class Example {
          public static method(): void;
          public static method(param: string): void;
          public static method(param?: string): void {}
        }
      `
    },
    // Class with all modifier types
    {
      code: `
        class Example {
          public publicMethod(): void {}
          private privateMethod(): void {}
          protected protectedMethod(): void {}
          public static staticMethod(): void {}
          private static privateStaticMethod(): void {}
          protected static protectedStaticMethod(): void {}
        }
      `
    },
    // Abstract class with all modifier types
    {
      code: `
        abstract class Example {
          public abstract abstractMethod(): void;
          private abstract privateAbstractMethod(): void;
          protected abstract protectedAbstractMethod(): void;
          public method(): void {}
          private privateMethod(): void {}
          protected protectedMethod(): void {}
        }
      `
    },
    // Override method with accessibility modifier
    {
      code: `
        class Base {
          public method(): void {}
        }
        class Derived extends Base {
          public override method(): void {}
        }
      `
    },
    // Override getter with accessibility modifier
    {
      code: `
        class Base {
          public get logger() { return console; }
        }
        class Derived extends Base {
          public override get logger() { return console; }
        }
      `
    },
    // Override setter with accessibility modifier
    {
      code: `
        class Base {
          public set value(v: number) {}
        }
        class Derived extends Base {
          public override set value(v: number) {}
        }
      `
    },
    // Override static method with accessibility modifier
    {
      code: `
        class Base {
          public static method(): void {}
        }
        class Derived extends Base {
          public override static method(): void {}
        }
      `
    },
    // Override property with accessibility modifier
    {
      code: `
        class Base {
          public value: number = 42;
        }
        class Derived extends Base {
          public override value: number = 100;
        }
      `
    }
  ],
  invalid: [
    // Method without accessibility modifier
    {
      code: `
        class Example {
          method(): void {
            console.log('Hello');
          }
        }
      `,
      output: `
        class Example {
          public method(): void {
            console.log('Hello');
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Property without accessibility modifier
    {
      code: `
        class Example {
          value: number = 42;
        }
      `,
      output: `
        class Example {
          public value: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Getter without accessibility modifier
    {
      code: `
        class Example {
          get value(): number {
            return 42;
          }
        }
      `,
      output: `
        class Example {
          public get value(): number {
            return 42;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 15
        }
      ]
    },
    // Setter without accessibility modifier
    {
      code: `
        class Example {
          set value(v: number) {
            this._value = v;
          }
        }
      `,
      output: `
        class Example {
          public set value(v: number) {
            this._value = v;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 15
        }
      ]
    },
    // Static method without accessibility modifier
    {
      code: `
        class Example {
          static method(): void {
            console.log('static');
          }
        }
      `,
      output: `
        class Example {
          public static method(): void {
            console.log('static');
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Static property without accessibility modifier
    {
      code: `
        class Example {
          static value: number = 42;
        }
      `,
      output: `
        class Example {
          public static value: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Multiple members without accessibility
    {
      code: `
        class Example {
          method1(): void {}
          method2(): void {}
          value1: number = 1;
          value2: string = 'test';
        }
      `,
      output: `
        class Example {
          public method1(): void {}
          public method2(): void {}
          public value1: number = 1;
          public value2: string = 'test';
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        },
        {
          messageId: 'missingAccessibility',
          line: 4,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 5,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 6,
          column: 11
        }
      ]
    },
    // Private field (#field) when allowPrivateFields is false
    {
      code: `
        class Example {
          #privateField: number = 42;
        }
      `,
      output: `
        class Example {
          public #privateField: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Constructor when not allowed
    {
      code: `
        class Example {
          constructor() {
            console.log('init');
          }
        }
      `,
      output: `
        class Example {
          public constructor() {
            console.log('init');
          }
        }
      `,
      options: [{ allowConstructors: false }],
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Computed method without accessibility modifier (default behavior)
    {
      code: `
        class Example {
          [Symbol.iterator](): void {
            console.log('iterator');
          }
        }
      `,
      output: `
        class Example {
          public [Symbol.iterator](): void {
            console.log('iterator');
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Computed property without accessibility modifier (default behavior)
    {
      code: `
        class Example {
          [getKey()]: number = 42;
        }
      `,
      output: `
        class Example {
          public [getKey()]: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Computed static method without accessibility modifier (default behavior)
    {
      code: `
        class Example {
          static [Symbol.iterator](): void {
            console.log('static iterator');
          }
        }
      `,
      output: `
        class Example {
          public static [Symbol.iterator](): void {
            console.log('static iterator');
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Computed static property without accessibility modifier (default behavior)
    {
      code: `
        class Example {
          static [getKey()]: number = 42;
        }
      `,
      output: `
        class Example {
          public static [getKey()]: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Abstract method without accessibility modifier
    {
      code: `
        abstract class Example {
          abstract method(): void;
        }
      `,
      output: `
        abstract class Example {
          public abstract method(): void;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Abstract static method without accessibility modifier
    {
      code: `
        abstract class Example {
          abstract static method(): void;
        }
      `,
      output: `
        abstract class Example {
          public abstract static method(): void;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Readonly property without accessibility modifier
    {
      code: `
        class Example {
          readonly value: number = 42;
        }
      `,
      output: `
        class Example {
          public readonly value: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Static readonly property without accessibility modifier
    {
      code: `
        class Example {
          static readonly value: number = 42;
        }
      `,
      output: `
        class Example {
          public static readonly value: number = 42;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Static method without accessibility modifier (method name suggests private but rule inserts public)
    {
      code: `
        class Example {
          static privateMethod(): void {}
        }
      `,
      output: `
        class Example {
          public static privateMethod(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Static method without accessibility modifier (method name suggests protected but rule inserts public)
    {
      code: `
        class Example {
          static protectedMethod(): void {}
        }
      `,
      output: `
        class Example {
          public static protectedMethod(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Abstract class with non-abstract method without modifier
    {
      code: `
        abstract class Example {
          method(): void {}
        }
      `,
      output: `
        abstract class Example {
          public method(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Abstract class with static method without modifier
    {
      code: `
        abstract class Example {
          static method(): void {}
        }
      `,
      output: `
        abstract class Example {
          public static method(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Abstract readonly property without modifier
    {
      code: `
        abstract class Example {
          abstract readonly value: number;
        }
      `,
      output: `
        abstract class Example {
          public abstract readonly value: number;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Async method without accessibility modifier
    {
      code: `
        class Example {
          async fetch(): Promise<void> {}
        }
      `,
      output: `
        class Example {
          public async fetch(): Promise<void> {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Static async method without accessibility modifier
    {
      code: `
        class Example {
          static async fetch(): Promise<void> {}
        }
      `,
      output: `
        class Example {
          public static async fetch(): Promise<void> {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Static getter without accessibility modifier
    {
      code: `
        class Example {
          static get value(): number {
            return 42;
          }
        }
      `,
      output: `
        class Example {
          public static get value(): number {
            return 42;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Static setter without accessibility modifier
    {
      code: `
        class Example {
          static set value(v: number) {
            Example._value = v;
          }
        }
      `,
      output: `
        class Example {
          public static set value(v: number) {
            Example._value = v;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Class expression without modifier
    {
      code: `
        const Example = class {
          method(): void {}
        };
      `,
      output: `
        const Example = class {
          public method(): void {}
        };
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Nested class without modifier
    {
      code: `
        class Outer {
          static Inner = class {
            method(): void {}
          };
        }
      `,
      output: `
        class Outer {
          public static Inner = class {
            public method(): void {}
          };
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        },
        {
          messageId: 'missingAccessibility',
          line: 4,
          column: 13
        }
      ]
    },
    // Generic method without accessibility modifier
    {
      code: `
        class Example {
          method<T>(): T {
            return {} as T;
          }
        }
      `,
      output: `
        class Example {
          public method<T>(): T {
            return {} as T;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Static generic method without accessibility modifier
    {
      code: `
        class Example {
          static method<T>(): T {
            return {} as T;
          }
        }
      `,
      output: `
        class Example {
          public static method<T>(): T {
            return {} as T;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Property with complex type without modifier
    {
      code: `
        class Example {
          value: Map<string, number> = new Map();
        }
      `,
      output: `
        class Example {
          public value: Map<string, number> = new Map();
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Method with return type without modifier
    {
      code: `
        class Example {
          method(): string {
            return 'hello';
          }
        }
      `,
      output: `
        class Example {
          public method(): string {
            return 'hello';
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Abstract method with return type without modifier
    {
      code: `
        abstract class Example {
          abstract method(): string;
        }
      `,
      output: `
        abstract class Example {
          public abstract method(): string;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Abstract static readonly property without modifier
    {
      code: `
        abstract class Example {
          abstract static readonly value: number;
        }
      `,
      output: `
        abstract class Example {
          public abstract static readonly value: number;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Method with optional parameter without modifier
    {
      code: `
        class Example {
          method(param?: string): void {}
        }
      `,
      output: `
        class Example {
          public method(param?: string): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Method with default parameter without modifier
    {
      code: `
        class Example {
          method(param: string = 'default'): void {}
        }
      `,
      output: `
        class Example {
          public method(param: string = 'default'): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Method with rest parameter without modifier
    {
      code: `
        class Example {
          method(...args: string[]): void {}
        }
      `,
      output: `
        class Example {
          public method(...args: string[]): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Property without initializer without modifier
    {
      code: `
        class Example {
          value!: number;
        }
      `,
      output: `
        class Example {
          public value!: number;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Abstract getter without modifier
    {
      code: `
        abstract class Example {
          abstract get value(): number;
        }
      `,
      output: `
        abstract class Example {
          public abstract get value(): number;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Abstract setter without modifier
    {
      code: `
        abstract class Example {
          abstract set value(v: number);
        }
      `,
      output: `
        abstract class Example {
          public abstract set value(v: number);
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Abstract static getter without modifier
    {
      code: `
        abstract class Example {
          abstract static get value(): number;
        }
      `,
      output: `
        abstract class Example {
          public abstract static get value(): number;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Abstract static setter without modifier
    {
      code: `
        abstract class Example {
          abstract static set value(v: number);
        }
      `,
      output: `
        abstract class Example {
          public abstract static set value(v: number);
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Computed abstract method without modifier
    {
      code: `
        abstract class Example {
          abstract [Symbol.iterator](): Iterator<number>;
        }
      `,
      output: `
        abstract class Example {
          public abstract [Symbol.iterator](): Iterator<number>;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Computed abstract property without modifier
    {
      code: `
        abstract class Example {
          abstract [getKey()]: number;
        }
      `,
      output: `
        abstract class Example {
          public abstract [getKey()]: number;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 3,
          column: 11
        }
      ]
    },
    // Complex class with multiple missing modifiers
    {
      code: `
        class Example {
          method1(): void {}
          method2(): void {}
          value1: number = 1;
          value2: string = 'test';
          static staticMethod(): void {}
          static staticValue: number = 42;
          readonly readonlyValue: number = 100;
          static readonly staticReadonlyValue: number = 200;
          async asyncMethod(): Promise<void> {}
          get getter(): number { return 42; }
          set setter(v: number) { this._value = v; }
        }
      `,
      output: `
        class Example {
          public method1(): void {}
          public method2(): void {}
          public value1: number = 1;
          public value2: string = 'test';
          public static staticMethod(): void {}
          public static staticValue: number = 42;
          public readonly readonlyValue: number = 100;
          public static readonly staticReadonlyValue: number = 200;
          public async asyncMethod(): Promise<void> {}
          public get getter(): number { return 42; }
          public set setter(v: number) { this._value = v; }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        },
        {
          messageId: 'missingAccessibility',
          line: 4,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 5,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 6,
          column: 11
        },
        {
          messageId: 'missingAccessibility',
          line: 7,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 8,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 9,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 10,
          column: 11
        },
        {
          messageId: 'missingAccessibility',
          line: 11,
          column: 11
        },
        {
          messageId: 'missingAccessibility',
          line: 12,
          column: 15
        },
        {
          messageId: 'missingAccessibility',
          line: 13,
          column: 15
        }
      ]
    },
    // Complex abstract class with multiple missing modifiers
    {
      code: `
        abstract class Example {
          abstract abstractMethod(): void;
          abstract static abstractStaticMethod(): void;
          abstract readonly abstractReadonlyValue: number;
          abstract static readonly abstractStaticReadonlyValue: number;
          method(): void {}
          static staticMethod(): void {}
          readonly readonlyValue: number = 100;
          static readonly staticReadonlyValue: number = 200;
        }
      `,
      output: `
        abstract class Example {
          public abstract abstractMethod(): void;
          public abstract static abstractStaticMethod(): void;
          public abstract readonly abstractReadonlyValue: number;
          public abstract static readonly abstractStaticReadonlyValue: number;
          public method(): void {}
          public static staticMethod(): void {}
          public readonly readonlyValue: number = 100;
          public static readonly staticReadonlyValue: number = 200;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        },
        {
          messageId: 'missingAccessibility',
          line: 4,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 5,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 6,
          column: 11
        },
        {
          messageId: 'missingAccessibility',
          line: 7,
          column: 11
        },
        {
          messageId: 'missingAccessibility',
          line: 8,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 9,
          column: 11
        },
        {
          messageId: 'missingAccessibilityProperty',
          line: 10,
          column: 11
        }
      ]
    },
    // Method without async keyword but with async arrow function inside
    // The fix should add 'public' to the method, not to the arrow function
    {
      code: `
        class Example {
          onExec(context: unknown, task: unknown): unknown {
            const withErrorTask = async () => {
              return await task(context);
            };
            return withErrorTask();
          }
        }
      `,
      output: `
        class Example {
          public onExec(context: unknown, task: unknown): unknown {
            const withErrorTask = async () => {
              return await task(context);
            };
            return withErrorTask();
          }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 3,
          column: 11
        }
      ]
    },
    // Override method without accessibility modifier
    {
      code: `
        class Base {
          public method(): void {}
        }
        class Derived extends Base {
          override method(): void {}
        }
      `,
      output: `
        class Base {
          public method(): void {}
        }
        class Derived extends Base {
          public override method(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 6,
          column: 11
        }
      ]
    },
    // Override getter without accessibility modifier
    {
      code: `
        class Base {
          public get logger() { return console; }
        }
        class Derived extends Base {
          override get logger() { return console; }
        }
      `,
      output: `
        class Base {
          public get logger() { return console; }
        }
        class Derived extends Base {
          public override get logger() { return console; }
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 6,
          column: 11
        }
      ]
    },
    // Override setter without accessibility modifier
    {
      code: `
        class Base {
          public set value(v: number) {}
        }
        class Derived extends Base {
          override set value(v: number) {}
        }
      `,
      output: `
        class Base {
          public set value(v: number) {}
        }
        class Derived extends Base {
          public override set value(v: number) {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 6,
          column: 11
        }
      ]
    },
    // Override static method without accessibility modifier
    {
      code: `
        class Base {
          public static method(): void {}
        }
        class Derived extends Base {
          override static method(): void {}
        }
      `,
      output: `
        class Base {
          public static method(): void {}
        }
        class Derived extends Base {
          public override static method(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibility',
          line: 6,
          column: 11
        }
      ]
    },
    // Override property without accessibility modifier
    {
      code: `
        class Base {
          public value: number = 42;
        }
        class Derived extends Base {
          override value: number = 100;
        }
      `,
      output: `
        class Base {
          public value: number = 42;
        }
        class Derived extends Base {
          public override value: number = 100;
        }
      `,
      errors: [
        {
          messageId: 'missingAccessibilityProperty',
          line: 6,
          column: 11
        }
      ]
    }
  ]
});
