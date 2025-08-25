export const eslintPluginTestId = {
  rules: {
    'require-root-testid': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Enforce data-testid attribute on root elements of TSX components',
          category: 'Best Practices',
          recommended: true
        },
        fixable: 'code',
        schema: []
      },
      create(context) {
        return {
          JSXElement(node) {
            // 检查是否是组件的根元素
            const isRootElement = (node) => {
              const parent = node.parent;
              if (!parent) return false;

              // 如果父节点是 return 语句或者是箭头函数的主体，说明这是根元素
              if (
                parent.type === 'ReturnStatement' ||
                (parent.type === 'ArrowFunctionExpression' &&
                  parent.body === node)
              ) {
                return true;
              }

              return false;
            };

            if (isRootElement(node)) {
              const hasTestId = node.openingElement.attributes.some(
                (attr) =>
                  attr.type === 'JSXAttribute' &&
                  attr.name.name === 'data-testid'
              );

              if (!hasTestId) {
                context.report({
                  node: node.openingElement,
                  message:
                    'Root element of a component must have a data-testid attribute',
                  fix(fixer) {
                    // 获取组件名称作为 testid 的默认值
                    let componentName = '';
                    let current = node;
                    while (current) {
                      if (
                        current.type === 'FunctionDeclaration' ||
                        current.type === 'VariableDeclarator'
                      ) {
                        componentName = current.id?.name || '';
                        break;
                      }
                      current = current.parent;
                    }

                    const sourceCode = context.getSourceCode();
                    const openingElement = node.openingElement;
                    const tagToken = sourceCode.getFirstToken(openingElement);
                    const hasAttributes = openingElement.attributes.length > 0;

                    if (hasAttributes) {
                      // 如果有其他属性，在第一个属性前添加
                      const firstAttribute = openingElement.attributes[0];
                      const indent = sourceCode
                        .getText()
                        .slice(0, firstAttribute.range[0])
                        .match(/\s*$/)[0];
                      return fixer.insertTextBefore(
                        firstAttribute,
                        `data-testid='${componentName || 'component'}'${indent}`
                      );
                    } else {
                      // 如果没有其他属性，在标签名后面添加
                      return fixer.insertTextAfter(
                        tagToken,
                        ` data-testid='${componentName || 'component'}'`
                      );
                    }
                  }
                });
              }
            }
          }
        };
      }
    }
  }
};
