import { RuleTester } from '@typescript-eslint/rule-tester';
import {
  tsRequireOverrideComment as rule,
  RULE_NAME
} from '../../src/rules/ts-require-override-comment';

const ruleTester = new RuleTester();

ruleTester.run(RULE_NAME, rule, {
  valid: [
    // Class implementing interface with @override comment
    {
      code: `
        interface A {
          do(): void;
        }
        class B implements A {
          /** @override */
          do(): void {}
        }
      `
    },
    // Class implementing interface with @override comment (with description)
    {
      code: `
        interface A {
          do(): void;
        }
        class B implements A {
          /** @override Implementation of interface method */
          do(): void {}
        }
      `
    },
    // Class implementing interface with @override comment (multiline)
    {
      code: `
        interface A {
          do(): void;
        }
        class B implements A {
          /**
           * @override
           * Implementation of interface method
           */
          do(): void {}
        }
      `
    },
    // Class not implementing interface (no check needed)
    {
      code: `
        class B {
          do(): void {}
        }
      `
    },
    // Class implementing interface but constructor doesn't need @override
    {
      code: `
        interface A {
          do(): void;
        }
        class B implements A {
          constructor() {}
          /** @override */
          do(): void {}
        }
      `
    },
    // Class implementing interface but private method doesn't need @override
    {
      code: `
        interface A {
          do(): void;
        }
        class B implements A {
          /** @override */
          do(): void {}
          #privateMethod(): void {}
        }
      `
    },
    // Multiple methods with @override comments
    {
      code: `
        interface A {
          do(): void;
          run(): void;
        }
        class B implements A {
          /** @override */
          do(): void {}
          /** @override */
          run(): void {}
        }
      `
    },
    // Class implementing multiple interfaces
    {
      code: `
        interface A {
          do(): void;
        }
        interface B {
          run(): void;
        }
        class C implements A, B {
          /** @override */
          do(): void {}
          /** @override */
          run(): void {}
        }
      `
    },
    // Anonymous class implementing interface
    {
      code: `
        interface A {
          do(): void;
        }
        const B = class implements A {
          /** @override */
          do(): void {}
        };
      `
    },
    // Static method (doesn't need @override as it can't implement interface methods)
    {
      code: `
        interface A {
          do(): void;
        }
        class B implements A {
          /** @override */
          do(): void {}
          static helper(): void {}
        }
      `
    },
    // Getter with @override comment
    {
      code: `
        interface A {
          get value(): string;
        }
        class B implements A {
          /** @override */
          get value(): string {
            return 'test';
          }
        }
      `
    },
    // Setter with @override comment
    {
      code: `
        interface A {
          set value(v: string);
        }
        class B implements A {
          /** @override */
          set value(v: string) {}
        }
      `
    }
  ],
  invalid: [
    // Class implementing interface without @override comment
    {
      code: `
        interface A {
          do(): void;
        }
        class B implements A {
          do(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideComment',
          line: 6,
          column: 11
        }
      ],
      output: `
        interface A {
          do(): void;
        }
        class B implements A {
          /** @override */
          do(): void {}
        }
      `
    },
    // Multiple methods without @override comments
    {
      code: `
        interface A {
          do(): void;
          run(): void;
        }
        class B implements A {
          do(): void {}
          run(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideComment',
          line: 7,
          column: 11
        },
        {
          messageId: 'missingOverrideComment',
          line: 8,
          column: 11
        }
      ],
      output: `
        interface A {
          do(): void;
          run(): void;
        }
        class B implements A {
          /** @override */
          do(): void {}
          /** @override */
          run(): void {}
        }
      `
    },
    // Method with comment but without @override tag
    // Note: This case has existing JSDoc comment, so auto-fix won't apply (no output field)
    {
      code: `
        interface A {
          do(): void;
        }
        class B implements A {
          /** Some comment */
          do(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideComment',
          line: 7,
          column: 11
        }
      ]
    },
    // Class implementing multiple interfaces without @override comments
    {
      code: `
        interface A {
          do(): void;
        }
        interface B {
          run(): void;
        }
        class C implements A, B {
          do(): void {}
          run(): void {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideComment',
          line: 9,
          column: 11
        },
        {
          messageId: 'missingOverrideComment',
          line: 10,
          column: 11
        }
      ],
      output: `
        interface A {
          do(): void;
        }
        interface B {
          run(): void;
        }
        class C implements A, B {
          /** @override */
          do(): void {}
          /** @override */
          run(): void {}
        }
      `
    },
    // Anonymous class without @override comment
    {
      code: `
        interface A {
          do(): void;
        }
        const B = class implements A {
          do(): void {}
        };
      `,
      errors: [
        {
          messageId: 'missingOverrideComment',
          line: 6,
          column: 11
        }
      ],
      output: `
        interface A {
          do(): void;
        }
        const B = class implements A {
          /** @override */
          do(): void {}
        };
      `
    },
    // Getter method without @override
    {
      code: `
        interface A {
          get value(): string;
        }
        class B implements A {
          get value(): string {
            return 'test';
          }
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideComment',
          line: 6,
          column: 15
        }
      ],
      output: `
        interface A {
          get value(): string;
        }
        class B implements A {
          /** @override */
          get value(): string {
            return 'test';
          }
        }
      `
    },
    // Setter method without @override
    {
      code: `
        interface A {
          set value(v: string);
        }
        class B implements A {
          set value(v: string) {}
        }
      `,
      errors: [
        {
          messageId: 'missingOverrideComment',
          line: 6,
          column: 15
        }
      ],
      output: `
        interface A {
          set value(v: string);
        }
        class B implements A {
          /** @override */
          set value(v: string) {}
        }
      `
    }
  ]
});
