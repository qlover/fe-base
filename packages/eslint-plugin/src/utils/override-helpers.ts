/**
 * @module override-helpers
 * @description Utility functions for handling @override JSDoc comments and override keywords
 * 
 * This module provides helper functions for:
 * - Detecting @override JSDoc comments and override keywords
 * - Finding insertion positions for @override comments
 * - Finding insertion positions for override keywords
 * - Removing @override comments and keywords
 * - Analyzing JSDoc comment structure
 */

import type { TSESTree } from '@typescript-eslint/types';
import type { TSESLint } from '@typescript-eslint/utils';

/**
 * Check if a comment contains @override tag
 * Only matches actual JSDoc tags, not text within backticks or code blocks
 * 
 * @param comment - The comment to check
 * @returns True if comment contains @override tag, false otherwise
 */
export function hasOverrideComment(comment: TSESTree.Comment): boolean {
  const text = comment.type === 'Block' ? comment.value : comment.value;
  
  // Match @override as a JSDoc tag (not inside backticks or code blocks)
  // Pattern: @override at start of line or after whitespace/asterisk, followed by whitespace/newline/end
  // Negative lookbehind to ensure it's not inside backticks
  const lines = text.split('\n');
  
  for (const line of lines) {
    // Remove leading asterisks and whitespace for JSDoc parsing
    const cleanedLine = line.replace(/^\s*\*\s?/, '').trim();
    
    // Check if line starts with @override (case-insensitive)
    // and it's not inside backticks
    if (/^@override\b/i.test(cleanedLine)) {
      // Verify it's not inside backticks by checking the original line
      // Count backticks before @override
      const beforeOverride = line.substring(0, line.indexOf('@override'));
      const backtickCount = (beforeOverride.match(/`/g) || []).length;
      
      // If odd number of backticks before @override, it's inside a code block
      if (backtickCount % 2 === 0) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Check if a method has @override comment in its leading comments
 * 
 * @param node - The method node
 * @param sourceCode - The source code object
 * @returns True if method has @override JSDoc comment, false otherwise
 */
export function hasOverrideJSDoc(
  node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
  sourceCode: TSESLint.SourceCode
): boolean {
  const comments = sourceCode.getCommentsBefore(node);
  return comments.some(hasOverrideComment);
}

/**
 * Check if a method has TypeScript override keyword
 * 
 * @param node - The method node
 * @returns True if method has override keyword, false otherwise
 */
export function hasOverrideKeyword(
  node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition
): boolean {
  // TypeScript 4.3+ override keyword is stored in the override property
  return 'override' in node && node.override === true;
}

/**
 * Get the method name as a string (for symbol lookup)
 * 
 * @param key - The property name node
 * @returns The method name as string, or null for computed properties
 */
export function getMethodNameString(key: TSESTree.PropertyName): string | null {
  if (key.type === 'Identifier') {
    return key.name;
  }
  if (key.type === 'PrivateIdentifier') {
    return key.name;
  }
  // Computed properties cannot be checked reliably
  return null;
}

/**
 * Get the method name for error reporting
 * 
 * @param key - The property name node
 * @returns The method name as string, or '<computed>' for computed properties
 */
export function getMethodName(key: TSESTree.PropertyName): string {
  if (key.type === 'Identifier') {
    return key.name;
  }
  if (key.type === 'PrivateIdentifier') {
    return key.name;
  }
  return '<computed>';
}

/**
 * Find the first JSDoc tag line in a comment block
 * Returns the line index and content, or null if no tags found
 * 
 * @param comment - The comment block to search
 * @returns Object with lineIndex and line content, or null if no tags found
 */
export function findFirstJSDocTagLine(
  comment: TSESTree.Comment
): { lineIndex: number; line: string } | null {
  if (comment.type !== 'Block') {
    return null;
  }

  const lines = comment.value.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Remove leading asterisks and whitespace
    const cleanedLine = line.replace(/^\s*\*\s?/, '').trim();
    
    // Check if line starts with @ (JSDoc tag) and it's not inside backticks
    if (/^@\w+/.test(cleanedLine)) {
      // Verify it's not inside backticks
      const beforeAt = line.substring(0, line.indexOf('@'));
      const backtickCount = (beforeAt.match(/`/g) || []).length;
      
      // If even number of backticks before @, it's a real tag
      if (backtickCount % 2 === 0) {
        return { lineIndex: i, line };
      }
    }
  }
  
  return null;
}

/**
 * Check if a JSDoc comment block only contains @override tag
 * (ignoring whitespace, asterisks, and comment delimiters)
 * 
 * @param comment - The comment block to check
 * @returns True if only @override tag exists, false otherwise
 */
