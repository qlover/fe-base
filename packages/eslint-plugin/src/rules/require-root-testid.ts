import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createEslintRule } from '../utils/createEslintRule';

export const RULE_NAME = 'require-root-testid';

type MessageIds = 'missingTestId';
type Options = [];

export const requireRootTestid = createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce data-testid attribute on root elements of TSX components'
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingTestId:
        'Root element of a component must have a data-testid attribute'
    }
  },
  defaultOptions: [],
  create(context) {
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

    return {
      JSXElement(node: TSESTree.JSXElement) {
        if (isRootElement(node)) {
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
                // Get component name as default testid value
                let componentName = '';
                let current: TSESTree.Node | undefined = node;
                while (current) {
                  if (
                    current.type === AST_NODE_TYPES.FunctionDeclaration ||
                    current.type === AST_NODE_TYPES.VariableDeclarator
                  ) {
                    componentName =
                      (current as TSESTree.FunctionDeclarationWithName).id
                        .name || '';
                    break;
                  }
                  current = current.parent;
                }

                const sourceCode = context.getSourceCode();
                const openingElement = node.openingElement;
                const tagToken = sourceCode.getFirstToken(openingElement);
                const hasAttributes = openingElement.attributes.length > 0;

                if (!tagToken) return null;

                if (hasAttributes) {
                  // If has other attributes, add before first attribute
                  const firstAttribute = openingElement.attributes[0];
                  const indent =
                    sourceCode
                      .getText()
                      .slice(0, firstAttribute.range[0])
                      .match(/\s*$/)?.[0] || '';
                  return fixer.insertTextBefore(
                    firstAttribute,
                    `data-testid="${componentName || 'component'}"${indent}`
                  );
                } else {
                  // If no other attributes, add after tag name
                  return fixer.insertTextAfter(
                    tagToken,
                    ` data-testid="${componentName || 'component'}"`
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
