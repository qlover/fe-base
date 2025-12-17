/**
 * @module require-root-testid
 * @description ESLint rule that enforces the presence of `data-testid` attribute on root elements of TSX components
 *
 * This rule ensures that all root elements in React components have a `data-testid` attribute,
 * which is essential for testing purposes. The rule automatically fixes violations by adding
 * a `data-testid` attribute with the component name as the value.
 *
 * ## Rule Details
 *
 * The rule checks for root JSX elements in component functions. A root element is defined as:
 * - An element directly returned from a function (in a return statement)
 * - An element that is the body of an arrow function expression
 *
 * When a root element is missing the `data-testid` attribute, the rule will:
 * 1. Report an error
 * 2. Automatically fix it by adding `data-testid="ComponentName"` where ComponentName is
 *    derived from the component function name or JSX element name
 *
 * ## Examples
 *
 * Examples of **incorrect** code for this rule:
 *
 * ```tsx
 * function Component() {
 *   return <div>Content</div>;
 * }
 *
 * const ArrowComponent = () => {
 *   return <div className="test">Content</div>;
 * }
 * ```
 *
 * Examples of **correct** code for this rule:
 *
 * ```tsx
 * function Component() {
 *   return <div data-testid="Component">Content</div>;
 * }
 *
 * const ArrowComponent = () => {
 *   return <div data-testid="ArrowComponent" className="test">Content</div>;
 * }
 * ```
 *
 * ## Options
 *
 * This rule accepts an options object with the following properties:
 *
 * ### `exclude`
 *
 * **Type:** `string | string[] | RegExp | ((componentName: string) => boolean) | Array<string | RegExp | ((componentName: string) => boolean)>`
 *
 * **Default:** `undefined`
 *
 * Components to exclude from testid requirement. This option allows you to specify which
 * components should be exempt from requiring a `data-testid` attribute on their root elements.
 * The matching is performed against the JSX element name (e.g., `<ConfigProvider>`, `<Provider>`)
 * rather than the component function name.
 *
 * **Supported formats:**
 *
 * 1. **Array of strings**: Exact match or endsWith match
 *    ```ts
 *    exclude: ['ConfigProvider', 'Provider']
 *    ```
 *    - Matches: `<ConfigProvider>`, `<Provider>`, `<MyProvider>`
 *    - Does not match: `<Config>`, `<MyConfigProvider>` (unless ends with 'Provider')
 *
 * 2. **RegExp**: Regular expression pattern
 *    ```ts
 *    exclude: /Provider$/
 *    ```
 *    - Matches any component name ending with 'Provider'
 *
 * 3. **String**: Treated as regex if wrapped in slashes, otherwise exact/endsWith match
 *    ```ts
 *    exclude: '/Provider$/'  // Regex pattern
 *    exclude: 'Provider'     // Exact match or endsWith
 *    ```
 *
 * 4. **Function**: Custom matching logic
 *    ```ts
 *    exclude: (name: string) => name.includes('Provider')
 *    ```
 *
 * 5. **Array of mixed types**: Combine multiple matchers
 *    ```ts
 *    exclude: ['ConfigProvider', /Provider$/, (name) => name.includes('Provider')]
 *    ```
 *
 * **Configuration examples:**
 *
 * Exclude all Provider components:
 * ```json
 * {
 *   "rules": {
 *     "@your-plugin/require-root-testid": [
 *       "error",
 *       {
 *         "exclude": "/Provider$/"
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * Exclude specific components:
 * ```json
 * {
 *   "rules": {
 *     "@your-plugin/require-root-testid": [
 *       "error",
 *       {
 *         "exclude": ["ConfigProvider", "ThemeProvider"]
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * Exclude components with custom function:
 * ```json
 * {
 *   "rules": {
 *     "@your-plugin/require-root-testid": [
 *       "error",
 *       {
 *         "exclude": ["ConfigProvider", "/Provider$/"]
 *       }
 *     ]
 *   }
 * }
 * ```
 *
 * ## When Not To Use It
 *
 * If you are not using test IDs in your testing strategy or if you have a different approach
 * to selecting elements in tests, you can disable this rule.
 *
 * ## Implementation Notes
 *
 * - The rule uses automatic fixing to add `data-testid` attributes
 * - The testid value is derived from the component function name, or falls back to the JSX
 *   element name, or defaults to 'component'
 * - Exclusion matching is performed against JSX element names, not component function names
 * - The rule handles both function declarations and arrow function components
 * - JSX member expressions (e.g., `<Antd.ConfigProvider>`) are supported
 *
 * @see [Rule source](../../src/rules/require-root-testid.ts)
 * @see [Test source](../../__tests__/rules/require-root-testid.test.ts)
 */
