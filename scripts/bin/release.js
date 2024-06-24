const { execSync } = require('child_process');
const { loadEnv } = require('../loadEnv');
const pkg = require('../../package.json');
const releaseIt = require('../../.release-it.json');

function runCommand(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
    process.exit(1);
  }
}

// Function to clear environment variable
function clearEnvVariable(variable) {
  if (process.env[variable]) {
    delete process.env[variable];
  }
}

function main() {
  loadEnv();

  let npmToken;
  let ghToken;

  if (!(npmToken = process.env.NPM_TOKEN)) {
    console.error('NPM_TOKEN environment variable is not set.');
    process.exit(1);
  }
  if (!(ghToken = process.env.GITHUB_TOKEN)) {
    console.error('GITHUB_TOKEN environment variable is not set.');
    process.exit(1);
  }

  clearEnvVariable('GITHUB_TOKEN');

  runCommand(`echo "//registry.npmjs.org/:_authToken=${npmToken}" > .npmrc`);

  // // 确保设置了上游分支
  // try {
  //   runCommand('git branch -a');
  //   const branchName = execSync('git rev-parse --abbrev-ref HEAD')
  //     .toString()
  //     .trim();
  //   console.log(`Current branch is ${branchName}`);
  //   runCommand(`git push --set-upstream origin ${branchName}`);
  // } catch (error) {
  //   console.error('Failed to set upstream branch.');
  //   process.exit(1);
  // }

  console.log('Publishing to NPM and GitHub...');
  runCommand('npx release-it --ci', {
    env: {
      ...process.env,
      NPM_TOKEN: npmToken,
      GITHUB_TOKEN: ghToken
    }
  });

  // create PR to merge master branch
  console.log('Create PR to merge branch...');
  const mainBranch = releaseIt.git.pushRepo || 'master';
  const releaseBranch = `release-v${pkg.version}`;
  runCommand(`git checkout ${mainBranch}`);
  // runCommand(`git branch -d ${releaseBranch}`);
  runCommand(`git checkout -b ${releaseBranch}`);
  runCommand(`git push origin ${releaseBranch}`);

  // runCommand(`gh auth login --with-token <<< "${process.env.GITHUB_TOKEN}"`);
  runCommand(`echo "${ghToken}" | gh auth login --with-token`);
  runCommand(
    `gh pr create --title "Release ${mainBranch} v${pkg.version}" --body "This PR includes version bump to v${pkg.version}" --base ${mainBranch} --head ${releaseBranch}`
  );
}

main();
