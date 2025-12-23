import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree
} from '@typescript-eslint/utils';
import { MessageIds } from '../rules/ts-class-override';
import {
  getMethodName,
  getMethodNameString,
  hasOverrideJSDoc,
  hasOverrideKeyword
} from './override-helpers';
import { TypeChecker } from 'typescript';
import * as ts from 'typescript';
import { OverrideFixer } from './OverrideFixer';

export const OverrideStyle = {
  JSDoc: 'jsdoc',
  Keyword: 'keyword',
  Both: 'both',
  Either: 'either'
} as const;

type OverrideSource = {
  name: string;
  type: 'interface' | 'class';
};

export type OverrideStyleType =
  (typeof OverrideStyle)[keyof typeof OverrideStyle];

export type ClassOverrideOptions = {
  /**
   * Override style for parent class methods
   * - 'jsdoc': Only require @override JSDoc comments
   * - 'keyword': Only require TypeScript override keyword
   * - 'both': Require both @override JSDoc comment and override keyword
   * - 'either': Require either @override JSDoc comment or override keyword (or both)
   *
   * @default 'either'
   */
  parentClassOverrideStyle?: OverrideStyleType;
};

/**
 * Class override checker for enforcing consistent override notation
 *
 * This class provides the core logic for checking if methods need override notation
 * and reporting appropriate errors. It handles:
 *
 * 1. **Checking method override relationships**:
 *    - Methods that override parent class methods (via `extends`)
 *    - Methods that implement interface methods (via `implements`)
 *    - Uses TypeScript type checker for accurate detection
 *
 * 2. **Enforcing override notation**:
 *    - Interface methods: Always require `@override` JSDoc comment
 *    - Parent class methods: Require override notation based on configuration
 *      - Can use `@override` JSDoc comment
 *      - Can use TypeScript `override` keyword
 *      - Can require both or either (configurable)
 *
 * 3. **Skipping unnecessary checks**:
 *    - Static methods (don't override instance methods)
 *    - Private methods (`private` keyword or `#` syntax)
 *    - Constructors
 *    - Method overload signatures (no implementation)
 *
 * 4. **Reporting errors**:
 *    - Missing override notation when required
 *    - Unnecessary override notation when not needed
 *    - Provides automatic fixes for all errors
 *    - Fix functions may return `null` if they cannot create a fix (e.g., syntax issues)
 *    - Only includes `fix` property when fix function returns a non-null value
 *
 * @example
 * ```typescript
 * const checker = new ClassOverride(context, { parentClassOverrideStyle: 'either' });
 * checker.check(methodNode, classNode);
 * ```
 */
export class ClassOverride {
  protected parserServices: ReturnType<
    typeof ESLintUtils.getParserServices
  > | null;
  protected checker: TypeChecker | null;

  constructor(
    protected context: TSESLint.RuleContext<
      MessageIds,
      readonly [ClassOverrideOptions]
    >,
    protected options: ClassOverrideOptions
  ) {
    // Get parser services for TypeScript type checking (may not be available)
    try {
      const parserServices = ESLintUtils.getParserServices(context);
      this.checker = parserServices.program.getTypeChecker();
      this.parserServices = parserServices;
    } catch {
      // Type information not available, will use AST-based checking
      this.parserServices = null;
      this.checker = null;
    }
  }

  /**
   * Check if a method should be skipped for override checking
   *
   * Only public and protected instance methods need override checking.
   * This method skips:
   * - Method overload signatures (no implementation)
   * - Constructors
   * - Static methods (don't override instance methods)
   * - Private methods (`private` keyword or `#` syntax)
   *
   * @param node - The method node to check
   * @returns True if method should be skipped, false otherwise
   */
  public shouldSkipMethod(
    node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
  ): boolean {
    // Skip method overload signatures (they don't have a value/implementation)
    if (node.type === AST_NODE_TYPES.MethodDefinition && !node.value) {
      return true;
    }
    // Skip constructors
    if (
      node.type === AST_NODE_TYPES.MethodDefinition &&
      node.kind === 'constructor'
    ) {
      return true;
    }
    // Skip static methods - static methods don't override instance methods
    if (node.type === AST_NODE_TYPES.MethodDefinition && node.static === true) {
      return true;
    }
    // Skip private identifier methods (#method syntax)
    if (node.key.type === AST_NODE_TYPES.PrivateIdentifier) {
      return true;
    }
    // Skip private methods (check for 'private' keyword)
    if (this.isPrivateMethod(node)) {
      return true;
    }

    return false;
  }

