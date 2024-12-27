export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure class methods have explicit return types',
      category: 'Best Practices',
      recommended: false
    },
    messages: {
      missingReturnType:
        'Class method "{{methodName}}" in class "{{className}}" is missing an explicit return type.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowConstructors: {
            type: 'boolean',
            default: true
          },
          allowPrivateMethods: {
            type: 'boolean',
            default: false
          }
        },
        additionalProperties: false
      }
    ]
  },
  create(context) {
    const options = context.options[0] || {};
    const allowConstructors = options.allowConstructors ?? true;
    const allowPrivateMethods = options.allowPrivateMethods ?? false;

    return {
      MethodDefinition(node) {
        if (allowConstructors && node.kind === 'constructor') {
          return;
        }

        if (allowPrivateMethods && node.key.type === 'PrivateIdentifier') {
          return;
        }

        if (!node.value.returnType) {
          // get class name
          const classNode = node.parent.parent; // MethodDefinition -> ClassBody -> ClassDeclaration
          const className =
            classNode.type === 'ClassDeclaration' && classNode.id
              ? classNode.id.name // class declaration
              : '<anonymous class>'; // anonymous class

          context.report({
            node,
            messageId: 'missingReturnType',
            data: {
              methodName: node.key.name,
              className
            }
          });
        }
      }
    };
  }
};
