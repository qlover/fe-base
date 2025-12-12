import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/createEslintRule';

export const RULE_NAME = 'require-root-testid';

type MessageIds = 'missingTestId';

type ExcludeMatcher =
  | string[]
  | RegExp
  | string
  | ((componentName: string) => boolean)
  | Array<string | RegExp | ((componentName: string) => boolean)>;

type Options = [
  {
    /**
     * Components to exclude from testid requirement
     * 
     * Can be:
     * - Array of strings: ['ConfigProvider', 'Provider']
     * - RegExp: /Provider$/
     * - String (treated as regex): 'Provider$'
     * - Function: (name: string) => boolean
     * - Array of mixed types: ['ConfigProvider', /Provider$/, (name) => name.includes('Provider')]
     */
    exclude?: ExcludeMatcher;
  }
];

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

    const parseStringMatcher = (
      str: string
    ): string | RegExp => {
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
        const result: Array<string | RegExp | ((componentName: string) => boolean)> = [];
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

    const getComponentName = (
      node: TSESTree.JSXElement
    ): string | null => {
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
                const testIdValue = componentName || jsxElementName || 'component';
                const testIdAttribute = `data-testid="${testIdValue}"`;

                if (hasAttributes) {
                  // If has other attributes, add before first attribute
                  const firstAttribute = openingElement.attributes[0];
                  const firstAttributeToken = sourceCode.getFirstToken(
                    firstAttribute
                  );
                  if (!firstAttributeToken) return null;

                  // Check if there's already a space before the first attribute
                  const tokenBefore = sourceCode.getTokenBefore(firstAttributeToken);
                  const textBefore = tokenBefore
                    ? sourceCode.getText().slice(
                        tokenBefore.range[1],
                        firstAttributeToken.range[0]
                      )
                    : '';
                  const hasSpaceBefore = textBefore.trim() === '' && textBefore.includes(' ');

                  // Insert before the first attribute with proper spacing
                  // Always ensure space before data-testid and after it (before next attribute)
                  const spaceBefore = hasSpaceBefore ? '' : ' ';
                  const insertText = `${spaceBefore}${testIdAttribute} `;
                  
                  return fixer.insertTextBefore(firstAttributeToken, insertText);
                } else {
                  // If no other attributes, add after tag name (not after <)
                  const name = openingElement.name;
                  const nameLastToken = sourceCode.getLastToken(name);
                  
                  if (!nameLastToken) return null;
                  
                  return fixer.insertTextAfter(nameLastToken, ` ${testIdAttribute}`);
                }
              }
            });
          }
        }
      }
    };
  }
});
