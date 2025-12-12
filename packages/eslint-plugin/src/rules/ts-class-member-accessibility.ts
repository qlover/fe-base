import type { TSESTree } from '@typescript-eslint/types';
import { createEslintRule } from '../utils/createEslintRule';
import type { TSESLint } from '@typescript-eslint/utils';

/**
 * Message IDs for error reporting
 */
type MessageIds = 'missingAccessibility' | 'missingAccessibilityProperty';

/**
 * Configuration options for the rule
 *
 * @property allowConstructors - Whether to allow constructors without explicit accessibility modifiers
 * @property allowPrivateFields - Whether to allow private fields (#field) without explicit accessibility modifiers
 * @property allowProtectedFields - Whether to allow protected fields without explicit accessibility modifiers
 * @property allowImplicitPublic - Whether to allow implicit public members (members without explicit modifiers)
 * @property allowComputedProperties - Whether to allow computed properties ([key]) without explicit accessibility modifiers
 */
type Options = readonly [
  {
    /**
     * Allow constructors to omit accessibility modifiers
     * @default true
     *
     * **Meaning:**
     * When `true`, constructors are exempt from requiring explicit accessibility modifiers.
     * When `false`, constructors must have an explicit modifier (typically `public`).
     *
     * **Use cases:**
     * 1. **Default behavior (true)**: Most codebases prefer `constructor()` over `public constructor()`
     *    - Constructors are always public in TypeScript
     *    - Omitting the modifier is more concise and idiomatic
     *    - Example: `constructor() {}` ✅ (when allowConstructors: true)
     *
     * 2. **Strict mode (false)**: Enforce explicit modifiers for consistency
     *    - Useful for teams wanting complete explicitness
     *    - Forces `public constructor() {}` syntax
     *    - Example: `public constructor() {}` ✅ (when allowConstructors: false)
     *
     * **Other scenarios:**
     * - Codebases migrating from Java/C# where constructors always have modifiers
     * - Teams with strict "no implicit modifiers" policies
     * - When using other tools that require explicit constructor modifiers
     */
    allowConstructors?: boolean;
    /**
     * Allow implicit public members (members without explicit modifiers)
     * @default false
     *
     * **Meaning:**
     * When `true`, class members without explicit accessibility modifiers are allowed.
     * These members are implicitly public in TypeScript.
     * When `false`, all members must have explicit modifiers (public, private, or protected).
     *
     * **Use cases:**
     * 1. **Default behavior (false)**: Require explicit modifiers for all members
     *    - Forces `public method() {}` instead of `method() {}`
     *    - Ensures complete explicitness
     *    - Example: `public method() {}` ✅ (when allowImplicitPublic: false)
     *
     * 2. **Allow implicit public (true)**: Accept members without modifiers
     *    - TypeScript's default behavior: members without modifiers are public
     *    - More concise syntax: `method() {}` instead of `public method() {}`
     *    - Example: `method() {}` ✅ (when allowImplicitPublic: true)
     *
     * **Other scenarios:**
     * - Teams preferring TypeScript's default implicit public behavior
     * - Codebases where public is the dominant visibility and explicit `public` is considered verbose
     * - When migrating from JavaScript where public is implicit
     * - Projects with many public members where requiring `public` adds verbosity
     * - Teams that want to focus on explicit private/protected but allow implicit public
     *
     * **Note:** This option applies to all class members (methods and properties) except:
     * - Constructors (controlled by `allowConstructors`)
     * - Private fields with # syntax (controlled by `allowPrivateFields`)
     * - Computed properties (controlled by `allowComputedProperties`)
     */
    allowImplicitPublic?: boolean;
    /**
     * Allow private fields (using # syntax) to omit accessibility modifiers
     * @default false
     *
     * **Meaning:**
     * When `true`, private identifier fields (`#field`) are exempt from requiring the `private` keyword.
     * When `false`, even `#field` syntax requires explicit `private #field` modifier.
     *
     * **Use cases:**
     * 1. **Default behavior (false)**: Require `private #field` for consistency
     *    - Ensures all private members use the same syntax pattern
     *    - Example: `private #field: number = 42` ✅ (when allowPrivateFields: false)
     *
     * 2. **Allow # syntax (true)**: Accept `#field` without redundant `private` keyword
     *    - The `#` syntax already makes privacy explicit
     *    - Reduces redundancy: `#field` vs `private #field`
     *    - Example: `#field: number = 42` ✅ (when allowPrivateFields: true)
     *
     * **Other scenarios:**
     * - Teams using modern JavaScript private fields exclusively
     * - Codebases preferring `#field` syntax over `private field` syntax
     * - When migrating from JavaScript classes with # fields to TypeScript
     * - Projects where `#field` is the standard and `private` keyword is considered redundant
     *
     * **Note:** This only applies to private identifier fields (`#field`), not `private field` syntax.
     * Regular `private field` syntax always requires the modifier regardless of this option.
     */
    allowPrivateFields?: boolean;
    /**
     * Allow protected fields to omit accessibility modifiers
     * @default false
     *
     * **Meaning:**
     * When `true`, fields with `protected` modifier are allowed (though they already have a modifier).
     * When `false`, all fields must have explicit modifiers.
     *
     * **Current limitation:**
     * This option has limited practical use in current TypeScript because:
     * - Fields without modifiers are implicitly `public`, not `protected`
     * - `protected` requires explicit declaration: `protected field: number`
     * - There's no way to have "implicit protected" fields in TypeScript
     *
     * **Use cases (limited):**
     * 1. **Reserved for future use**: If TypeScript adds support for implicit protected visibility
     * 2. **Special tooling**: Some code generation tools or transformers might use this
     * 3. **Consistency**: For symmetry with other options, though functionally redundant
     *
     * **Other scenarios:**
     * - Currently, this option doesn't provide practical benefit
     * - May be useful if TypeScript introduces new visibility semantics
     * - Could be used by custom AST transformers or code generators
     *
     * **Recommendation:** Keep this option at default (`false`) unless you have a specific use case.
     */
    allowProtectedFields?: boolean;
    /**
     * Allow computed properties (using bracket notation) to omit accessibility modifiers
     * @default false
     *
     * **Meaning:**
     * When `true`, computed property names (e.g., `[Symbol.iterator]`, `[getKey()]`) are exempt
     * from requiring explicit accessibility modifiers.
     * When `false`, computed properties must have explicit modifiers (public, private, or protected).
     *
     * **Use cases:**
     * 1. **Default behavior (false)**: Require explicit modifiers for computed properties
     *    - Ensures all members use consistent syntax pattern
     *    - Example: `public [Symbol.iterator]() {}` ✅ (when allowComputedProperties: false)
     *
     * 2. **Allow computed properties (true)**: Accept computed properties without modifiers
     *    - Computed properties are often used for special methods (e.g., iterators, symbols)
     *    - The bracket notation already makes them visually distinct
     *    - Reduces verbosity: `[Symbol.iterator]() {}` vs `public [Symbol.iterator]() {}`
     *    - Example: `[Symbol.iterator]() {}` ✅ (when allowComputedProperties: true)
     *
     * **Other scenarios:**
     * - Codebases with many computed properties where explicit modifiers add verbosity
     * - Teams using computed properties primarily for well-known symbols (Symbol.iterator, etc.)
     * - Projects where computed properties are considered "special" and don't need explicit modifiers
     * - When migrating from JavaScript where computed properties don't have modifiers
     *
     * **Note:** This applies to both computed methods and computed properties:
     * - Computed methods: `[Symbol.iterator]() {}`
     * - Computed properties: `[getKey()]: number = 42`
     */
    allowComputedProperties?: boolean;
  }
];

