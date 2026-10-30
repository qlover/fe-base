import { describe, expect, it } from 'vitest';
import {
  normalizeMarkdownSuffix,
  tsSourcePathToOutputMdPath
} from '../../src/utils/tsSourceToOutputMdPath';

describe('normalizeMarkdownSuffix', () => {
  it('defaults to .md', () => {
    expect(normalizeMarkdownSuffix()).toBe('.md');
    expect(normalizeMarkdownSuffix('')).toBe('.md');
  });

  it('adds a leading dot when missing', () => {
    expect(normalizeMarkdownSuffix('doc.md')).toBe('.doc.md');
  });
});

describe('tsSourcePathToOutputMdPath', () => {
  it('keeps .md by default', () => {
    expect(
      tsSourcePathToOutputMdPath('src/button/Button.tsx', {})
    ).toBe('src/button/Button.md');
  });

  it('applies custom suffix for gitignore', () => {
    expect(
      tsSourcePathToOutputMdPath('src/button/Button.tsx', {
        mdSuffix: '.doc.md'
      })
    ).toBe('src/button/Button.doc.md');
  });
});