export function isOnlyOverrideComment(comment: TSESTree.Comment): boolean {
  if (comment.type !== 'Block') {
    return false;
  }

  const lines = comment.value.split('\n');
  let hasOverride = false;
  let hasOtherContent = false;

  for (const line of lines) {
    const cleanedLine = line.replace(/^\s*\*\s?/, '').trim();
    
    // Skip empty lines
    if (!cleanedLine) {
      continue;
    }

    // Check if it's @override tag
    if (/^@override\b/i.test(cleanedLine)) {
      const beforeOverride = line.substring(0, line.indexOf('@override'));
      const backtickCount = (beforeOverride.match(/`/g) || []).length;
      
      if (backtickCount % 2 === 0) {
        hasOverride = true;
        continue;
      }
    }

    // Any other non-empty content
    hasOtherContent = true;
  }

  return hasOverride && !hasOtherContent;
}

/**
 * Get the indentation of a node (number of spaces/tabs before it)
 * 
 * @param node - The AST node
 * @param sourceCode - The source code object
 * @returns The indentation string (spaces or tabs)
 */
export function getNodeIndentation(
  node: TSESTree.Node,
  sourceCode: TSESLint.SourceCode
): string {
  const line = sourceCode.lines[node.loc.start.line - 1];
  const match = line.match(/^(\s*)/);
  return match ? match[1] : '';
}

/**
 * Get the position and text to insert @override JSDoc comment
 * 
 * Strategy:
 * 1. If method has JSDoc with tags: insert before first tag
 * 2. If method has JSDoc with only description: insert after description
 * 3. If method has no JSDoc: create new JSDoc block
 * 
 * @param node - The method node
 * @param sourceCode - The source code object
 * @returns Object with position and text to insert, or null if cannot insert
 */
export function getJSDocInsertPosition(
  node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
  sourceCode: TSESLint.SourceCode
): { position: number; text: string } | null {
  const comments = sourceCode.getCommentsBefore(node);
  const jsdocComment = comments.find((c) => c.type === 'Block');

  const indent = getNodeIndentation(node, sourceCode);

  if (jsdocComment) {
    // Method has existing JSDoc comment
    const firstTag = findFirstJSDocTagLine(jsdocComment);

    if (firstTag) {
      // Has JSDoc tags - insert before first tag
      const commentStart = jsdocComment.range[0];
      const lines = jsdocComment.value.split('\n');
      
      // Calculate position: comment start + 2 (for /**) + sum of lines before tag
      let position = commentStart + 2; // Skip /**
      for (let i = 0; i < firstTag.lineIndex; i++) {
        position += lines[i].length + 1; // +1 for newline
      }

      // Get the indentation of the tag line (should match it)
      const tagLine = lines[firstTag.lineIndex];
      const tagIndent = tagLine.match(/^(\s*\*?\s*)/)?.[1] || ' * ';
      
      // Always insert @override on its own line before the first tag
      // Format: \n * @override\n (the position is already at the start of the tag line)
      return {
        position,
        text: `${tagIndent}@override\n`
      };
    } else {
      // Has JSDoc but no tags - insert before closing */
      const commentEnd = jsdocComment.range[1];
      const lines = jsdocComment.value.split('\n');
      
      // Find the last non-empty line to determine indentation
      let lastNonEmptyLine = '';
      for (let i = lines.length - 1; i >= 0; i--) {
        const trimmed = lines[i].trim();
        if (trimmed && trimmed !== '*') {
          lastNonEmptyLine = lines[i];
          break;
        }
      }
      
      // Extract the star indentation from the last line
      const starMatch = lastNonEmptyLine.match(/^(\s*\*\s?)/);
      const starIndent = starMatch ? starMatch[1] : ' * ';
      
      // Position is right before the closing */
      // We need to insert: \n * @override
      const lastLine = lines[lines.length - 1];
      const position = commentEnd - lastLine.length - 2; // -2 for */
      
      return {
        position,
        text: `\n${starIndent}@override\n${lastLine.replace(/\*/, '')}`
      };
    }
  } else {
    // No JSDoc comment - create new one
    return {
      position: node.range[0],
      text: `/**\n${indent} * @override\n${indent} */\n${indent}`
    };
  }
}

/**
 * Get the position to insert override keyword
 * 
 * Follows TypeScript modifier order:
 * [accessibility] [static] [abstract] [override] [async] [get/set] methodName
 * 
 * @param node - The method node
 * @param sourceCode - The source code object
 * @returns Position to insert override keyword, or null if cannot insert
 */
export function getOverrideKeywordInsertPosition(
  node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
  sourceCode: TSESLint.SourceCode
): number | null {
  const tokens = sourceCode.getTokens(node, { includeComments: false });

  // Find the right position based on existing modifiers
  // Order: [public/private/protected] [static] [abstract] [override] [async] [get/set]

  // Check for abstract keyword
  const abstractToken = tokens.find(
    (token) => token.type === 'Keyword' && token.value === 'abstract'
  );
  if (abstractToken) {
    // Insert before abstract
    return abstractToken.range[0];
  }

  // Check for async keyword (only in method signature, not in body)
  const asyncToken = tokens.find((token) => {
    if (token.value !== 'async') {
      return false;
    }
    // For MethodDefinition, check if token is before method body
    if (node.type === 'MethodDefinition' && node.value) {
      if (node.value.body && 'range' in node.value.body) {
        return token.range[1] <= node.value.body.range[0];
      }
      return true;
    }
    return true;
  });
  if (asyncToken) {
    // Insert before async
    return asyncToken.range[0];
  }

  // Check for get/set keywords
  if ('kind' in node && (node.kind === 'get' || node.kind === 'set')) {
    const getSetToken = tokens.find(
      (token) => token.value === 'get' || token.value === 'set'
    );
    if (getSetToken) {
      // Insert before get/set
      return getSetToken.range[0];
    }
  }

  // Check for computed property [
  if (node.computed) {
    const bracketToken = tokens.find((token) => token.value === '[');
    if (bracketToken) {
      // Insert before [
      return bracketToken.range[0];
    }
  }

  // No special modifiers - insert before method name/key
  return node.key.range[0];
}

/**
 * Remove @override line from JSDoc comment
 * 
 * @param node - The method node
 * @param sourceCode - The source code object
 * @returns Array of fix operations
 */
export function removeJSDocOverrideLine(
  node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
  sourceCode: TSESLint.SourceCode
): TSESLint.RuleFix[] {
  const comments = sourceCode.getCommentsBefore(node);
  const jsdocComment = comments.find((c) => c.type === 'Block');

  if (!jsdocComment) {
    return [];
  }

  // Check if comment only contains @override
  if (isOnlyOverrideComment(jsdocComment)) {
    // Remove entire comment block including leading whitespace
    const textBeforeComment = sourceCode.text.substring(0, jsdocComment.range[0]);
    const lastNewlineIndex = textBeforeComment.lastIndexOf('\n');
    const leadingWhitespace = textBeforeComment.substring(lastNewlineIndex + 1);
    
    // If there's only whitespace before the comment on this line, remove it too
    const startPos = /^\s*$/.test(leadingWhitespace) 
      ? lastNewlineIndex + 1 
      : jsdocComment.range[0];
    
    // Find the end position - include newline after */ if present
    const textAfterComment = sourceCode.text.substring(jsdocComment.range[1]);
    const hasNewlineAfter = textAfterComment.startsWith('\n') || textAfterComment.startsWith('\r\n');
    const endPos = hasNewlineAfter 
      ? jsdocComment.range[1] + (textAfterComment.startsWith('\r\n') ? 2 : 1)
      : jsdocComment.range[1];
    
    return [
      {
        range: [startPos, endPos],
        text: ''
      }
    ];
  }

  // Comment has other content - only remove @override line
  const lines = jsdocComment.value.split('\n');
  const commentStart = jsdocComment.range[0];

  let position = commentStart + 2; // Skip /**
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const cleanedLine = line.replace(/^\s*\*\s?/, '').trim();

    if (/^@override\b/i.test(cleanedLine)) {
      const beforeOverride = line.substring(0, line.indexOf('@override'));
      const backtickCount = (beforeOverride.match(/`/g) || []).length;

      if (backtickCount % 2 === 0) {
        // Found @override line - remove it
        const lineStart = position;
        const lineEnd = position + line.length + 1; // +1 for newline

        return [
          {
            range: [lineStart, lineEnd],
            text: ''
          }
        ];
      }
    }

    position += line.length + 1; // +1 for newline
  }

  return [];
}

/**
 * Remove override keyword from method
 * 
 * @param node - The method node
 * @param sourceCode - The source code object
 * @returns Array of fix operations
 */
export function removeOverrideKeyword(
  node: TSESTree.MethodDefinition | TSESTree.TSAbstractMethodDefinition,
  sourceCode: TSESLint.SourceCode
): TSESLint.RuleFix[] {
  if (!hasOverrideKeyword(node)) {
    return [];
  }

  const tokens = sourceCode.getTokens(node, { includeComments: false });
  const overrideToken = tokens.find(
    (token) => token.type === 'Identifier' && token.value === 'override'
  );

  if (!overrideToken) {
    return [];
  }

  // Find the next token to determine how much whitespace to remove
  const tokenIndex = tokens.indexOf(overrideToken);
  const nextToken = tokens[tokenIndex + 1];

  if (nextToken) {
    // Remove override and the space after it
    return [
      {
        range: [overrideToken.range[0], nextToken.range[0]],
        text: ''
      }
    ];
  } else {
    // No next token - just remove override
    return [
      {
        range: overrideToken.range,
        text: ''
      }
    ];
  }
}

