import type { TSESTree } from '@typescript-eslint/types';
import { createEslintRule } from '../utils/createEslintRule';
import type { TSESLint } from '@typescript-eslint/utils';

type MessageIds = 'missingReturnType';
type Options = readonly [
  {
    allowConstructors?: boolean;
    allowPrivateMethods?: boolean;
  }
];

export const RULE_NAME = 'ts-class-method-return';

export default createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
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
  create(context: TSESLint.RuleContext<MessageIds, Options>, [options]: Options) {
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
            node: node.key,
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
