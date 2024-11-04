import { execSync } from 'child_process';
import { createInterface } from 'readline';

/**
 * @param {import('@qlover/fe-scripts/scripts').CleanBranchOptions} options
 */
export function cleanBranch(options) {
  const { protectedBranches = [], logger } = options;

  // Fetch and prune remote branches
  execSync('git fetch -p', { stdio: 'inherit' });

  // Get the current branch
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
    encoding: 'utf8'
  }).trim();

  if (protectedBranches.length > 0) {
    logger.warn(
      'Branches without specified protection, important branches may be deleted'
    );
  }

  // Get the list of local branches
  const branchesOutput = execSync('git branch -vv', { encoding: 'utf8' });
  const branches = branchesOutput
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line);

  // Find branches that are gone from the remote and not protected
  const branchesToDelete = branches
    .filter((line) => line.includes(': gone]'))
    .map((line) => line.split(' ')[0].replace('*', '').trim())
    .filter(
      (branch) =>
        branch !== currentBranch && !protectedBranches.includes(branch)
    );

  // Function to ask for user confirmation
  const askUserConfirmation = (branchesToDelete) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    logger.log('The following branches will be deleted:');
    branchesToDelete.forEach((branch) => logger.log(branch));

    rl.question(
      'Are you sure you want to delete these branches? (yes/no) ',
      (answer) => {
        if (answer.toLowerCase() === 'yes') {
          // Delete the local branches that are gone from the remote
          branchesToDelete.forEach((branch) => {
            try {
              execSync(`git branch -d ${branch}`, { stdio: 'inherit' });
              logger.log(`Deleted branch ${branch}`);
            } catch {
              // if branch is not fully merged, attempt to force delete
              try {
                logger.warn(
                  `Branch ${branch} is not fully merged, attempting force delete...`
                );
                execSync(`git branch -D ${branch}`, { stdio: 'inherit' });
                logger.log(`Force deleted branch ${branch}`);
              } catch (forceError) {
                logger.error(
                  `Failed to delete branch ${branch}:`,
                  forceError.message
                );
              }
            }
          });
        } else {
          logger.log('Branch deletion aborted.');
        }
        rl.close();
      }
    );
  };

  // Proceed only if there are branches to delete
  if (branchesToDelete.length > 0) {
    askUserConfirmation(branchesToDelete);
  } else {
    logger.log('No branches to delete.');
  }
}