import { type TSESTree, AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/createEslintRule';

export const RULE_NAME = 'require-root-testid';

/**
 * Message IDs for error reporting
 */
type MessageIds = 'missingTestId';

/**
 * Matcher type for excluding components from testid requirement
 *
 * Can be:
 * - Array of strings: ['ConfigProvider', 'Provider']
 * - RegExp: /Provider$/
 * - String (treated as regex pattern if wrapped in slashes, otherwise exact/endsWith match): 'Provider$' or '/Provider$/'
 * - Function: (name: string) => boolean
 * - Array of mixed types: ['ConfigProvider', /Provider$/, (name) => name.includes('Provider')]
 */
type ExcludeMatcher =
  | string[]
  | RegExp
  | string
  | ((componentName: string) => boolean)
  | Array<string | RegExp | ((componentName: string) => boolean)>;

/**
 * Configuration options for the rule
 *
 * @property exclude - Components to exclude from testid requirement
 *   - Type: `string | string[] | RegExp | ((componentName: string) => boolean) | Array<string | RegExp | ((componentName: string) => boolean)>`
 *   - Default: `undefined`
 *   - Description: Specifies which components should be exempt from requiring a `data-testid` attribute.
 *     Matching is performed against JSX element names (e.g., `<ConfigProvider>`, `<Provider>`)
 *     rather than component function names.
 */
type Options = [
  {
    /**
     * Components to exclude from testid requirement
     *
     * @default `undefined`
     */
    exclude?: ExcludeMatcher;
  }
];

/**
 * ESLint rule implementation for require-root-testid
 */
export const requireRootTestid = createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce data-testid attribute on root elements of TSX components'
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          exclude: {
            oneOf: [
              { type: 'array', items: { type: 'string' } },
              { type: 'string' },
              { type: 'object' } // RegExp or Function (serialized)
            ]
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      missingTestId:
        'Root element of a component must have a data-testid attribute'
    }
  },
  defaultOptions: [{}],
  create(context, [options]) {
    const isRootElement = (node: TSESTree.JSXElement): boolean => {
      const parent = node.parent;
      if (!parent) return false;

      // If parent is return statement or arrow function body, it's a root element
      if (
        parent.type === AST_NODE_TYPES.ReturnStatement ||
        (parent.type === AST_NODE_TYPES.ArrowFunctionExpression &&
          parent.body === node)
      ) {
        return true;
      }

      return false;
    };

    const parseStringMatcher = (str: string): string | RegExp => {
      // Try to parse as regex if it looks like one, otherwise treat as exact match
      if (str.startsWith('/') && str.endsWith('/')) {
        try {
          const regexPattern = str.slice(1, -1);
          return new RegExp(regexPattern);
        } catch {
          // If invalid regex, treat as string
          return str;
        }
      }
      return str;
    };

    const normalizeExcludeMatcher = (
      matcher: ExcludeMatcher
    ): Array<string | RegExp | ((componentName: string) => boolean)> => {
      if (Array.isArray(matcher)) {
        // Process each element in the array
        const result: Array<
          string | RegExp | ((componentName: string) => boolean)
        > = [];
        for (const item of matcher) {
          if (typeof item === 'string') {
            const parsed = parseStringMatcher(item);
            result.push(parsed);
          } else {
            result.push(item);
          }
        }
        return result;
      }
      if (typeof matcher === 'function') {
        return [matcher];
      }
      if (matcher instanceof RegExp) {
        return [matcher];
      }
      if (typeof matcher === 'string') {
        const parsed = parseStringMatcher(matcher);
        return [parsed];
      }
      return [];
    };

    const isExcluded = (componentName: string): boolean => {
      const excludeMatcher = options?.exclude;
      if (!excludeMatcher) {
        return false;
      }
      const matchers = normalizeExcludeMatcher(excludeMatcher);

      return matchers.some((matcher) => {
        if (typeof matcher === 'string') {
          return componentName === matcher || componentName.endsWith(matcher);
        }
        if (matcher instanceof RegExp) {
          return matcher.test(componentName);
        }
        if (typeof matcher === 'function') {
          return matcher(componentName);
        }
        return false;
      });
    };

    const getJSXElementName = (node: TSESTree.JSXElement): string | null => {
      const name = node.openingElement.name;
      if (name.type === AST_NODE_TYPES.JSXIdentifier) {
        return name.name;
      }
      // Handle JSXMemberExpression like <Antd.ConfigProvider>
      if (name.type === AST_NODE_TYPES.JSXMemberExpression) {
        const property = name.property;
        if (property.type === AST_NODE_TYPES.JSXIdentifier) {
          return property.name;
        }
      }
      return null;
    };

    const getComponentName = (node: TSESTree.JSXElement): string | null => {
      let current: TSESTree.Node | undefined = node;
      while (current) {
        if (
          current.type === AST_NODE_TYPES.FunctionDeclaration ||
          current.type === AST_NODE_TYPES.VariableDeclarator
        ) {
          const name =
            (current as TSESTree.FunctionDeclarationWithName).id?.name || '';
          return name || null;
        }
        current = current.parent;
      }
      return null;
    };

    return {
      JSXElement(node: TSESTree.JSXElement) {
        if (isRootElement(node)) {
          // Check if this JSX element name is excluded (only check JSX element name, not component function name)
          const jsxElementName = getJSXElementName(node);
          if (jsxElementName && isExcluded(jsxElementName)) {
            return; // Skip excluded JSX elements
          }

          const hasTestId = node.openingElement.attributes.some(
            (attr): attr is TSESTree.JSXAttribute =>
              attr.type === AST_NODE_TYPES.JSXAttribute &&
              attr.name.name === 'data-testid'
          );

          if (!hasTestId) {
            context.report({
              node: node.openingElement,
              messageId: 'missingTestId',
              fix(fixer) {
                const sourceCode = context.getSourceCode();
                const openingElement = node.openingElement;
                const hasAttributes = openingElement.attributes.length > 0;

                // Get component name for testid value (but don't use it for exclusion check)
                const componentName = getComponentName(node);
                const testIdValue =
                  componentName || jsxElementName || 'component';
                const testIdAttribute = `data-testid="${testIdValue}"`;

                if (hasAttributes) {
                  // If has other attributes, add before first attribute
                  const firstAttribute = openingElement.attributes[0];
                  const firstAttributeToken =
                    sourceCode.getFirstToken(firstAttribute);
                  if (!firstAttributeToken) return null;

                  // Check if there's already a space before the first attribute
                  const tokenBefore =
                    sourceCode.getTokenBefore(firstAttributeToken);
                  const textBefore = tokenBefore
                    ? sourceCode
                        .getText()
                        .slice(
                          tokenBefore.range[1],
                          firstAttributeToken.range[0]
                        )
                    : '';
                  const hasSpaceBefore =
                    textBefore.trim() === '' && textBefore.includes(' ');

                  // Insert before the first attribute with proper spacing
                  // Always ensure space before data-testid and after it (before next attribute)
                  const spaceBefore = hasSpaceBefore ? '' : ' ';
                  const insertText = `${spaceBefore}${testIdAttribute} `;

                  return fixer.insertTextBefore(
                    firstAttributeToken,
                    insertText
                  );
                } else {
                  // If no other attributes, add after tag name (not after <)
                  const name = openingElement.name;
                  const nameLastToken = sourceCode.getLastToken(name);

                  if (!nameLastToken) return null;

                  return fixer.insertTextAfter(
                    nameLastToken,
                    ` ${testIdAttribute}`
                  );
                }
              }
            });
          }
        }
      }
    };
  }
});
