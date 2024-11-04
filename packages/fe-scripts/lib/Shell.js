import shell from 'shelljs';
import { execa } from 'execa';
import lodash from 'lodash';

export class Shell {
  /**
   *
   * @param {object} config
   * @param {boolean} config.isDryRun
   * @param {import('@qlover/fe-utils').Logger} config.log
   */
  constructor(config = {}) {
    this.config = config;
    this.cache = new Map();
  }

  /**
   * @returns {import('@qlover/fe-utils').Logger}
   */
  get log() {
    return this.config.log;
  }

  static format(template = '', context = {}) {
    return lodash.template(template)(context);
  }

  /**
   * @private
   * @param {*} template
   * @param {*} context
   * @returns
   */
  format(template = '', context = {}) {
    try {
      return Shell.format(template, context);
    } catch (error) {
      this.log.error(
        `Unable to render template with context:\n${template}\n${JSON.stringify(context)}`
      );
      this.log.error(error);
      throw error;
    }
  }

  /**
   * @param {string|string[]} command
   * @param {import('@qlover/fe-scripts').ShellExecOptions} options
   * @returns {Promise<string>}
   */
  exec(command, options = {}) {
    if (lodash.isEmpty(command)) {
      return;
    }
    const { context, ...execOptions } = options;
    return typeof command === 'string'
      ? this.execFormattedCommand(
          this.format(command, context || {}),
          execOptions
        )
      : this.execFormattedCommand(command, execOptions);
  }

  /**
   * default silent
   * @param {string|string[]} command
   * @param {import('@qlover/fe-scripts').ShellExecOptions} options
   * @returns {Promise<string>}
   */
  run(command, options = {}) {
    return this.exec(command, { silent: true, ...options });
  }

  /**
   * @param {string|string[]} command
   * @param {import('@qlover/fe-scripts').ShellExecOptions} options
   * @returns {Promise<unknown | string>}
   */
  async execFormattedCommand(command, options = {}) {
    const { dryRunResult, silent, external, dryRun } = options;
    // if dryRun is undefined, use shell config.isDryRun
    const isDryRun = dryRun !== undefined ? dryRun : this.config.isDryRun;
    const isExternal = external === true;
    const cacheKey = typeof command === 'string' ? command : command.join(' ');
    const isCached = !isExternal && this.cache.has(cacheKey);

    if (!silent) {
      this.log.exec(command, { isExternal, isCached });
    }

    if (isDryRun) {
      return Promise.resolve(dryRunResult);
    }

    if (isCached) {
      return this.cache.get(cacheKey);
    }

    const result =
      typeof command === 'string'
        ? this.execStringCommand(command, options, { isExternal })
        : this.execWithArguments(command, options, { isExternal });

    if (!isExternal && !this.cache.has(cacheKey)) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * @param {string} command
   * @param {import('@qlover/fe-scripts').ShellExecOptions} options
   * @returns {Promise<string>}
   */
  execStringCommand(command, options) {
    return new Promise((resolve, reject) => {
      shell.exec(
        command,
        { async: true, ...options },
        (code, stdout, stderr) => {
          stdout = stdout.toString().trimEnd();
          // this.log.debug({ command, options, code, stdout, stderr });
          if (code === 0) {
            resolve(stdout);
          } else {
            options.silent && this.log.error(command);
            reject(new Error(stderr || stdout));
          }
        }
      );
      // childProcess.stdout.on('data', (stdout) =>
      //   this.log.verbose(stdout.toString().trimEnd(), { isExternal })
      // );
      // childProcess.stderr.on('data', (stderr) =>
      //   this.log.verbose(stderr.toString().trimEnd(), { isExternal })
      // );
    });
  }

  /**
   * @param {string[]} command
   * @param {import('@qlover/fe-scripts').ShellExecOptions} options
   * @param {{ isExternal: boolean }} meta
   * @returns {Promise<string>}
   */
  async execWithArguments(command, options, { isExternal }) {
    const [program, ...programArgs] = command;

    try {
      const { stdout: out, stderr } = await execa(program, programArgs);
      const stdout = out === '""' ? '' : out;
      this.log.verbose(stdout, { isExternal });
      // this.log.debug({ command, options, stdout, stderr });
      return Promise.resolve(stdout || stderr);
    } catch (error) {
      if (error.stdout) {
        this.log.log(`\n${error.stdout}`);
      }
      // this.log.debug({ error });
      return Promise.reject(new Error(error.stderr || error.message));
    }
  }
}
