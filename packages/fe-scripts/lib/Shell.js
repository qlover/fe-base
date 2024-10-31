import shell from 'shelljs';
import { execa } from 'execa';
import lodash from 'lodash';

export class Shell {
  /**
   *
   * @param {object} container
   * @param {{isDryRun?: boolean}} container.config
   * @param {import('@qlover/fe-utils').Logger} container.log
   */
  constructor(container = {}) {
    this.config = container.config || {};
    this.cache = new Map();
    this.log = container.log;
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
   *
   * @param {*} command
   * @param {object} options
   * @param {boolean} options.silent
   * @param {object} options.env
   * @param {string} options.dryRunResult
   * @param {*} context
   * @returns
   */
  exec(command, options = {}, context = {}) {
    // FIXME: Error will be reported when command is emtpy
    if (lodash.isEmpty(command)) {
      return;
    }
    return typeof command === 'string'
      ? this.execFormattedCommand(this.format(command, context), options)
      : this.execFormattedCommand(command, options);
  }

  /**
   * default silent
   * @param {string} command
   * @param {object} options
   * @param {object} context
   * @returns
   */
  run(command, options = {}, context = {}) {
    options = { silent: true, ...options };
    return this.exec(command, options, context);
  }

  async execFormattedCommand(command, options = {}) {
    const { isDryRun } = this.config;
    const isWrite = options.write !== false;
    const isExternal = options.external === true;
    const cacheKey = typeof command === 'string' ? command : command.join(' ');
    const isCached = !isExternal && this.cache.has(cacheKey);

    if (isDryRun && isWrite) {
      this.log.exec(command, { isDryRun });
      return Promise.resolve(options.dryRunResult);
    }

    this.log.exec(command, { isExternal, isCached });

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

  execStringCommand(command, options) {
    return new Promise((resolve, reject) => {
      shell.exec(
        command,
        { async: true, ...options },
        (code, stdout, stderr) => {
          stdout = stdout.toString().trimEnd();
          // debug({ command, options, code, stdout, stderr });
          if (code === 0) {
            resolve(stdout);
          } else {
            this.log.error(command);
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

  async execWithArguments(command, options, { isExternal }) {
    const [program, ...programArgs] = command;

    try {
      const { stdout: out, stderr } = await execa(program, programArgs);
      const stdout = out === '""' ? '' : out;
      this.log.verbose(stdout, { isExternal });
      // debug({ command, options, stdout, stderr });
      return Promise.resolve(stdout || stderr);
    } catch (error) {
      if (error.stdout) {
        this.log.log(`\n${error.stdout}`);
      }
      // debug({ error });
      return Promise.reject(new Error(error.stderr || error.message));
    }
  }
}
