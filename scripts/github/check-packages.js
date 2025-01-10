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

async function addChangePackagePRLables(changePackageNames) {
  const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_REF } = process.env;
  const [owner, repo] = GITHUB_REPOSITORY.split('/');

  const releasePRLabelTemplate =
    feConfig.releasePRLabelTemplate || 'pkg:${name}';
  const labels = changePackageNames.map((name) =>
    releasePRLabelTemplate.replace('${name}', name)
  );
  if (labels.length > 0) {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    // get issue number
    const issueNumber = GITHUB_REF.split('/').pop();
    await octokit.issues.addLabels({
      owner,
      repo,
      issue_number: issueNumber,
      labels
    });
  }
}

async function main() {
  const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_REF } = process.env;

  if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !GITHUB_REF) {
    return;
  }

  const baseRef = process.argv[2];

  if (!baseRef) {
    return;
  }

  const changePackageNames = getChangePackageNames(baseRef);

  if (changePackageNames.length > 0) {
    await addChangePackagePRLables(changePackageNames);
    githubLog('success!', 'addLables');
  }
}

main().catch(() => {
  githubLog('error!', 'addLables');
});
