const { execSync } = require('child_process');
const { loadEnv } = require('../loadEnv');

function runCommand(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Error executing command: ${command}`, error);
    process.exit(1);
  }
}

function main() {
  loadEnv();

  if (!process.env.NPM_TOKEN) {
    console.error('NPM_TOKEN environment variable is not set.');
    process.exit(1);
  }
  if (!process.env.GITHUB_TOKEN) {
    console.error('GITHUB_TOKEN environment variable is not set.');
    process.exit(1);
  }

  runCommand(
    `echo "//registry.npmjs.org/:_authToken=${process.env.NPM_TOKEN}" > .npmrc`
  );

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
      NPM_TOKEN: process.env.NPM_TOKEN
    }
  });
}

main();