  /**
   * Check if a method has private accessibility modifier
   *
   * Only checks for 'private' keyword in tokens. Private identifier methods
   * (`#method`) are handled separately in `shouldSkipMethod`.
   *
   * @param node - The method node to check
   * @returns True if method has private modifier, false otherwise
   */
  protected isPrivateMethod(
    node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
  ): boolean {
    const sourceCode = this.context.sourceCode;
    const tokens = sourceCode.getTokens(node, { includeComments: false });

    // Check for 'private' keyword in modifiers
    return tokens.some(
      (token) => token.type === 'Keyword' && token.value === 'private'
    );
  }

  /**
   * Check if a class needs override checking
   *
   * Only classes that extend another class or implement interfaces need checking.
   *
   * @param classNode - The class node to check
   * @returns True if class extends or implements, false otherwise
   */
  public shouldCheckMethod(
    classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression
  ): boolean {
    // Check if class extends another class
    if (classNode.superClass) {
      return true;
    }

    // Check if class implements any interfaces
    if (classNode.implements && classNode.implements.length > 0) {
      return true;
    }

    return false;
  }

  /**
   * Check if a method actually overrides a parent method or implements an interface method
   *
   * Uses TypeScript type checker to determine if a method:
   * - Implements a method from an interface (checked first, takes precedence)
   * - Overrides a method from a parent class
   * - Is inherited through multiple levels of inheritance
   *
   * Performance optimizations:
   * - Early return for computed properties (cannot check reliably)
   * - Interface check before parent class check (interfaces are more common)
   * - Caches method name lookup
   *
   * @param node - The method node to check
   * @param classNode - The containing class node
   * @returns Override source information if found, null otherwise
   */
  protected getOverrideSource(
    node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
    classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression
  ): OverrideSource | null {
    // Fast path: get method name early, return if computed property
    const methodName = getMethodNameString(node.key);
    if (!methodName) {
      // Cannot check computed properties
      return null;
    }

    try {
      // Get the TypeScript node for the class
      const tsClassNode =
        this.parserServices!.esTreeNodeToTSNodeMap.get(classNode);
      const classType = this.checker!.getTypeAtLocation(tsClassNode);

      if (!classType?.symbol) {
        return null;
      }

      // Check implemented interfaces first (more common case, faster check)
      // Interface check takes precedence over parent class check
      if (classNode.implements && classNode.implements.length > 0) {
        for (const implementClause of classNode.implements) {
          try {
            const interfaceNode =
              this.parserServices!.esTreeNodeToTSNodeMap.get(
                implementClause.expression
              );
            const interfaceType =
              this.checker!.getTypeAtLocation(interfaceNode);

            if (interfaceType?.symbol) {
              const interfaceMethodSymbol = interfaceType.symbol.members?.get(
                methodName as ts.__String
              );

              if (interfaceMethodSymbol) {
                // Get interface name
                let interfaceName = interfaceType.symbol.getName();
                if (!interfaceName) {
                  const expr = implementClause.expression;
                  if (expr.type === AST_NODE_TYPES.Identifier) {
                    interfaceName = expr.name;
                  } else {
                    interfaceName = '<interface>';
                  }
                }
                return { name: interfaceName, type: 'interface' as const };
              }
            }
          } catch {
            // Ignore errors when checking interfaces
          }
        }
      }

      // Check parent class (if extends)
      if (classNode.superClass) {
        try {
          const superClassNode = this.parserServices!.esTreeNodeToTSNodeMap.get(
            classNode.superClass
          );
          const superClassType =
            this.checker!.getTypeAtLocation(superClassNode);

          if (superClassType?.symbol) {
            const superMethodSymbol = superClassType.symbol.members?.get(
              methodName as ts.__String
            );

            if (superMethodSymbol) {
              // Get parent class name
              let parentClassName = superClassType.symbol.getName();
              if (!parentClassName) {
                const superClass = classNode.superClass;
                if (superClass.type === AST_NODE_TYPES.Identifier) {
                  parentClassName = superClass.name;
                } else {
                  parentClassName = '<class>';
                }
              }
              return { name: parentClassName, type: 'class' as const };
            }
          }
        } catch {
          // Ignore errors when checking parent class
        }
      }

      // Also check using TypeScript's type system for inheritance chain
      // This handles cases where methods might be inherited through multiple levels
      // Only check if no direct match found above (performance optimization)
      const baseTypes = this.checker!.getBaseTypes(
        classType as ts.InterfaceType
      );
      for (const baseType of baseTypes) {
        if (baseType.symbol) {
          const baseMethodSymbol = baseType.symbol.members?.get(
            methodName as ts.__String
          );

          if (baseMethodSymbol) {
            const baseName = baseType.symbol.getName() || '<base>';
            // Determine if it's an interface or class based on type flags
            const isInterface =
              (baseType.flags & ts.TypeFlags.Object) !== 0 &&
              (baseType as ts.ObjectType).objectFlags &
                ts.ObjectFlags.Interface;
            return {
              name: baseName,
              type: isInterface ? 'interface' : 'class'
            };
          }
        }
      }

      return null;
    } catch {
      // If type checking fails, return null
      return null;
    }
  }

