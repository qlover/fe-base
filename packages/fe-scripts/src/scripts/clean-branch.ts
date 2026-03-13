import { execSync } from 'child_process';
import { createInterface } from 'readline';
import {
  ScriptContext,
  type ScriptContextInterface,
  type ScriptSharedInterface
} from '@qlover/scripts-context';
import lodash from 'lodash';

const { union } = lodash;

export interface CleanBranchOptions extends ScriptSharedInterface {
  /**
   * Protected branches that should not be deleted
   * @default `fe-config.protectedBranches``
   */
  protectedBranches?: string[];

  /**
   * Whether to merge default protected branches
   * @default `false`
   */
  merge?: boolean;
}

function composeBranches(
  context: ScriptContextInterface<CleanBranchOptions>
): string[] {
  const defaultBranches = context.feConfig?.protectedBranches || [];
  const { protectedBranches = [], merge = false } = context.options || {};
  if (protectedBranches && protectedBranches.length) {
    return merge
      ? union([...protectedBranches, ...defaultBranches])
      : protectedBranches;
  }
  return defaultBranches;
}

export function cleanBranch(
  options: Partial<ScriptContextInterface<CleanBranchOptions>>
): void {
  const context = new ScriptContext('fe-scripts-clean-branch', options);
  const { logger, verbose, dryRun } = context;

  const protectedBranches = composeBranches(context);

  if (verbose) {
    logger.info(`Will delete branches, if exist:`);
    logger.info(protectedBranches);
  }

  if (protectedBranches.length === 0) {
    logger.warn(
      'No protected branches found, important branches may be deleted!'
    );
  }

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

  // Get all local branch names
  const localBranchesOutput = execSync('git branch', { encoding: 'utf8' });
  const localBranches = localBranchesOutput
    .split('\n')
    .map((line) => line.trim().replace(/^\*?\s*/, ''))
    .filter((line) => line);

  // Get remote branch names (short names that exist on remote after fetch -p)
  const remoteBranchesOutput = execSync('git branch -r', { encoding: 'utf8' });
  const remoteBranchNames = new Set(
    remoteBranchesOutput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.includes('->'))
      .map((line) => line.replace(/^[^/]+\//, '')) // e.g. origin/feature -> feature
  );

  // Local-only branches: exist locally but have no corresponding remote branch
  const branchesToDelete = localBranches.filter(
    (branch) =>
      branch !== currentBranch &&
      !protectedBranches.includes(branch) &&
      !remoteBranchNames.has(branch)
  );

  // Function to ask for user confirmation
  const askUserConfirmation = (branchesToDelete: string[]): void => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    });

    logger.log(
      'The following local-only branches (no corresponding remote) will be deleted:'
    );
    branchesToDelete.forEach((branch) => logger.log(`  - ${branch}`));

    rl.question(
      'Proceed to delete these branches? (yes/no) ',
      (answer) => {
        if (answer.toLowerCase() === 'yes') {
          // Delete the local-only branches
          branchesToDelete.forEach((branch) => {
            try {
              if (dryRun) {
                logger.info(`Would delete branch ${branch}`);
              } else {
                execSync(`git branch -d ${branch}`, { stdio: 'inherit' });
                logger.info(`Deleted branch ${branch}`);
              }
            } catch {
              // if branch is not fully merged, attempt to force delete
              try {
                logger.warn(
                  `Branch ${branch} is not fully merged, attempting force delete...`
                );

                if (dryRun) {
                  logger.info(`Would force delete branch ${branch}`);
                } else {
                  execSync(`git branch -D ${branch}`, { stdio: 'inherit' });
                  logger.info(`Force deleted branch ${branch}`);
                }
              } catch (forceError) {
                logger.error(
                  `Failed to delete branch ${branch}:`,
                  (forceError as Error).message
                );
              }
            }
          });
        } else {
          logger.info('Branch deletion aborted.');
        }
        rl.close();
      }
    );
  };

  // Proceed only if there are branches to delete
  if (branchesToDelete.length > 0) {
    askUserConfirmation(branchesToDelete);
  } else {
    logger.log('No local-only branches to delete.');
  }
}
