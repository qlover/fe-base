// Do not have any other external dependencies
import { createRequire } from 'module';
import { exec } from 'child_process';
const require = createRequire(import.meta.url);

export class Dependencie {
  /**
   * @param {Partial<import('./FeScriptContext.js').FeScriptContext>} context
   */
  constructor({ logger, shell }) {
    this.logger = logger;
    this.shell = shell || { run: this.execPromise };
  }

  /**
   * @private
   * @param {*} command
   * @param {*} silent
   * @returns
   */
  execPromise(command, silent = false) {
    return new Promise((resolve, reject) => {
      const childProcess = exec(command, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout.trim());
      });

      if (silent) {
        const log = this.logger;
        // Optional: Log the stdout as it becomes available
        childProcess.stdout.on('data', (data) => {
          log.log(data.toString().trim());
        });

        // Optional: Log the stderr as it becomes available
        childProcess.stderr.on('data', (data) => {
          log.error(data.toString().trim());
        });
      }
    });
  }

  async checkDependencyInstalled(packageName, global = false) {
    const result = { local: false, global: false };
    try {
      // Check locally
      await this.shell.run(`npm list ${packageName}`);
      result.local = true;
    } catch {
      try {
        if (global) {
          // If not found locally, check globally
          await this.shell.run(`npm list -g ${packageName}`);
          result.global = true;
        }
      } catch {
        // Ignore errors, assume dependency is not installed globally
      }
    }

    return result;
  }

  async getGlobalDependencyVersion(dependencyName) {
    const result = { version: '', scope: 'global' };
    try {
      const stdioResult = await this.shell.run(
        `npm ls -g ${dependencyName} --depth=0 --json`
      );
      const jsonResult = JSON.parse(stdioResult);
      if (jsonResult.dependencies && jsonResult.dependencies[dependencyName]) {
        result.version = jsonResult.dependencies[dependencyName].version;
      }
    } catch (error) {
      this.logger.error(error);
      // Ignore errors, assume dependency is not installed globally
    }
    return result;
  }

  async getDependencyVersion(dependencyName) {
    const has = await this.checkDependencyInstalled(dependencyName, false);
    // Check local dependency
    if (has.local) {
      try {
        const localPackageJsonPath = require.resolve(
          `${dependencyName}/package.json`
        );
        const localPackageJson = require(localPackageJsonPath);
        return { version: localPackageJson.version, scope: 'local' };
      } catch (error) {
        this.logger.error(error);
        // Local package.json not found, continue to global check
      }
    }

    // Check global dependency
    return await this.getGlobalDependencyVersion(dependencyName);
  }

  async checkWithInstall(packageName, global = false) {
    const hasDeep = await this.checkDependencyInstalled(packageName, global);
    if (!(hasDeep.local || hasDeep.global)) {
      this.logger.error(`${packageName} not found, installing ${packageName}`);
      await this.install(packageName, global);
    }
    const version = await this.getDependencyVersion(packageName);
    this.logger.log(`${packageName} version is: v${version.version}`);
  }

  async install(packageName, global = false) {
    await this.shell.run(`npm i ${global ? '-g' : ''} ${packageName}`);
  }
}
