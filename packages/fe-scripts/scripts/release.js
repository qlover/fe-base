import { FeScriptContext } from '../lib/FeScriptContext.js';
import { Release } from '../lib/Release.js';

/**
 * create release instance
 * @param {import('@qlover/fe-scripts').ReleaseContext} scriptsOptions
 * @returns {Release}
 */
function createRelease(scriptsOptions) {
  const context = new FeScriptContext(scriptsOptions);

  if (context.env.get('FE_RELEASE') === 'false') {
    context.logger.warn('Skip Release');
    return;
  }

  const token = context.env.get('GITHUB_TOKEN') || context.env.get('PAT_TOKEN');
  if (!token) {
    context.logger.error(
      'GITHUB_TOKEN or PAT_TOKEN environment variable is not set.'
    );
    return;
  }

  const release = new Release(context);

  release.setGithubToken(token);

  // adjust env args
  const releaseBranch = context.env.get('FE_RELEASE_BRANCH') || 'master';
  const releaseEnv =
    context.env.get('FE_RELEASE_ENV') || context.env.get('NODE_ENV');

  release.options.releaseBranch = releaseBranch;
  release.options.releaseEnv = releaseEnv;

  return release;
}

/**
 * release to NPM and Github
 * @param {import('@qlover/fe-scripts').ReleaseContext} options
 * @returns {Promise<void>}
 */
export async function release(options) {
  const release = createRelease(options);

  release.logger.debug(release.options);

  // check npm
  await release.checkNpmAuth();

  await release.checkPublishPath();
  release.logger.title('Release to NPM and Github ...');
  await release.publish();

  release.logger.title('Release Successfully');
}

/**
 * update version and release to NPM and Github
 * @param {import('@qlover/fe-scripts').ReleaseContext} options
 * @returns {Promise<void>}
 */
export async function createReleasePR(options) {
  const release = createRelease(options);

  release.logger.debug(release.options);

  // npm_token is required
  if (!release.env.get('NPM_TOKEN')) {
    release.logger.error('NPM_TOKEN environment variable is not set.');
    return;
  }

  await release.checkPublishPath();

  const releaseResult = await release.createChangelogAndVersion();

  release.logger.title('Create Release Branch ...');
  const { tagName, releaseBranch } = await release.createReleaseBranch();

  release.logger.title('Create Release PR ...');
  const prNumber = await release.createReleasePR(
    tagName,
    releaseBranch,
    releaseResult
  );

  if (release.autoMergeReleasePR) {
    release.logger.title('Auto Merge Release PR...');
    await release.autoMergePR(prNumber);

    await release.checkedPR(prNumber, releaseBranch);
  } else {
    release.logger.info(
      `Please manually merge PR(#${prNumber}) and complete the publishing process afterwards`
    );
  }

  release.logger.title(`Create Release PR(#${prNumber}) Successfully`);
}