export const RULE_NAME = 'ts-class-member-accessibility';

/**
 * Rule: ts-class-member-accessibility
 *
 * Requires explicit accessibility modifiers (public, private, or protected) on all class members
 * (methods and properties), similar to Java's access modifier requirements.
 *
 * This rule enforces explicit visibility declarations to improve code clarity and make the
 * intended visibility of class members explicit. By default, TypeScript class members are
 * public if no modifier is specified, but this rule requires explicit declaration.
 *
 * The rule checks:
 * - Class methods (including getters, setters, and static methods)
 * - Class properties/fields (including static properties)
 * - Does NOT check constructors by default (configurable via allowConstructors)
 * - Does NOT check computed properties by default (configurable via allowComputedProperties)
 *
 * Benefits:
 * - Makes code intent explicit and self-documenting
 * - Prevents accidental public exposure of internal members
 * - Encourages thoughtful API design
 * - Aligns with Java/C# style guidelines
 *
 * @example
 * ```typescript
 * // ❌ Incorrect - missing accessibility modifiers
 * class Example {
 *   method(): void {}
 *   value: number = 42;
 *   static helper(): void {}
 * }
 *
 * // ✅ Correct - explicit accessibility modifiers
 * class Example {
 *   public method(): void {}
 *   private value: number = 42;
 *   public static helper(): void {}
 * }
 * ```
 */
