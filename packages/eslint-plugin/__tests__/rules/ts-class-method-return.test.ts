import { RuleTester } from '@typescript-eslint/rule-tester';
import {
  tsClassMethodReturn as rule,
  RULE_NAME
} from '../../src/rules/ts-class-method-return';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // Basic method with return type
    {
      code: `
        class Example {
          method(): boolean {
            return true;
          }
        }
      `
    },
    // Void return type
    {
      code: `
        class Example {
          method(): void {
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
    // Private method with return type
    {
      code: `
        class Example {
          #privateMethod(): string {
            return 'private';
          }
        }
      `
    },
    // Getter with return type
    {
      code: `
        class Example {
          get value(): number {
            return 42;
          }
        }
      `
    },
    // Setter (should be skipped - setters cannot have return types)
    {
      code: `
        class Example {
          set value(v: number) {
            this._value = v;
          }
        }
      `
    },
    // Generic method with return type
    {
      code: `
        class Example {
          generic<T>(value: T): T {
            return value;
          }
        }
      `
    },
    // Arrow function property with return type
    {
      code: `
        class Example {
          arrowMethod = (): string => {
            return 'arrow';
          }
        }
      `
    },
    // Private method (when allowPrivateMethods is true)
    {
      code: `
        class Example {
          #privateMethod() {
            return 'private';
          }
        }
      `,
      options: [{ allowPrivateMethods: true }]
    }
  ],
  invalid: [
    // Basic method without return type
    {
      code: `
        class Example {
          method() {
            return true;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          column: 11
        }
      ]
    },
    // Async method without return type
    {
      code: `
        class Example {
          async method() {
            return Promise.resolve(true);
          }
        }
      `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          column: 17
        }
      ]
    },
    // Private method without return type
    {
      code: `
        class Example {
          #privateMethod() {
            return 'private';
          }
        }
      `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          column: 11
        }
      ]
    },
    // Getter without return type
    {
      code: `
        class Example {
          get value() {
            return 42;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          column: 15
        }
      ]
    },
    // Generic method without return type
    {
      code: `
        class Example {
          generic<T>(value: T) {
            return value;
          }
        }
      `,
      errors: [
        {
          messageId: 'missingReturnType',
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
      options: [{ allowConstructors: false }],
      errors: [
        {
          messageId: 'missingReturnType',
          line: 3,
          column: 11
        }
      ]
    }
  ]
});