  /**
   * Get the member type string for error messages
   *
   * Returns appropriate type string based on the method kind:
   * - "Getter" for getter methods
   * - "Setter" for setter methods
   * - "Abstract Method" for abstract methods
   * - "Method" for regular methods
   *
   * @param node - The method node
   * @returns Member type string for error messages
   */
  protected getMemberType(
    node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
  ): string {
    // Check if it's an abstract method
    if (node.type === AST_NODE_TYPES.TSAbstractMethodDefinition) {
      return 'Abstract Method';
    }

    if (node.type === AST_NODE_TYPES.MethodDefinition) {
      if (node.kind === 'get') {
        return 'Getter';
      }
      if (node.kind === 'set') {
        return 'Setter';
      }
    }
    return 'Method';
  }

  /**
   * Check a method for override notation requirements
   *
   * This is the main entry point for checking methods. It:
   * 1. Skips methods that don't need checking (static, private, etc.)
   * 2. Checks if the class extends or implements anything
   * 3. Determines if the method overrides something using type checking
   * 4. Reports errors and provides fixes based on configuration
   *
   * **Fix handling**: Fix functions may return `null` if they cannot create a fix
   * (e.g., due to syntax issues). In such cases, we only include the `fix` property
   * in the report when the fix function returns a non-null value. This ensures
   * compatibility with ESLint's fixable rule requirements.
   *
   * @param node - The method node to check
   * @param classNode - The containing class node
   */
  public check(
    node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
    classNode: TSESTree.ClassDeclaration | TSESTree.ClassExpression
  ): void {
    // Fast path: skip methods that don't need override checking
    // (static, private, constructors, overloads, etc.)
    if (this.shouldSkipMethod(node)) {
      return;
    }

    // Cache frequently used values
    const methodName = getMethodName(node.key);
    const memberType = this.getMemberType(node);
    const sourceCode = this.context.sourceCode;
    const hasJSDoc = hasOverrideJSDoc(node, sourceCode);
    const hasKeyword = hasOverrideKeyword(node);
    const fixer = new OverrideFixer(sourceCode);

    // Check if class extends or implements anything
    const hasExtendsOrImplements = this.shouldCheckMethod(classNode);

    // Get override source using type checking or fallback to AST-based heuristic
    let overrideSource: OverrideSource | null = null;
    if (hasExtendsOrImplements) {
      if (this.parserServices && this.checker) {
        // Use type checker for accurate detection
        overrideSource = this.getOverrideSource(node, classNode);
      } else {
        // Fallback: if type info not available, use AST-based heuristic
        // This is less accurate but still provides some value
        // We assume all methods in classes that extend/implement need override
        const hasExtends = !!classNode.superClass;
        const hasImplements =
          classNode.implements && classNode.implements.length > 0;

        if (hasImplements) {
          // Assume it implements an interface method
          const implementClause = classNode.implements![0];
          const interfaceName =
            implementClause.expression.type === AST_NODE_TYPES.Identifier
              ? implementClause.expression.name
              : 'unknown';
          overrideSource = {
            type: 'interface',
            name: interfaceName
          };
        } else if (hasExtends && classNode.superClass) {
          // Assume it overrides a parent class method
          const superClass = classNode.superClass;
          const parentClassName =
            superClass.type === AST_NODE_TYPES.Identifier
              ? superClass.name
              : 'unknown';
          overrideSource = {
            type: 'class',
            name: parentClassName
          };
        }
      }
    }

    // If class doesn't extend or implement anything, check for unnecessary override
    if (!hasExtendsOrImplements) {
      // Method does not override anything - check if it has unnecessary override
      if (hasJSDoc) {
        const removeJSDocFix = fixer.removeJSDocOverride(node);
        this.context.report({
          node,
          messageId: 'unnecessaryOverride',
          data: { methodName, memberType },
          ...(removeJSDocFix && { fix: removeJSDocFix })
        });
      }
      if (hasKeyword) {
        const removeKeywordFix = fixer.removeOverrideKeyword(node);
        this.context.report({
          node,
          messageId: 'unnecessaryOverrideKeyword',
          data: { methodName, memberType },
          ...(removeKeywordFix && { fix: removeKeywordFix })
        });
      }
      return;
    }

    // Check if method needs override
    if (overrideSource) {
      // Method overrides something - check if it has proper override notation
      if (overrideSource.type === 'interface') {
        // Interface methods always require @override JSDoc comment
        if (!hasJSDoc) {
          const addJSDocFix = fixer.addJSDocOverride(node);
          this.context.report({
            node,
            messageId: 'missingOverrideJSDoc',
            data: {
              methodName,
              memberType,
              sourceType: overrideSource.type,
              sourceName: overrideSource.name
            },
            ...(addJSDocFix && { fix: addJSDocFix })
          });
        }
        // Interface methods should not use override keyword (TypeScript doesn't allow it)
        if (hasKeyword) {
          // This would be a TypeScript error, but we can still report it
          // Actually, TypeScript allows override keyword on interface implementations
          // So we don't need to report this as an error
        }
      } else {
        // Parent class method - check based on parentClassOverrideStyle
        const style =
          this.options.parentClassOverrideStyle ?? OverrideStyle.Either;

        switch (style) {
          case 'jsdoc':
            if (!hasJSDoc) {
              const addJSDocFix = fixer.addJSDocOverride(node);
              this.context.report({
                node,
                messageId: 'missingOverrideJSDoc',
                data: {
                  methodName,
                  memberType,
                  sourceType: overrideSource.type,
                  sourceName: overrideSource.name
                },
                ...(addJSDocFix && { fix: addJSDocFix })
              });
            }
            if (hasKeyword) {
              const removeKeywordFix = fixer.removeOverrideKeyword(node);
              this.context.report({
                node,
                messageId: 'unnecessaryOverrideKeyword',
                data: { methodName, memberType },
                ...(removeKeywordFix && { fix: removeKeywordFix })
              });
            }
            break;

          case 'keyword':
            if (!hasKeyword) {
              const addKeywordFix = fixer.addOverrideKeyword(node);
              this.context.report({
                node,
                messageId: 'missingOverrideKeyword',
                data: {
                  methodName,
                  memberType,
                  sourceType: overrideSource.type,
                  sourceName: overrideSource.name
                },
                ...(addKeywordFix && { fix: addKeywordFix })
              });
            }
            if (hasJSDoc) {
              const removeJSDocFix = fixer.removeJSDocOverride(node);
              this.context.report({
                node,
                messageId: 'unnecessaryOverride',
                data: { methodName, memberType },
                ...(removeJSDocFix && { fix: removeJSDocFix })
              });
            }
            break;

          case 'both':
            if (!hasJSDoc) {
              const addJSDocFix = fixer.addJSDocOverride(node);
              this.context.report({
                node,
                messageId: 'missingOverrideJSDoc',
                data: {
                  methodName,
                  memberType,
                  sourceType: overrideSource.type,
                  sourceName: overrideSource.name
                },
                ...(addJSDocFix && { fix: addJSDocFix })
              });
            }
            if (!hasKeyword) {
              const addKeywordFix = fixer.addOverrideKeyword(node);
              this.context.report({
                node,
                messageId: 'missingOverrideKeyword',
                data: {
                  methodName,
                  memberType,
                  sourceType: overrideSource.type,
                  sourceName: overrideSource.name
                },
                ...(addKeywordFix && { fix: addKeywordFix })
              });
            }
            break;

          case 'either':
          default:
            if (!hasJSDoc && !hasKeyword) {
              // Prefer JSDoc for 'either' style (more compatible)
              const addJSDocFix = fixer.addJSDocOverride(node);
              this.context.report({
                node,
                messageId: 'missingOverrideEither',
                data: {
                  methodName,
                  memberType,
                  sourceType: overrideSource.type,
                  sourceName: overrideSource.name
                },
                ...(addJSDocFix && { fix: addJSDocFix })
              });
            }
            break;
        }
      }
    }
  }
}
