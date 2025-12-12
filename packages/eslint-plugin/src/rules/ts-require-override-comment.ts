import type { TSESTree } from '@typescript-eslint/types';
import { createEslintRule } from '../utils/createEslintRule';
import type { TSESLint } from '@typescript-eslint/utils';

type MessageIds = 'missingOverrideComment';
type Options = readonly [
  {
    /**
     * Allow methods without @override comment if they don't implement interface methods
     * @default false
     */
    allowNonInterfaceMethods?: boolean;
  }
];

export const RULE_NAME = 'ts-require-override-comment';

/**
 * Rule: ts-require-override-comment
 *
 * Requires `@override` JSDoc comment on class methods that implement interface methods.
 * This helps make it explicit when a method is implementing an interface contract,
 * similar to Java's `@Override` annotation.
 *
 * @example
 * ```typescript
 * interface A {
 *   do(): void;
 * }
 *
 * class B implements A {
 *   \/** \@\override *\/
 *   do(): void {}
 * }
 * ```
 */
export const tsRequireOverrideComment = createEslintRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description:
        'Require @override JSDoc comment on methods that implement interface methods'
    },
    messages: {
      missingOverrideComment:
        'Method "{{methodName}}" in class "{{className}}" implements an interface method and must have a @override JSDoc comment.'
    },
    schema: [
      {
        type: 'object',
        properties: {
          allowNonInterfaceMethods: {
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
      allowNonInterfaceMethods: false
    }
  ],
  create(
    context: TSESLint.RuleContext<MessageIds, Options>,
    [options]: Options
  ) {
    const sourceCode = context.sourceCode;
    const allowNonInterfaceMethods = options?.allowNonInterfaceMethods ?? false;

    /**
     * Get the method name from a MethodDefinition node
     */
    const getMethodName = (key: TSESTree.PropertyName): string => {
      if (key.type === 'Identifier') {
        return key.name;
      }
      if (key.type === 'PrivateIdentifier') {
        return key.name;
      }
      return '<computed>';
    };

    /**
     * Check if a method has @override JSDoc comment
     */
    const hasOverrideComment = (node: TSESTree.MethodDefinition): boolean => {
      const comments = sourceCode.getCommentsBefore(node);

      for (const comment of comments) {
        if (comment.type === 'Block') {
          const commentText = comment.value.trim();
          // Check for @override tag in JSDoc comment
          // Matches: /** @override */, /** @override description */, etc.
          if (/@override\b/.test(commentText)) {
            return true;
          }
        }
      }

      return false;
    };

    /**
     * Check if a method has any JSDoc comment (Block type comment starting with /**)
     */
    const hasJSDocComment = (node: TSESTree.MethodDefinition): boolean => {
      const comments = sourceCode.getCommentsBefore(node);
      return comments.some((comment) => {
        if (comment.type === 'Block') {
          // Check if it's a JSDoc comment (starts with /**)
          const commentText = sourceCode
            .getText()
            .slice(comment.range[0], comment.range[1]);
          return commentText.trimStart().startsWith('/**');
        }
        return false;
      });
    };

    return {
      MethodDefinition(node: TSESTree.MethodDefinition) {
        // Skip constructors
        if (node.kind === 'constructor') {
          return;
        }

        // Skip static methods (they can't implement interface methods)
        if (node.static) {
          return;
        }

        // Skip private methods (they can't implement interface methods)
        if (node.key.type === 'PrivateIdentifier') {
          return;
        }

        // Get the containing class by traversing parent chain
        let current: TSESTree.Node | undefined = node.parent;
        let classNode:
          | TSESTree.ClassDeclaration
          | TSESTree.ClassExpression
          | null = null;

        while (current) {
          if (
            current.type === 'ClassDeclaration' ||
            current.type === 'ClassExpression'
          ) {
            classNode = current as
              | TSESTree.ClassDeclaration
              | TSESTree.ClassExpression;
            break;
          }
          current = current.parent;
        }

        // Skip if not in a class
        if (!classNode) {
          return;
        }

        // Only check methods in classes that implement interfaces
        if (!classNode.implements || classNode.implements.length === 0) {
          return;
        }

        // Note: allowNonInterfaceMethods option would require type checking
        // to determine if a method actually comes from an interface.
        // Without type information, we check all methods in classes that implement interfaces.
        // This is a limitation when allowNonInterfaceMethods is true, but implementing
        // it properly would require enabling type-aware linting which is much slower.

        // Check if the method has @override comment
        if (!hasOverrideComment(node)) {
          const className = classNode.id?.name ?? '<anonymous class>';
          const methodName = getMethodName(node.key);

          context.report({
            node: node.key,
            messageId: 'missingOverrideComment',
            data: {
              methodName,
              className
            },
            fix(fixer) {
              // Only add JSDoc comment if there's no existing JSDoc comment
              if (!hasJSDocComment(node)) {
                // Get the indentation of the method definition line
                const methodLineIndex = node.loc.start.line - 1;
                const methodLine = sourceCode.getLines()[methodLineIndex];
                const indentation = methodLine.match(/^\s*/)?.[0] ?? '';

                // Find the start position of the method definition using its column
                const methodStartIndex = sourceCode.getIndexFromLoc({
                  line: node.loc.start.line,
                  column: node.loc.start.column
                });

                // Insert the comment at the beginning of the method definition
                // This ensures the comment has the same indentation as the method
                return fixer.replaceTextRange(
                  [methodStartIndex, methodStartIndex],
                  `/** @override */\n${indentation}`
                );
              }

              // If there's already a JSDoc comment but no @override, we don't auto-fix
              // as it might have other content that we don't want to modify
              return null;
            }
          });
        }
      }
    };
  }
});
