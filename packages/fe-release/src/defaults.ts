/**
 * @module FeReleaseDefaults
 * @description Internal constants for fe-release
 *
 * User-facing default configuration lives in `release.json` and is
 * injected into {@link ReleaseContext} at construction time.
 */

/**
 * Default name for the release task context (fe-config.json key)
 */
export const defaultReleaaseName = 'release';

/**
 * Path to package manifest file
 */
export const MANIFEST_PATH = 'package.json';

/**
 * Template opening delimiter
 */
export const TEMPLATE_OPEN = '{{';

export const releaseJson = {
  sourceBranch: 'master',
  releaseEnv: 'development',
  github: {
    mode: 'createPR',
    mergeType: 'squash',
    autoMergeReleasePR: false,
    pushChangeLabels: false,
    skipCreateReleasePR: false,
    /** Used when releasing 1–2 packages */
    PRTitle: 'Release ${spaces}',
    /** Used when releasing more than 2 packages */
    PRTitleMany: 'Release ${count} packages: ${spaces}',
    PRBody: '## Changelog\n\n${changelog}',
    /**
     * Per-workspace section in the PR body (single and multi package).
     * `${changeTypeSection}` is Patch/Minor/Major Changes from increment.
     */
    batchPRBody:
      '\n### ${name}@${newVersion}\n\n#### ${changeTypeSection}\n\n${changelog}\n',
    branchName: 'release/${repoName}-${releaseId}',
    releaseTagName: 'release-tag-${count}-patch-${releaseId}',
    commitMessage: 'chore(release): ${spaces}',
    /** GitHub release title template (createRelease mode) */
    releaseName: '${name}@${version}',
    /** Path prefixes skipped when creating GitHub releases */
    ignoreReleasePaths: [] as readonly string[],
    label: {
      name: 'CI-Release',
      color: '1A7F37',
      description: 'Automated release PR (merge to publish)'
    }
  },
  changesetVersion: {
    mode: 'version',
    increment: 'patch',
    changesetRoot: '.changeset',
    ignoreNonUpdatedPackages: false,
    dependencyReleaseTemplate:
      '- Update dependency **${name}** from `${oldVersion}` to `${newVersion}`',
    formatTemplate:
      '\n- ${scopeHeader} ${commitlint.message} ${commitLink} ${prLink}',
    types: [
      { type: 'feat', section: '#### ✨ Features', hidden: false },
      { type: 'fix', section: '#### 🐞 Bug Fixes', hidden: false },
      { type: 'chore', section: '#### 🔧 Chores', hidden: true },
      { type: 'docs', section: '#### 📝 Documentation', hidden: false },
      { type: 'refactor', section: '#### ♻️ Refactors', hidden: false },
      { type: 'perf', section: '#### 🚀 Performance', hidden: false },
      { type: 'test', section: '#### 🚨 Tests', hidden: true },
      { type: 'style', section: '#### 🎨 Styles', hidden: true },
      { type: 'ci', section: '#### 🔄 CI', hidden: true },
      { type: 'build', section: '#### 🚧 Build', hidden: false },
      { type: 'revert', section: '#### ⏪ Reverts', hidden: true },
      { type: 'release', section: '#### 🔖 Releases', hidden: true }
    ]
  },
  workspaces: {
    tagTemplate: '${name}@${version}',
    tagMatch: '${name}@*',
    includeDependencyReleases: true
  }
} as const;
