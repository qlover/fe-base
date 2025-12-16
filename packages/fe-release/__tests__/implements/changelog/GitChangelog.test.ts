import { GitChangelog } from '../../../src/implments/changelog/GitChangeLog';
import { createTestLogger, createTestShell } from '../../helpers';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { BaseCommit } from '../../../src/interface/ChangeLog';

describe('GitChangelog', () => {
  const mockShell = createTestShell();
  const mockLogger = createTestLogger();
  let gitChangelog: GitChangelog;

  beforeEach(() => {
    vi.clearAllMocks();
    gitChangelog = new GitChangelog({
      shell: mockShell,
      logger: mockLogger
    });
  });

  describe('parseCommitlint', () => {
    it('should parse conventional commit format correctly', () => {
      const message = 'feat(component): add new feature';
      const result = gitChangelog.parseCommitlint(message);

      expect(result).toEqual({
        type: 'feat',
        scope: 'component',
        message: 'add new feature'
      });
    });

    it('should parse commit message without scope', () => {
      const message = 'fix: resolve bug issue';
      const result = gitChangelog.parseCommitlint(message);

      expect(result).toEqual({
        type: 'fix',
        scope: undefined,
        message: 'resolve bug issue'
      });
    });

    it('should parse commit message without type', () => {
      const message = 'simple commit message';
      const result = gitChangelog.parseCommitlint(message);

      expect(result).toEqual({
        message: 'simple commit message'
      });
    });

    it('should handle PR references in commit messages', () => {
      const message = 'feat(ui): improve button design (#123)';
      const result = gitChangelog.parseCommitlint(message);

      expect(result).toEqual({
        type: 'feat',
        scope: 'ui',
        message: 'improve button design'
      });
    });

    it('should handle PR references in commit messages with body', () => {
      const messageBody = '\n\nThis is a detailed description of the feature.';
      const message = 'feat(ui): improve button design (#123)' + messageBody;
      const result = gitChangelog.parseCommitlint(message, message);

      expect(result).toEqual({
        type: 'feat',
        scope: 'ui',
        message: 'improve button design',
        body: gitChangelog.tabify(messageBody)
      });
    });
  });

  describe('toCommitValue', () => {
    it('should convert hash and message to CommitValue', () => {
      const hash = 'abc1234567890def';
      const message = 'feat(core): implement new feature';

      const result = gitChangelog.toCommitValue(hash, message);

      expect(result).toEqual({
        base: {
          hash,
          abbrevHash: 'abc1234',
          subject: 'feat(core): implement new feature',
          rawBody: 'feat(core): implement new feature',
          body: 'feat(core): implement new feature'
        },
        commitlint: {
          type: 'feat',
          scope: 'core',
          message: 'implement new feature'
        },
        commits: [],
        prNumber: undefined
      });
    });

    it('should extract PR number from commit message', () => {
      const hash = 'abc1234567890def';
      const message = 'fix(bug): resolve issue (#456)';

      const result = gitChangelog.toCommitValue(hash, message);

      expect(result.prNumber).toBe('456');
    });
  });

  describe('resolveTag', () => {
    it('should return tag if it exists', async () => {
      (mockShell.exec as any).mockResolvedValueOnce('v1.0.0');

      const result = await (gitChangelog as any).resolveTag('v1.0.0');

      expect(result).toBe('v1.0.0');
      expect(mockShell.exec).toHaveBeenCalledWith('git tag --list "v1.0.0"', {
        dryRun: false
      });
    });

    it('should return root commit hash when fallback is "root"', async () => {
      (mockShell.exec as any)
        .mockResolvedValueOnce('') // Tag doesn't exist
        .mockResolvedValueOnce('abcdef123456'); // Root commit hash

      const result = await (gitChangelog as any).resolveTag(
        'non-existent-tag',
        'root'
      );

      expect(result).toBe('abcdef123456');
      expect(mockShell.exec).toHaveBeenCalledWith(
        'git rev-list --max-parents=0 HEAD',
        { dryRun: false }
      );
    });

    it('should return HEAD when no tag is provided and fallback is not "root"', async () => {
      const result = await (gitChangelog as any).resolveTag(undefined, 'HEAD');

      expect(result).toBe('HEAD');
    });
  });

  describe('getGitLog', () => {
    it('should call gitlog with correct parameters', async () => {
      // Mock implementation of resolveTag
      vi.spyOn(gitChangelog as any, 'resolveTag').mockImplementation(
        async (tag, fallback) => {
          if (tag === 'v1.0.0') return 'v1.0.0';
          if (tag === 'v2.0.0') return 'v2.0.0';
          return fallback || 'HEAD';
        }
      );

      // Create a mock for gitlog
      const gitlogMock = vi.hoisted(() => vi.fn());
      vi.mock('gitlog', () => ({
        default: gitlogMock
      }));

      // Set expected return value
      const mockCommits: BaseCommit[] = [
        {
          hash: '123456',
          subject: 'feat: new feature',
          abbrevHash: '123',
          rawBody: 'feat: new feature'
        } as BaseCommit
      ];
      gitlogMock.mockResolvedValueOnce(mockCommits);

      // Call the method
      const result = await gitChangelog.getGitLog({
        from: 'v1.0.0',
        to: 'v2.0.0',
        directory: 'src',
        noMerges: true
      });

      // Expect gitlog to be called with correct parameters
      expect(gitlogMock).toHaveBeenCalledWith({
        repo: '.',
        number: 1000,
        fields: undefined,
        branch: 'v1.0.0..v2.0.0',
        file: 'src',
        nameStatus: false,
        includeMergeCommitFiles: false
      });

      // Expect the result to match the mock
      expect(result).toEqual(mockCommits);
    });
  });

  describe('getCommits', () => {
    it('should transform git commits to CommitValue array', async () => {
      // Mock getGitLog to return test data
      const mockGitCommits: BaseCommit[] = [
        {
          hash: '123456',
          subject: 'feat(ui): add button',
          rawBody: 'feat(ui): add button'
        } as BaseCommit,
        {
          hash: '789012',
          subject: 'fix: resolve issue',
          rawBody: 'fix: resolve issue'
        } as BaseCommit
      ];

      vi.spyOn(gitChangelog, 'getGitLog').mockResolvedValueOnce(mockGitCommits);

      // Create spy for parseCommitlint
      const parseCommitlintSpy = vi.spyOn(gitChangelog, 'parseCommitlint');

      // Mock return values for parseCommitlint
      parseCommitlintSpy.mockReturnValueOnce({
        type: 'feat',
        scope: 'ui',
        message: 'add button'
      });

      parseCommitlintSpy.mockReturnValueOnce({
        type: 'fix',
        scope: undefined,
        message: 'resolve issue'
      });

      // Call the method
      const result = await gitChangelog.getCommits();

      // Assertions
      expect(result).toHaveLength(2);

      // Check first commit
      expect(result[0]).toEqual({
        base: mockGitCommits[0],
        commitlint: {
          type: 'feat',
          scope: 'ui',
          message: 'add button'
        },
        commits: []
      });

      // Check second commit
      expect(result[1]).toEqual({
        base: mockGitCommits[1],
        commitlint: {
          type: 'fix',
          scope: undefined,
          message: 'resolve issue'
        },
        commits: []
      });

      // Verify parseCommitlint was called
      expect(parseCommitlintSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('tabify', () => {
    it('should add default indentation (2 spaces) to each line', () => {
      const input = 'first line\nsecond line\nthird line';
      const result = gitChangelog.tabify(input);
      expect(result).toBe('  first line\n  second line\n  third line');
    });

    it('should handle custom indentation size', () => {
      const input = 'first line\nsecond line';
      const result = gitChangelog.tabify(input, 4);
      expect(result).toBe('    first line\n    second line');
    });

    it('should handle empty lines', () => {
      const input = 'first line\n\nthird line';
      const result = gitChangelog.tabify(input);
      expect(result).toBe('  first line\n  \n  third line');
    });

    it('should trim whitespace from each line', () => {
      const input = '  first line  \n   second line   ';
      const result = gitChangelog.tabify(input);
      expect(result).toBe('  first line\n  second line');
    });

    it('should handle single line input', () => {
      const input = 'single line';
      const result = gitChangelog.tabify(input);
      expect(result).toBe('  single line');
    });
  });
});
