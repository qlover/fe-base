// #!/usr/bin/env node

import { execSync } from 'child_process';
import {
  ScriptContext,
  ScriptContextInterface,
  ScriptSharedInterface
} from '@qlover/scripts-context';
import { findWorkspaces } from 'find-workspaces';
import { relative, join } from 'path';

export interface CheckPackagesOptions extends ScriptSharedInterface {
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

function getWorkspacePackages(
  context: ScriptContextInterface<CheckPackagesOptions>
): string[] {
  const packagesDirectories =
    context.feConfig.release?.packagesDirectories || [];

  if (Array.isArray(packagesDirectories) && packagesDirectories.length > 0) {
    return packagesDirectories;
  }

  const root = process.cwd();

  return (findWorkspaces(root) || []).map((workspace) =>
    relative(root, workspace.location)
  );
}

function getChangePackageNames(
  context: ScriptContextInterface<CheckPackagesOptions>
): string[] {
  const { baseRef } = context.options;
  const changedFiles = execSync(
    `git diff --name-only origin/${baseRef} HEAD`
  ).toString();

  const filteredFiles = changedFiles.split('\n').filter(Boolean);
  const releasePackages = getWorkspacePackages(context);

  const normalizedReleasePackages = releasePackages.map((pkgPath) =>
    join(pkgPath)
  );
  const normalizedFilteredFiles = filteredFiles.map((file) => join(file));

  return normalizedReleasePackages.filter((pkgPath) =>
    normalizedFilteredFiles.some((file) => file.startsWith(pkgPath))
  );
}

async function addChangePackagePRLables(
  context: ScriptContextInterface<CheckPackagesOptions>
): Promise<void> {
  const { repository, issueNumber, changePackageNames } = context.options;
  const [owner, repo] = repository.split('/');

  const changePackagesLabel =
    context.feConfig.release?.changePackagesLabel || '${name}';

  const labels = changePackageNames.map((name) =>
    changePackagesLabel.replace('${name}', name)
  );

  context.logger.debug('changePackagesLabel', changePackagesLabel, labels);

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
  options: Partial<ScriptContextInterface<CheckPackagesOptions>>
): Promise<void> {
  const context = new ScriptContext('fe-scripts-check-packages', options);

  context.logger.debug('feconfig', context.feConfig);

  const { baseRef } = context.options;

  if (!baseRef) {
    context.logger.debug('No baseRef provided');
    return;
  }

  if (!context.options.token) {
    context.options.token = process.env.GITHUB_TOKEN;
  }

  if (!context.options.token) {
    context.logger.debug('No token provided');
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
