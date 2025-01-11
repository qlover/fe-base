// #!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import { dirname, resolve } from 'path';
import { githubLog } from './log.js';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const feConfigPath = resolve(__dirname, '../../fe-config.json');
const feConfig = JSON.parse(fs.readFileSync(feConfigPath, 'utf-8'));

function getChangePackageNames(barnch) {
  const changedFiles = execSync(
    `git diff --name-only origin/${barnch} HEAD`
  ).toString();

  // get real files changed
  const filteredFiles = changedFiles.split('\n');

  const releasePackages = feConfig.releasePackages || [];

  const result = releasePackages.reduce((acc, name) => {
    acc[name] = false;
    return acc;
  }, {});

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

async function addChangePackagePRLables({
  changePackageNames,
  repository,
  issueNumber
}) {
  const { GITHUB_TOKEN } = process.env;
  const [owner, repo] = repository.split('/');

  const releasePRLabelTemplate = feConfig.releasePRLabelTemplate || '${name}';
  const labels = changePackageNames.map((name) =>
    releasePRLabelTemplate.replace('${name}', name)
  );
  if (labels.length > 0) {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels
    });
  }
}

async function main() {
  const { GITHUB_TOKEN } = process.env;

  if (!GITHUB_TOKEN) {
    return;
  }

  const [repository, baseRef, issueNumber] = process.argv.slice(2);

  if (!baseRef) {
    return;
  }

  const options = { repository, baseRef, issueNumber };
  githubLog(options, 'options');

  const changePackageNames = getChangePackageNames(options.baseRef);
  githubLog(changePackageNames, 'changePackageNames');

  if (changePackageNames.length > 0) {
    await addChangePackagePRLables({ changePackageNames, ...options });
    githubLog('success!', 'addLables');
  }
}

main();
