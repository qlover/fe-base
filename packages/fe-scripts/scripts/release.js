import { Release } from '../lib/Release.js';
import { searchEnv } from './search-env.js';

/**
 * @param {Release} release
 * @returns {number}
 */
function setupRelease(release) {
  const env = searchEnv({
    logger: release.log,
    shell: release.shell
  });

  if (env.get('RELEASE') === 'false') {
    release.log.warn('Skip Release');
    return 1;
  }

  if (!env.get('NPM_TOKEN')) {
    release.log.error('NPM_TOKEN environment variable is not set.');
    return 1;
  }

  if (!env.get('GITHUB_TOKEN')) {
    release.log.error('GITHUB_TOKEN environment variable is not set.');
    return 1;
  }

  // github cli need first clear
  release.config.ghToken = env.getEnvDestroy('GITHUB_TOKEN') || '';
  release.config.npmToken = env.get('NPM_TOKEN');
  release.config.branch = env.get('PR_BRANCH');
  release.config.env = env.get('NODE_ENV');
}

/**
 * release to NPM and Github
 * @param {import('../index.d.ts').ReleaseConfig} options
 * @returns {Promise<void>}
 */
export async function release(options) {
  const release = new Release(options);

  release.log.debug(options);

  if (setupRelease(release)) {
    return;
  }

  // check npm
  await release.checkNpmAuth();

  await release.checkPublishPath();

  release.log.title('Release to NPM and Github ...');
  await release.publish();

  release.log.title('Release Successfully');
}

/**
 * update version and release to NPM and Github
 * @param {import('../index.d.ts').ReleaseConfig} options
 * @returns {Promise<void>}
 */
export async function createReleasePR(options) {
  const release = new Release(options);

  release.log.debug(options);

  if (setupRelease(release)) {
    return;
  }

  // check npm
  await release.checkNpmAuth();

  await release.checkPublishPath();

  const releaseResult = await release.createChangelogAndVersion();

  release.log.title('Create Release Branch ...');
  const { tagName, releaseBranch } = await release.createReleaseBranch();

  release.log.title('Create Release PR ...');
  const prNumber = await release.createReleasePR(
    tagName,
    releaseBranch,
    releaseResult
  );

  if (release.config.getReleaseFeConfig('autoMergeReleasePR')) {
    release.log.title('Auto Merge Release PR...');
    await release.autoMergePR(prNumber);

    await release.checkedPR(prNumber, releaseBranch);
  } else {
    release.log.info(
      `Please manually merge PR(#${prNumber}) and complete the publishing process afterwards`
    );
  }

  release.log.title(`Create Release PR(#${prNumber}) Successfully`);
}
