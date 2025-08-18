import type { TSESTree } from '@typescript-eslint/types';
import { createEslintRule } from '../utils/createEslintRule';

type MessageIds = 'missingReturnType';
type Options = [
  {
    allowConstructors?: boolean;
    allowPrivateMethods?: boolean;
  }
];

export default createEslintRule<Options, MessageIds>({
  name: 'ts-class-method-return',
  meta: {
    type: 'problem',
    docs: {
      description: 'Ensure class methods have explicit return types'
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
  defaultOptions: [
    {
      allowConstructors: true,
      allowPrivateMethods: false
    }
  ],
  create(context, [options]) {
    const allowConstructors = options?.allowConstructors ?? true;
    const allowPrivateMethods = options?.allowPrivateMethods ?? false;

    return {
      MethodDefinition(node: TSESTree.MethodDefinition) {
        if (allowConstructors && node.kind === 'constructor') {
          return;
        }

        if (allowPrivateMethods && node.key.type === 'PrivateIdentifier') {
          return;
        }

        if (!node.value.returnType) {
          // get class name
          const classNode = node.parent?.parent as TSESTree.ClassDeclaration;
          const className = classNode?.id?.name ?? '<anonymous class>';

          // get method name
          const methodName =
            node.key.type === 'Identifier'
              ? node.key.name
              : node.key.type === 'PrivateIdentifier'
                ? node.key.name
                : '<computed>';

          context.report({
            node,
            messageId: 'missingReturnType',
            data: {
              methodName,
              className
            }
          });
        }
      }
    };
  }
});
