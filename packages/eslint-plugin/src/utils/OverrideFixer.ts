import { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  getJSDocInsertPosition,
  getOverrideKeywordInsertPosition,
  removeJSDocOverrideLine,
  removeOverrideKeyword
} from './override-helpers';

/**
 * Fixer class for handling override-related code fixes
 *
 * This class provides methods to create ESLint fix functions for:
 * - Adding @override JSDoc comments
 * - Adding override keywords
 * - Removing unnecessary @override JSDoc comments
 * - Removing unnecessary override keywords
 *
 * All fixes preserve code formatting, indentation, and existing modifiers.
 *
 * @example
 * ```typescript
 * const fixer = new OverrideFixer(sourceCode);
 * const fix = fixer.addJSDocOverride(methodNode);
 * if (fix) {
 *   context.report({ node: methodNode, fix });
 * }
 * ```
 */
export class OverrideFixer {
  constructor(private sourceCode: TSESLint.SourceCode) {}

  /**
   * Create fix for adding @override JSDoc comment
   *
   * Handles three scenarios:
   * 1. Method has existing JSDoc with tags: inserts @override before first tag
   * 2. Method has JSDoc with only description: inserts @override after description
   * 3. Method has no JSDoc: creates new JSDoc block with @override
   *
   * @param node - The method node to add @override to
   * @returns Fix function or null if cannot insert
   */
  public addJSDocOverride(
    node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
  ): ((fixer: TSESLint.RuleFixer) => TSESLint.RuleFix) | null {
    const insertPos = getJSDocInsertPosition(node, this.sourceCode);
    if (!insertPos) {
      return null;
    }

    return (fixer) => {
      return fixer.insertTextBeforeRange(
        [insertPos.position, insertPos.position],
        insertPos.text
      );
    };
  }

  /**
   * Create fix for adding override keyword
   *
   * Inserts override keyword following TypeScript modifier order:
   * [accessibility] [static] [abstract] [override] [async] [get/set] methodName
   *
   * @param node - The method node to add override keyword to
   * @returns Fix function or null if cannot insert
   */
  public addOverrideKeyword(
    node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
  ): ((fixer: TSESLint.RuleFixer) => TSESLint.RuleFix) | null {
    const insertPos = getOverrideKeywordInsertPosition(node, this.sourceCode);
    if (insertPos === null) {
      return null;
    }

    return (fixer) => {
      return fixer.insertTextBeforeRange([insertPos, insertPos], 'override ');
    };
  }

  /**
   * Create fix for removing @override JSDoc comment
   *
   * Handles two scenarios:
   * 1. JSDoc block only contains @override: removes entire block
   * 2. JSDoc block has other content: removes only @override line
   *
   * @param node - The method node to remove @override from
   * @returns Fix function or null if nothing to remove
   */
  public removeJSDocOverride(
    node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
  ): ((fixer: TSESLint.RuleFixer) => TSESLint.RuleFix[]) | null {
    const removeFixes = removeJSDocOverrideLine(node, this.sourceCode);
    if (removeFixes.length === 0) {
      return null;
    }

    return (fixer) => {
      return removeFixes.map((fix) =>
        fixer.replaceTextRange(fix.range, fix.text)
      );
    };
  }

  /**
   * Create fix for removing override keyword
   *
   * Removes override keyword while preserving other modifiers and formatting.
   * Handles spacing correctly to avoid leaving extra spaces.
   *
   * @param node - The method node to remove override keyword from
   * @returns Fix function or null if nothing to remove
   */
  public removeOverrideKeyword(
    node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
  ): ((fixer: TSESLint.RuleFixer) => TSESLint.RuleFix[]) | null {
    const removeFixes = removeOverrideKeyword(node, this.sourceCode);
    if (removeFixes.length === 0) {
      return null;
    }

    return (fixer) => {
      return removeFixes.map((fix) =>
        fixer.replaceTextRange(fix.range, fix.text)
      );
    };
  }
}
