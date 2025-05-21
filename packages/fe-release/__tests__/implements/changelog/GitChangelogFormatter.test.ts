/* eslint-disable @typescript-eslint/no-explicit-any */
import { GitChangelogFormatter } from '../../../src/implments/changelog/GitChangelogFormatter';
import { createTestShell } from '../../helpers';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { CommitValue } from '../../../src/interface/ChangeLog';
import lodashTemplate from 'lodash/template';

describe('GitChangelogFormatter', () => {
  const mockShell = createTestShell();
  let formatter: GitChangelogFormatter;

  beforeEach(() => {
    vi.clearAllMocks();
    // Initialize shell.format mock implementation using lodash template for proper variable substitution
    (mockShell.format as any).mockImplementation(
      (templateStr: string, context: Record<string, unknown>) => {
        // Use lodash template to properly handle nested properties
        return lodashTemplate(templateStr)(context);
      }
    );

    formatter = new GitChangelogFormatter({
      shell: mockShell,
      repoUrl: 'https://github.com/test/repo'
    });
  });

  describe('formatScope', () => {
    it('should format scope with boldface', () => {
      const result = formatter.formatScope('ui');
      expect(result).toBe('**ui:**');
    });
  });

  describe('foramtLink', () => {
    it('should format link with URL', () => {
      const result = formatter.foramtLink('text', 'https://example.com');
      expect(result).toBe('([text](https://example.com))');
    });

    it('should format link without URL', () => {
      const result = formatter.foramtLink('text');
      expect(result).toBe('(text)');
    });
  });

  describe('formatCommitLink', () => {
    it('should format commit link with URL', () => {
      const result = formatter.formatCommitLink(
        'abc123',
        'https://github.com/commit/abc123'
      );
      expect(result).toBe('([abc123](https://github.com/commit/abc123))');
    });

    it('should format commit link without URL', () => {
      const result = formatter.formatCommitLink('abc123');
      expect(result).toBe('(abc123)');
    });
  });

  describe('formatCommit', () => {
    it('should format commit with all details', () => {
      const commit: CommitValue = {
        base: {
          hash: 'abc1234',
          subject: 'feat(ui): add new button',
          rawBody: 'feat(ui): add new button'
        } as any,
        commitlint: {
          type: 'feat',
          scope: 'ui',
          message: 'add new button'
        },
        commits: [],
        prNumber: '123'
      };

      const result = formatter.formatCommit(commit);

      // Test actual string content instead of contains
      expect(result).toBe(
        '\n- **ui:** add new button ([abc1234](https://github.com/test/repo/commit/abc1234)) ([#123](https://github.com/test/repo/pull/123))'
      );
    });

    it('should format commit without scope and PR', () => {
      const commit: CommitValue = {
        base: {
          hash: 'def5678',
          subject: 'chore: update dependencies',
          rawBody: 'chore: update dependencies'
        } as any,
        commitlint: {
          type: 'chore',
          message: 'update dependencies'
        },
        commits: []
      };

      const result = formatter.formatCommit(commit);

      expect(result).toBe(
        '\n-  update dependencies ([def5678](https://github.com/test/repo/commit/def5678)) '
      );
    });

    it('should use custom format template', () => {
      const commit: CommitValue = {
        base: {
          hash: 'abc1234',
          subject: 'fix(core): fix critical bug',
          rawBody: 'fix(core): fix critical bug'
        } as any,
        commitlint: {
          type: 'fix',
          scope: 'core',
          message: 'fix critical bug'
        },
        commits: [],
        prNumber: '456'
      };

      const result = formatter.formatCommit(commit, {
        formatTemplate:
          '* ${commitlint.type}: ${scopeHeader} ${commitlint.message}'
      });

      expect(result).toBe('* fix: **core:** fix critical bug');
    });
  });

  describe('format', () => {
    it('should format commits into changelog sections', () => {
      const commits: CommitValue[] = [
        {
          base: {
            hash: 'abc123',
            subject: 'feat(ui): add new component',
            rawBody: 'feat(ui): add new component'
          } as any,
          commitlint: {
            type: 'feat',
            scope: 'ui',
            message: 'add new component'
          },
          commits: []
        },
        {
          base: {
            hash: 'def456',
            subject: 'fix(api): resolve error handling',
            rawBody: 'fix(api): resolve error handling'
          } as any,
          commitlint: {
            type: 'fix',
            scope: 'api',
            message: 'resolve error handling'
          },
          commits: []
        },
        {
          base: {
            hash: 'ghi789',
            subject: 'chore: update dependencies',
            rawBody: 'chore: update dependencies'
          } as any,
          commitlint: {
            type: 'chore',
            message: 'update dependencies'
          },
          commits: []
        }
      ];

      const typeConfig = [
        { type: 'feat', section: '### Features' },
        { type: 'fix', section: '### Bug Fixes' },
        { type: 'chore', section: '### Maintenance', hidden: true }
      ];

      const result = formatter.format(commits, { types: typeConfig });

      // Check exact array contents instead of just contains
      expect(result).toEqual([
        '### Features',
        '\n- **ui:** add new component ([abc123](https://github.com/test/repo/commit/abc123)) ',
        '### Bug Fixes',
        '\n- **api:** resolve error handling ([def456](https://github.com/test/repo/commit/def456)) '
      ]);
    });

    it('should handle commits with body text', () => {
      const commits: CommitValue[] = [
        {
          base: {
            hash: 'abc123',
            subject: 'feat(ui): add new feature',
            rawBody:
              'feat(ui): add new feature\n\nDetailed description\nMultiple lines',
            body: 'Detailed description\nMultiple lines'
          } as any,
          commitlint: {
            type: 'feat',
            scope: 'ui',
            message: 'add new feature'
          },
          commits: []
        }
      ];

      const typeConfig = [{ type: 'feat', section: '### Features' }];

      const result = formatter.format(commits, { types: typeConfig });

      expect(result).toEqual([
        '### Features',
        '\n- **ui:** add new feature ([abc123](https://github.com/test/repo/commit/abc123)) ',
        '  Detailed description',
        '  Multiple lines'
      ]);
    });

    it('should handle commits with unknown type', () => {
      const commits: CommitValue[] = [
        {
          base: {
            hash: 'xyz999',
            subject: 'unknown: this is not a standard type',
            rawBody: 'unknown: this is not a standard type'
          } as any,
          commitlint: {
            type: 'unknown',
            message: 'this is not a standard type'
          },
          commits: []
        }
      ];

      const typeConfig = [
        { type: 'feat', section: '### Features' },
        { type: 'fix', section: '### Bug Fixes' }
      ];

      // Since 'unknown' is not in the types config, it should not appear in the result
      const result = formatter.format(commits, { types: typeConfig });

      expect(result.length).toBe(0);
    });
  });
});
