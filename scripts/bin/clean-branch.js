const { execSync } = require('child_process');
const readline = require('readline');

// Fetch and prune remote branches
execSync('git fetch -p', { stdio: 'inherit' });

// Get the current branch
const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
  encoding: 'utf8'
}).trim();

// Get the list of local branches
const branchesOutput = execSync('git branch -vv', { encoding: 'utf8' });
const branches = branchesOutput
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line);

// Find branches that are gone from the remote
const branchesToDelete = branches
  .filter(
    (line) => line.includes(': gone]') && !line.includes(` ${currentBranch} `)
  )
  .map((line) => line.split(' ')[0].replace('*', '').trim());

// Function to ask for user confirmation
const askUserConfirmation = (branchesToDelete) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('The following branches will be deleted:');
  branchesToDelete.forEach((branch) => console.log(branch));

  rl.question(
    'Are you sure you want to delete these branches? (yes/no) ',
    (answer) => {
      if (answer.toLowerCase() === 'yes') {
        // Delete the local branches that are gone from the remote
        branchesToDelete.forEach((branch) => {
          try {
            execSync(`git branch -d ${branch}`, { stdio: 'inherit' });
            console.log(`Deleted branch ${branch}`);
          } catch (error) {
            console.error(`Failed to delete branch ${branch}:`, error.message);
          }
        });
      } else {
        console.log('Branch deletion aborted.');
      }
      rl.close();
    }
  );
};

// Proceed only if there are branches to delete
if (branchesToDelete.length > 0) {
  askUserConfirmation(branchesToDelete);
} else {
  console.log('No branches to delete.');
}
