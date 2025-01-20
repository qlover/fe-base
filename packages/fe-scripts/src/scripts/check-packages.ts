// #!/usr/bin/env node

import { execSync } from 'child_process';
import { FeScriptContext } from '@qlover/scripts-context';

export interface CheckPackagesOptions {
  /**
   * The base branch to check
   */
  baseRef: string;

  /**
   * The repository to check
   */
  repository: string;

  /**
   * The issue number to check
   */
  issueNumber: string;

  /**
   * The change package names
   */
  changePackageNames: string[];

  /**
   * The github token
   */
  token?: string;
}

function githubLog(value: unknown, key = 'githubLog'): void {
  value = typeof value === 'object' ? JSON.stringify(value) : value;
  console.log(`${key}=${value}`);
}

function getChangePackageNames(
  context: FeScriptContext<CheckPackagesOptions>
): string[] {
  const { baseRef } = context.options;
  const changedFiles = execSync(
    `git diff --name-only origin/${baseRef} HEAD`
  ).toString();

  // get real files changed
  const filteredFiles = changedFiles.split('\n');

  const releasePackages: string[] =
    context.feConfig.release?.packagesDirectories || [];

  const result = releasePackages.reduce(
    (acc, name) => {
      acc[name] = false;
      return acc;
    },
    {} as Record<string, boolean>
  );

  filteredFiles.forEach((file) => {
    releasePackages.forEach((name) => {
      if (file.startsWith(name)) {
        result[name] = true;
      }
    });
  });

  return Object.entries(result)
    .filter(([, value]) => value)
    .map(([key]) => key);
}

async function addChangePackagePRLables(
  context: FeScriptContext<CheckPackagesOptions>
): Promise<void> {
  const { repository, issueNumber, changePackageNames } = context.options;
  const [owner, repo] = repository.split('/');

  const changePackagesLabel =
    context.feConfig.release?.changePackagesLabel || '${name}';

  const labels = changePackageNames.map((name) =>
    changePackagesLabel.replace('${name}', name)
  );

  context.logger.verbose('changePackagesLabel', changePackagesLabel, labels);

  if (context.dryRun) {
    githubLog(labels, 'labels');
    return;
  }

  if (!context.options.token) {
    return;
  }

  if (labels.length > 0) {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: context.options.token });
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: Number(issueNumber),
      labels
    });
  }
}

export async function checkPackages(
  options: Partial<FeScriptContext<CheckPackagesOptions>>
): Promise<void> {
  const context = new FeScriptContext(options);

  context.logger.verbose('feconfig', context.feConfig);

  const { baseRef } = context.options;

  if (!baseRef) {
    context.logger.verbose('No baseRef provided');
    return;
  }

  if (!context.options.token) {
    context.options.token = process.env.GITHUB_TOKEN;
  }

  if (!context.options.token) {
    context.logger.verbose('No token provided');
    return;
  }

  githubLog(context.options, 'options');

  // if changePackageNames is not set, get it from the baseRef
  if (!context.options.changePackageNames) {
    const changePackageNames = getChangePackageNames(context);
    context.options.changePackageNames = changePackageNames;
  }

  const { changePackageNames } = context.options;

  githubLog(changePackageNames, 'changePackageNames');

  if (changePackageNames.length > 0) {
    await addChangePackagePRLables(context);
    githubLog('success!', 'addLables');
  }
}
