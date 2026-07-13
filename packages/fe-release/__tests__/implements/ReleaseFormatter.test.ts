import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TemplateEngine } from '@qlover/scripts-context';
import { ReleaseFormatter } from '../../src/implments/ReleaseFormatter';
import type { WorkspaceInterface } from '../../src/interface/WorkspaceInterface';

describe('ReleaseFormatter', () => {
  const engine = new TemplateEngine();
  const releaseBranchResult = {
    releaseBranch: 'release/fe-base-a1b2c3d4',
    releaseTagName: 'release-tag-1-patch-a1b2c3d4'
  };

  const context = {
    env: 'production',
    branch: 'master',
    releaseEnv: 'production',
    sourceBranch: 'master',
    publishPath: ''
  };

  const workspaces: WorkspaceInterface[] = [
    {
      name: 'pkg-a',
      version: '1.0.0',
      newVersion: '1.0.1',
      path: 'packages/a',
      root: '/repo/packages/a',
      packageJson: { name: 'pkg-a', version: '1.0.0' },
      changelog: '- feat: add feature'
    }
  ];

  it('should format PR title with release metadata', () => {
    const formatter = new ReleaseFormatter(engine, {
      repoName: 'fe-base',
      releaseId: 'a1b2c3d4',
      PRTitle: 'Release ${repoName} ${tagName} (${releaseId})'
    });

    const title = formatter.getPRTitle(releaseBranchResult, context, workspaces);

    expect(title).toBe(
      'Release fe-base release-tag-1-patch-a1b2c3d4 (a1b2c3d4)'
    );
  });

  it('should format PR body with single workspace changelog', () => {
    const formatter = new ReleaseFormatter(engine, {
      PRBody: 'Tag: ${tagName}\n\n${changelog}'
    });

    const body = formatter.getPRBody(workspaces, releaseBranchResult, context);

    expect(body).toBe('Tag: release-tag-1-patch-a1b2c3d4\n\n- feat: add feature');
  });

  it('should use default PR body template', () => {
    const formatter = new ReleaseFormatter(engine, {});
    const body = formatter.getPRBody(workspaces, releaseBranchResult, context);

    expect(body).toBe('## Changelog\n\n- feat: add feature');
  });

  it('should format PR body with batch changelogs', () => {
    const formatter = new ReleaseFormatter(engine, {
      PRBody: '${tagName}\n${changelog}'
    });

    const body = formatter.getPRBody(
      [
        workspaces[0],
        {
          name: 'pkg-b',
          version: '2.0.0',
          newVersion: '2.1.0',
          path: 'packages/b',
          root: '/repo/packages/b',
          packageJson: { name: 'pkg-b', version: '2.0.0' },
          changelog: '- fix: bug'
        }
      ],
      releaseBranchResult,
      context
    );

    expect(body).toContain('pkg-a@1.0.1 pkg-b@2.1.0');
    expect(body).toContain('## pkg-a 1.0.0');
    expect(body).toContain('- feat: add feature');
    expect(body).toContain('## pkg-b 2.0.0');
    expect(body).toContain('- fix: bug');
  });

  it('should format release branch and commit message from templates', () => {
    const formatter = new ReleaseFormatter(engine, {
      repoName: 'fe-base',
      releaseId: 'abc123',
      branchName: 'release/${repoName}-${releaseId}',
      commitMessage: 'chore(release): ${spaces}'
    });

    const branch = formatter.getReleaseBranch(workspaces);
    expect(branch.releaseBranch).toBe('release/fe-base-abc123');

    const message = formatter.getCommitMessage(workspaces);
    expect(message).toBe('chore(release): pkg-a@1.0.1');
  });
});
