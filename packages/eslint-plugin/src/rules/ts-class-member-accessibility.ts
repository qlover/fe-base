/**
 * @module ts-class-member-accessibility
 * @description ESLint rule that requires explicit accessibility modifiers (public, private, or protected) on all class members
 *
 * This rule enforces explicit visibility declarations to improve code clarity and make the
 * intended visibility of class members explicit. By default, TypeScript class members are
 * public if no modifier is specified, but this rule requires explicit declaration.
 *
 * Similar to Java's access modifier requirements, this rule helps:
 * - Make code intent explicit and self-documenting
 * - Prevent accidental public exposure of internal members
 * - Encourage thoughtful API design
 * - Align with Java/C# style guidelines
 *
 * ## Rule Details
 *
 * The rule checks:
 * - Class methods (including getters, setters, and static methods)
 * - Class properties/fields (including static properties)
 * - Does NOT check constructors by default (configurable via `allowConstructors`)
 * - Does NOT check computed properties by default (configurable via `allowComputedProperties`)
 *
 * ## Examples
 *
 * Examples of **incorrect** code for this rule:
 *
 * ```typescript
 * class Example {
 *   method(): void {}
 *   value: number = 42;
 *   static helper(): void {}
 *   get name(): string { return ''; }
 *   set name(value: string) {}
 * }
 * ```
 *
 * Examples of **correct** code for this rule:
 *
 * ```typescript
 * class Example {
 *   public method(): void {}
 *   private value: number = 42;
 *   public static helper(): void {}
 *   public get name(): string { return ''; }
 *   public set name(value: string) {}
 * }
 * ```
 *
 * ## Options
 *
 * This rule accepts an options object with the following properties:
 *
 * ### `allowConstructors`
 *
 * **Type:** `boolean`
 *
 * **Default:** `true`
 *
 * Whether to allow constructors without explicit accessibility modifiers.
 *
 * When `true`, constructors are exempt from requiring explicit accessibility modifiers.
 * When `false`, constructors must have an explicit modifier (typically `public`).
 *
 * **Use cases:**
 * - **Default behavior (true)**: Most codebases prefer `constructor()` over `public constructor()`
 *   - Constructors are always public in TypeScript
 *   - Omitting the modifier is more concise and idiomatic
 *   - Example: `constructor() {}` ✅ (when allowConstructors: true)
 * - **Strict mode (false)**: Enforce explicit modifiers for consistency
 *   - Useful for teams wanting complete explicitness
 *   - Forces `public constructor() {}` syntax
 *   - Example: `public constructor() {}` ✅ (when allowConstructors: false)
 *
 * **Configuration example:**
 * ```json
 * {
 *   "rules": {
 *     "@your-plugin/ts-class-member-accessibility": [
 *       "error",
 *       {
 *         "allowConstructors": false
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * ### `allowImplicitPublic`
 *
 * **Type:** `boolean`
 *
 * **Default:** `false`
 *
 * Whether to allow implicit public members (members without explicit modifiers).
 *
 * When `true`, class members without explicit accessibility modifiers are allowed.
 * These members are implicitly public in TypeScript.
 * When `false`, all members must have explicit modifiers (public, private, or protected).
 *
 * **Use cases:**
 * - **Default behavior (false)**: Require explicit modifiers for all members
 *   - Forces `public method() {}` instead of `method() {}`
 *   - Ensures complete explicitness
 *   - Example: `public method() {}` ✅ (when allowImplicitPublic: false)
 * - **Allow implicit public (true)**: Accept members without modifiers
 *   - TypeScript's default behavior: members without modifiers are public
 *   - More concise syntax: `method() {}` instead of `public method() {}`
 *   - Example: `method() {}` ✅ (when allowImplicitPublic: true)
 *
 * **Note:** This option applies to all class members (methods and properties) except:
 * - Constructors (controlled by `allowConstructors`)
 * - Private fields with # syntax (controlled by `allowPrivateFields`)
 * - Computed properties (controlled by `allowComputedProperties`)
 *
 * **Configuration example:**
 * ```json
 * {
 *   "rules": {
 *     "@your-plugin/ts-class-member-accessibility": [
 *       "error",
 *       {
 *         "allowImplicitPublic": true
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * ### `allowPrivateFields`
 *
 * **Type:** `boolean`
 *
 * **Default:** `false`
 *
 * Whether to allow private fields (using # syntax) to omit accessibility modifiers.
 *
 * When `true`, private identifier fields (`#field`) are exempt from requiring the `private` keyword.
 * When `false`, even `#field` syntax requires explicit `private #field` modifier.
 *
 * **Use cases:**
 * - **Default behavior (false)**: Require `private #field` for consistency
 *   - Ensures all private members use the same syntax pattern
 *   - Example: `private #field: number = 42` ✅ (when allowPrivateFields: false)
 * - **Allow # syntax (true)**: Accept `#field` without redundant `private` keyword
 *   - The `#` syntax already makes privacy explicit
 *   - Reduces redundancy: `#field` vs `private #field`
 *   - Example: `#field: number = 42` ✅ (when allowPrivateFields: true)
 *
 * **Note:** This only applies to private identifier fields (`#field`), not `private field` syntax.
 * Regular `private field` syntax always requires the modifier regardless of this option.
 *
 * **Configuration example:**
 * ```json
 * {
 *   "rules": {
 *     "@your-plugin/ts-class-member-accessibility": [
 *       "error",
 *       {
 *         "allowPrivateFields": true
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * ### `allowProtectedFields`
 *
 * **Type:** `boolean`
 *
 * **Default:** `false`
 *
 * Allow protected fields to omit accessibility modifiers.
 *
 * **Current limitation:**
 * This option has limited practical use in current TypeScript because:
 * - Fields without modifiers are implicitly `public`, not `protected`
 * - `protected` requires explicit declaration: `protected field: number`
 * - There's no way to have "implicit protected" fields in TypeScript
 *
 * **Recommendation:** Keep this option at default (`false`) unless you have a specific use case.
 *
 * ### `allowComputedProperties`
 *
 * **Type:** `boolean`
 *
 * **Default:** `false`
 *
 * Whether to allow computed properties (using bracket notation) to omit accessibility modifiers.
 *
 * When `true`, computed property names (e.g., `[Symbol.iterator]`, `[getKey()]`) are exempt
 * from requiring explicit accessibility modifiers.
 * When `false`, computed properties must have explicit modifiers (public, private, or protected).
 *
 * **Use cases:**
 * - **Default behavior (false)**: Require explicit modifiers for computed properties
 *   - Ensures all members use consistent syntax pattern
 *   - Example: `public [Symbol.iterator]() {}` ✅ (when allowComputedProperties: false)
 * - **Allow computed properties (true)**: Accept computed properties without modifiers
 *   - Computed properties are often used for special methods (e.g., iterators, symbols)
 *   - The bracket notation already makes them visually distinct
 *   - Reduces verbosity: `[Symbol.iterator]() {}` vs `public [Symbol.iterator]() {}`
 *   - Example: `[Symbol.iterator]() {}` ✅ (when allowComputedProperties: true)
 *
 * **Note:** This applies to both computed methods and computed properties:
 * - Computed methods: `[Symbol.iterator]() {}`
 * - Computed properties: `[getKey()]: number = 42`
 *
 * **Configuration example:**
 * ```json
 * {
 *   "rules": {
 *     "@your-plugin/ts-class-member-accessibility": [
 *       "error",
 *       {
 *         "allowComputedProperties": true
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * ## When Not To Use It
 *
 * If you prefer TypeScript's implicit public behavior or if your codebase follows a different
 * style guide that doesn't require explicit modifiers, you can disable this rule.
 *
 * ## Implementation Notes
 *
 * - The rule provides automatic fixes by adding `public` modifier where appropriate
 * - Fix insertion respects existing modifiers (static, abstract, async, get, set) and maintains correct order
 * - The rule handles both regular classes and abstract classes
 * - Private identifier fields (`#field`) and regular private fields are handled separately
 *
 * @see [Rule source](../../src/rules/ts-class-member-accessibility.ts)
 * @see [Test source](../../__tests__/rules/ts-class-member-accessibility.test.ts)
 */
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
 * ESLint rule implementation for ts-class-member-accessibility
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
       * Get the position to insert 'public' before in a MethodDefinition or TSAbstractMethodDefinition node.
       * Finds the first modifier (static, abstract, get, set) or method name.
       *
       * @param node - The MethodDefinition or TSAbstractMethodDefinition node
       * @param sourceCode - The source code object from ESLint context
       * @returns The node or token to insert before
       */
      const getMethodInsertTarget = (
        node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
        sourceCode: TSESLint.SourceCode
      ): TSESTree.Node | TSESTree.Token => {
        // Get tokens for the node to find modifiers
        const tokens = sourceCode.getTokens(node, { includeComments: false });

        // For TSAbstractMethodDefinition, we need to insert 'public' before the first token
        // to get the correct order: 'public abstract static' instead of 'abstract public static'
        if (node.type === 'TSAbstractMethodDefinition') {
          // Return the first token (which should be 'abstract' or 'static')
          // insertTextBefore will insert 'public ' before it
          const firstToken = tokens[0];
          if (firstToken) {
            return firstToken;
          }
        }

        // Check for abstract keyword (for MethodDefinition with abstract property)
        const abstractToken = tokens.find(
          (token) => token.type === 'Keyword' && token.value === 'abstract'
        );
        if (abstractToken) {
          return abstractToken;
        }

        // Find 'static' token if present (check before async to get correct order: public static async)
        if ('static' in node && node.static) {
          const staticToken = tokens.find(
            (token) => token.type === 'Keyword' && token.value === 'static'
          );
          if (staticToken) {
            return staticToken;
          }
        }

        // Check for async keyword - insert before it
        // Don't filter by type, just check value
        // IMPORTANT: Only check async tokens that are part of the method signature,
        // not those inside the method body. For MethodDefinition, the method body
        // starts at node.value.body.range[0]. We should only consider async tokens
        // that appear before the method body.
        const asyncToken = tokens.find((token) => {
          if (token.value !== 'async') {
            return false;
          }
          // For MethodDefinition, check if the token is before the method body
          if (node.type === 'MethodDefinition' && node.value) {
            // If method has a body, token is part of signature if it ends before body starts
            if (node.value.body && 'range' in node.value.body) {
              return token.range[1] <= node.value.body.range[0];
            }
            // If method has no body (e.g., abstract method implementation), all tokens are signature
            return true;
          }
          // For TSAbstractMethodDefinition, there's no body, so all tokens are part of signature
          return true;
        });
        if (asyncToken) {
          return asyncToken;
        }

        // Check for get/set keywords - insert before them
        // For getters/setters, the first token should be 'get' or 'set'
        if ('kind' in node && (node.kind === 'get' || node.kind === 'set')) {
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
       * Get the position to insert 'public' before in a PropertyDefinition or TSAbstractPropertyDefinition node.
       * Finds the first modifier (static, readonly, abstract) or property name.
       *
       * @param node - The PropertyDefinition or TSAbstractPropertyDefinition node
       * @param sourceCode - The source code object from ESLint context
       * @returns The node or token to insert before
       */
      const getPropertyInsertTarget = (
        node: TSESTree.PropertyDefinition | TSESTree.TSAbstractPropertyDefinition,
        sourceCode: TSESLint.SourceCode
      ): TSESTree.Node | TSESTree.Token => {
        // Get tokens for the node to find modifiers
        const tokens = sourceCode.getTokens(node, { includeComments: false });

        // For TSAbstractPropertyDefinition, return the first token (should be 'abstract' or 'static')
        if (node.type === 'TSAbstractPropertyDefinition') {
          const firstToken = tokens[0];
          if (firstToken) {
            return firstToken;
          }
        }

        // Check if property has readonly modifier using node property
        // PropertyDefinition has readonly property but TypeScript types may not include it
        const hasReadonlyProperty =
          'readonly' in node &&
          (node as TSESTree.PropertyDefinition & { readonly?: boolean }).readonly === true;
        
        // Find 'static' token first (if present, it comes before readonly)
        if ('static' in node && node.static) {
          const staticToken = tokens.find(
            (token) => token.type === 'Keyword' && token.value === 'static'
          );
          if (staticToken) {
            return staticToken;
          }
        }

        // For readonly properties, find the 'readonly' token
        // We need to find it in tokens array, not just check the property
        if (hasReadonlyProperty) {
          // Try to find 'readonly' token in tokens
          const readonlyToken = tokens.find(
            (token) => token.type === 'Keyword' && token.value === 'readonly'
          );
          if (readonlyToken) {
            return readonlyToken;
          }
          // If not found in tokens, return the first token (which should be 'readonly')
          // This handles cases where readonly might be the first token
          const firstToken = tokens[0];
          if (firstToken) {
            return firstToken;
          }
        }

        // Find 'abstract' token if present
        const abstractToken = tokens.find(
          (token) => token.type === 'Keyword' && token.value === 'abstract'
        );
        if (abstractToken) {
          return abstractToken;
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
         * - Abstract methods: `abstract method(): void;` (in abstract classes)
         * - Getters: `get value() {}`
         * - Setters: `set value(v) {}`
         * - Constructors: `constructor() {}` (configurable via allowConstructors)
         *
         * Note: Static methods and abstract methods still require accessibility modifiers
         * even though they have special semantics. The modifier clarifies the intended visibility.
         */
        MethodDefinition(node: TSESTree.MethodDefinition) {
          // Skip method overload signatures (they don't have a value/implementation)
          // Only the implementation method needs an accessibility modifier
          if (!node.value) {
            return;
          }

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

            // Get tokens for error reporting
            const tokens = sourceCode.getTokens(node, { includeComments: false });
            // Check for async keyword - don't filter by type, just check value
            const hasAsync = tokens.some(
              (token) => token.value === 'async'
            );

            const isAbstract = 'abstract' in node && node.abstract;
            const isStatic = 'static' in node && node.static;
            
            // Error reporting strategy:
            // - For non-static get/set methods: report on the method name (node.key)
            // - For static/abstract/async/computed methods: report on the entire node
            // - For other methods: report on the method name (node.key)
            let reportNode: TSESTree.Node | TSESTree.Token = node.key;
            if (isStatic || isAbstract || hasAsync || node.computed) {
              // Report on the entire node for static/abstract/async/computed methods
              reportNode = node;
            }
            // For non-static get/set and regular methods, keep reportNode as node.key (default)
            context.report({
              node: reportNode,
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
         * Visitor for TSAbstractMethodDefinition nodes (abstract methods in abstract classes)
         *
         * Checks if abstract methods have explicit accessibility modifiers (public, private, protected).
         * Handles:
         * - Abstract methods: `abstract method(): void;`
         * - Abstract static methods: `abstract static method(): void;`
         *
         * Note: Abstract methods require accessibility modifiers to clarify their intended visibility.
         */
        TSAbstractMethodDefinition(node: TSESTree.TSAbstractMethodDefinition) {
          // Computed property names (e.g., [Symbol.iterator]) are often used for special methods
          // Some teams prefer to allow these without explicit modifiers since the bracket notation
          // already makes them visually distinct. When allowComputedProperties is true, we skip checking.
          if (allowComputedProperties && node.computed) {
            return;
          }

          // Check if the abstract method has an explicit accessibility modifier
          // node.accessibility can be: 'public' | 'private' | 'protected' | undefined
          // If undefined, the member is implicitly public but lacks explicit modifier
          // When allowImplicitPublic is true, we allow members without explicit modifiers
          if (!node.accessibility && !allowImplicitPublic) {
            const className = getClassName(node);
            const memberName = getMemberName(node.key);
            const sourceCode = context.sourceCode;
            const insertTarget = getMethodInsertTarget(node, sourceCode);

            // Error reporting strategy:
            // - For abstract methods: always report on the entire node (includes 'abstract' keyword)
            //   This ensures the error highlights the 'abstract' keyword position (column 11)
            // - For computed abstract methods: report on the entire node (includes '[' bracket)
            //   This ensures the error highlights the '[' bracket position (column 11)
            context.report({
              node: node,
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

            // Check if property has readonly modifier
            // PropertyDefinition node has a 'readonly' property in TypeScript ESLint
            // We need to check both the node property and tokens to handle all cases
            const hasReadonlyProperty =
              'readonly' in node &&
              (node as TSESTree.PropertyDefinition & { readonly?: boolean }).readonly === true;
            const tokens = sourceCode.getTokens(node, { includeComments: false });
            const hasReadonlyToken = tokens.some(
              (token) => token.type === 'Keyword' && token.value === 'readonly'
            );
            const hasReadonly = hasReadonlyProperty || hasReadonlyToken;

            // Error reporting strategy:
            // - For static properties: report on the entire node (includes 'static' keyword)
            //   This ensures the error highlights the 'static' keyword position (column 11)
            // - For readonly properties: report on the entire node (includes 'readonly' keyword)
            //   This ensures the error highlights the 'readonly' keyword position (column 11)
            // - For computed properties: report on the entire node (includes '[' bracket)
            //   This ensures the error highlights the '[' bracket position (column 11)
            // - For non-static, non-readonly, non-computed properties: report on the property name (node.key)
            //   This ensures the error highlights the property name position
            context.report({
              node: node.static || hasReadonly || node.computed ? node : node.key,
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
        },

        /**
         * Visitor for TSAbstractPropertyDefinition nodes (abstract properties in abstract classes)
         *
         * Checks if abstract properties have explicit accessibility modifiers (public, private, protected).
         * Handles:
         * - Abstract properties: `abstract value: number;`
         * - Abstract static properties: `abstract static value: number;`
         * - Abstract readonly properties: `abstract readonly value: number;`
         * - Abstract static readonly properties: `abstract static readonly value: number;`
         *
         * Note: Abstract properties require accessibility modifiers to clarify their intended visibility.
         */
        TSAbstractPropertyDefinition(node: TSESTree.TSAbstractPropertyDefinition) {
          // Computed property names (e.g., [getKey()]) are often used for dynamic property names
          // Some teams prefer to allow these without explicit modifiers since the bracket notation
          // already makes them visually distinct. When allowComputedProperties is true, we skip checking.
          if (allowComputedProperties && node.computed) {
            return;
          }

          // Check if the abstract property has an explicit accessibility modifier
          // node.accessibility can be: 'public' | 'private' | 'protected' | undefined
          // If undefined, the member is implicitly public but lacks explicit modifier
          // When allowImplicitPublic is true, we allow members without explicit modifiers
          if (!node.accessibility && !allowImplicitPublic) {
            const className = getClassName(node);
            const memberName = getMemberName(node.key);
            const sourceCode = context.sourceCode;
            const insertTarget = getPropertyInsertTarget(node, sourceCode);

            // Error reporting strategy:
            // - For abstract properties: always report on the entire node (includes 'abstract' keyword)
            //   This ensures the error highlights the 'abstract' keyword position (column 11)
            // - For computed abstract properties: report on the entire node (includes '[' bracket)
            //   This ensures the error highlights the '[' bracket position (column 11)
            context.report({
              node: node,
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