export const tsClassMemberAccessibility = createEslintRule<Options, MessageIds>(
  {
    name: RULE_NAME,
    meta: {
      type: 'problem',
      fixable: 'code',
      docs: {
        description:
          'Require explicit accessibility modifiers on class members (methods and properties)'
      },
      messages: {
        missingAccessibility:
          'Class method "{{memberName}}" in class "{{className}}" must have an explicit accessibility modifier (public, private, or protected).',
        missingAccessibilityProperty:
          'Class property "{{memberName}}" in class "{{className}}" must have an explicit accessibility modifier (public, private, or protected).'
      },
      schema: [
        {
          type: 'object',
          properties: {
            allowConstructors: {
              type: 'boolean',
              default: true
            },
            allowPrivateFields: {
              type: 'boolean',
              default: false
            },
            allowProtectedFields: {
              type: 'boolean',
              default: false
            },
            allowImplicitPublic: {
              type: 'boolean',
              default: false
            },
            allowComputedProperties: {
              type: 'boolean',
              default: false
            }
          },
          additionalProperties: false
        }
      ]
    },
    defaultOptions: [
      {
        allowConstructors: true,
        allowPrivateFields: false,
        allowProtectedFields: false,
        allowImplicitPublic: false,
        allowComputedProperties: false
      }
    ],
    create(
      context: TSESLint.RuleContext<MessageIds, Options>,
      [options]: Options
    ) {
      // Extract configuration options with defaults
      // These options control which class members are exempt from requiring accessibility modifiers
      const allowConstructors = options?.allowConstructors ?? true;
      const allowPrivateFields = options?.allowPrivateFields ?? false;
      const allowProtectedFields = options?.allowProtectedFields ?? false;
      const allowImplicitPublic = options?.allowImplicitPublic ?? false;
      const allowComputedProperties = options?.allowComputedProperties ?? false;

      /**
       * Traverse the AST node hierarchy to find the containing class declaration
       * and extract its name for error reporting.
       *
       * This function walks up the parent chain until it finds a ClassDeclaration
       * or ClassExpression node, then returns the class name or a fallback string.
       *
       * @param node - The AST node to start traversal from
       * @returns The class name, or '<anonymous class>' if unnamed, or '<unknown class>' if not found
       *
       * @example
       * For code: `class MyClass { method() {} }`
       * When called with the MethodDefinition node, returns: "MyClass"
       */
      const getClassName = (node: TSESTree.Node): string => {
        let current: TSESTree.Node | undefined = node;
        while (current) {
          if (
            current.type === 'ClassDeclaration' ||
            current.type === 'ClassExpression'
          ) {
            const classNode = current as
              | TSESTree.ClassDeclaration
              | TSESTree.ClassExpression;
            return classNode.id?.name ?? '<anonymous class>';
          }
          current = current.parent;
        }
        return '<unknown class>';
      };

      /**
       * Extract the member name from a PropertyName AST node.
       * Handles different key types: Identifier, PrivateIdentifier, and computed properties.
       *
       * @param key - The PropertyName node representing the member key
       * @returns The member name as a string, or '<computed>' for computed properties
       *
       * @example
       * - Identifier: `method` -> "method"
       * - PrivateIdentifier: `#privateField` -> "privateField"
       * - Computed: `[getKey()]` -> "<computed>"
       */
      const getMemberName = (key: TSESTree.PropertyName): string => {
        if (key.type === 'Identifier') {
          return key.name;
        }
        if (key.type === 'PrivateIdentifier') {
          return key.name;
        }
        // Computed property names (e.g., [Symbol.iterator])
        return '<computed>';
      };

      /**
       * Get the position to insert 'public' before in a MethodDefinition node.
       * Finds the first modifier (static, abstract, get, set) or method name.
       *
       * @param node - The MethodDefinition node
       * @param sourceCode - The source code object from ESLint context
       * @returns The node or token to insert before
       */
      const getMethodInsertTarget = (
        node: TSESTree.MethodDefinition,
        sourceCode: TSESLint.SourceCode
      ): TSESTree.Node | TSESTree.Token => {
        // Get tokens for the node to find 'static' keyword
        const tokens = sourceCode.getTokens(node, { includeComments: false });

        // Find 'static' token if present
        if (node.static) {
          const staticToken = tokens.find(
            (token) => token.type === 'Keyword' && token.value === 'static'
          );
          if (staticToken) {
            return staticToken;
          }
        }

        // Check for abstract keyword
        const abstractToken = tokens.find(
          (token) => token.type === 'Keyword' && token.value === 'abstract'
        );
        if (abstractToken) {
          return abstractToken;
        }

        // Check for get/set keywords - insert before them
        // For getters/setters, the first token should be 'get' or 'set'
        if (node.kind === 'get' || node.kind === 'set') {
          // The first token should be 'get' or 'set'
          const firstToken = tokens[0];
          if (
            firstToken &&
            (firstToken.value === 'get' || firstToken.value === 'set')
          ) {
            return firstToken;
          }
        }

        // For computed methods (e.g., [Symbol.iterator]()), we need to insert before the '['
        // The '[' token is part of the MethodDefinition node, not the key expression
        if (node.computed) {
          // Find the first '[' token in the tokens array
          const bracketToken = tokens.find((token) => token.value === '[');
          if (bracketToken) {
            return bracketToken;
          }
        }

        // No modifiers found, insert before the method name
        return node.key;
      };

      /**
       * Get the position to insert 'public' before in a PropertyDefinition node.
       * Finds the first modifier (static, readonly) or property name.
       *
       * @param node - The PropertyDefinition node
       * @param sourceCode - The source code object from ESLint context
       * @returns The node or token to insert before
       */
      const getPropertyInsertTarget = (
        node: TSESTree.PropertyDefinition,
        sourceCode: TSESLint.SourceCode
      ): TSESTree.Node | TSESTree.Token => {
        // Get tokens for the node to find modifiers
        const tokens = sourceCode.getTokens(node, { includeComments: false });

        // Find 'static' token if present
        if (node.static) {
          const staticToken = tokens.find(
            (token) => token.type === 'Keyword' && token.value === 'static'
          );
          if (staticToken) {
            return staticToken;
          }
        }

        // Check for readonly keyword
        const readonlyToken = tokens.find(
          (token) => token.type === 'Keyword' && token.value === 'readonly'
        );
        if (readonlyToken) {
          return readonlyToken;
        }

        // For computed properties (e.g., [getKey()]), we need to insert before the '['
        // The '[' token is part of the PropertyDefinition node, not the key expression
        if (node.computed) {
          // Find the first '[' token in the tokens array
          const bracketToken = tokens.find((token) => token.value === '[');
          if (bracketToken) {
            return bracketToken;
          }
        }

        // No modifiers found, insert before the property name
        return node.key;
      };

      return {
        /**
         * Visitor for MethodDefinition nodes (class methods, getters, setters)
         *
         * Checks if methods have explicit accessibility modifiers (public, private, protected).
         * Handles:
         * - Regular methods: `method() {}`
         * - Static methods: `static method() {}`
         * - Getters: `get value() {}`
         * - Setters: `set value(v) {}`
         * - Constructors: `constructor() {}` (configurable via allowConstructors)
         *
         * Note: Static methods still require accessibility modifiers even though they
         * cannot be accessed via instance. The modifier clarifies the intended visibility
         * for the class itself.
         */
        MethodDefinition(node: TSESTree.MethodDefinition) {
          // Constructors are special: they cannot be private/protected in the traditional sense
          // and are always public. Many codebases prefer to omit the modifier for brevity.
          // When allowConstructors is true (default), we skip checking constructors.
          if (allowConstructors && node.kind === 'constructor') {
            return;
          }

          // Computed property names (e.g., [Symbol.iterator]) are often used for special methods
          // Some teams prefer to allow these without explicit modifiers since the bracket notation
          // already makes them visually distinct. When allowComputedProperties is true, we skip checking.
          if (allowComputedProperties && node.computed) {
            return;
          }

          // Check if the method has an explicit accessibility modifier
          // node.accessibility can be: 'public' | 'private' | 'protected' | undefined
          // If undefined, the member is implicitly public but lacks explicit modifier
          // When allowImplicitPublic is true, we allow members without explicit modifiers
          if (!node.accessibility && !allowImplicitPublic) {
            const className = getClassName(node);
            const memberName = getMemberName(node.key);
            const sourceCode = context.sourceCode;
            const insertTarget = getMethodInsertTarget(node, sourceCode);

            // Error reporting strategy:
            // - For static methods: report on the entire node (includes 'static' keyword)
            //   This ensures the error highlights the 'static' keyword position (column 11)
            // - For computed methods: report on the entire node (includes '[' bracket)
            //   This ensures the error highlights the '[' bracket position (column 11)
            // - For non-static, non-computed methods: report on the method name (node.key)
            //   This ensures the error highlights the method name position
            context.report({
              node: node.static || node.computed ? node : node.key,
              messageId: 'missingAccessibility',
              data: {
                memberName,
                className
              },
              fix(fixer) {
                return fixer.insertTextBefore(insertTarget, 'public ');
              }
            });
          }
        },

        /**
         * Visitor for PropertyDefinition nodes (class properties/fields)
         *
         * Checks if class properties have explicit accessibility modifiers.
         * Handles:
         * - Regular properties: `value: number = 42`
         * - Static properties: `static value: number = 42`
         * - Private fields: `#privateField: number = 42` (using # syntax)
         * - Protected properties: `protected field: number = 42`
         *
         * Note: Private fields using # syntax are inherently private and don't need
         * the `private` keyword, but this rule can still require it for consistency
         * (configurable via allowPrivateFields).
         */
        PropertyDefinition(node: TSESTree.PropertyDefinition) {
          // Private fields using # syntax (PrivateIdentifier) are inherently private
          // Some teams prefer to allow these without explicit 'private' modifier since
          // the # syntax already makes the privacy explicit.
          // When allowPrivateFields is true, we skip checking private identifier fields.
          if (allowPrivateFields && node.key.type === 'PrivateIdentifier') {
            return;
          }

          // Computed property names (e.g., [getKey()]) are often used for dynamic property names
          // Some teams prefer to allow these without explicit modifiers since the bracket notation
          // already makes them visually distinct. When allowComputedProperties is true, we skip checking.

          if (allowComputedProperties && node.computed) {
            return;
          }

          // Protected fields handling (allowProtectedFields option)
          // Note: This option has limited practical use in current TypeScript, as fields without
          // modifiers are implicitly public, not protected. However, this check allows fields that
          // already have 'protected' modifier to pass (though they already have a modifier).
          // This option is primarily reserved for future TypeScript features or special use cases.
          // When set to true, fields with explicit 'protected' modifier are allowed to pass
          // (though this is redundant since they already have a modifier).
          if (allowProtectedFields && node.accessibility === 'protected') {
            return;
          }

          // Check if the property has an explicit accessibility modifier
          // If no modifier is present and allowImplicitPublic is false, report an error
          // When allowImplicitPublic is true, we allow properties without explicit modifiers
          // (they are implicitly public in TypeScript)

          if (!node.accessibility && !allowImplicitPublic) {
            const className = getClassName(node);
            const memberName = getMemberName(node.key);
            const sourceCode = context.sourceCode;
            const insertTarget = getPropertyInsertTarget(node, sourceCode);

            // Error reporting strategy:
            // - For static properties: report on the entire node (includes 'static' keyword)
            //   This ensures the error highlights the 'static' keyword position (column 11)
            // - For computed properties: report on the entire node (includes '[' bracket)
            //   This ensures the error highlights the '[' bracket position (column 11)
            // - For non-static, non-computed properties: report on the property name (node.key)
            //   This ensures the error highlights the property name position
            context.report({
              node: node.static || node.computed ? node : node.key,
              messageId: 'missingAccessibilityProperty',
              data: {
                memberName,
                className
              },
              fix(fixer) {
                return fixer.insertTextBefore(insertTarget, 'public ');
              }
            });
          }
        }
      };
    }
  }
);
