import { FeConfig } from '@qlover/scripts-context';
import lodash from 'lodash';

const { isString, isPlainObject, get } = lodash;

/**
 * Utility class for handling release-related operations.
 *
 * This class provides static methods to validate strings, parse pull request numbers,
 * retrieve user information from package and configuration, and generate pull request URLs.
 *
 * @example
 * ```typescript
 * const userInfo = ReleaseUtil.getUserInfo(pkg, feConfig);
 * ```
 */
export class ReleaseUtil {
  /**
   * Checks if the provided value is a valid string.
   *
   * A valid string is defined as a non-empty string.
   *
   * @param value - The value to check.
   * @returns True if the value is a valid string, otherwise false.
   */
  static isValidString(value: unknown): boolean {
    return !!value && isString(value);
  }

  /**
   * Parses the pull request number from the given output string.
   *
   * This method uses a regular expression to extract the pull request number from a GitHub URL.
   *
   * @param output - The output string containing the pull request URL.
   * @returns The extracted pull request number, or an empty string if not found.
   */
  static parserPRNumber(output: string): string {
    const prUrlPattern = /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/;
    const match = output.match(prUrlPattern);
    return (match && match[1]) || '';
  }

  /**
   * Retrieves user information from the provided package and front-end configuration.
   *
   * This method extracts the repository name and author name from the package and configuration.
   *
   * @param pkg - The package information, expected to have a repository and author.
   * @param feConfig - The front-end configuration.
   * @returns An object containing the repository name and author name.
   * @throws Will throw an error if the author name or repository name is invalid.
   */
  static getUserInfo(
    pkg: Record<string, unknown>,
    feConfig: FeConfig
  ): { repoName: string; authorName: string } {
    const { repository, author } = pkg;
    const localAuthor = feConfig.author || author;

    const authorName = isPlainObject(localAuthor)
      ? get(localAuthor, 'name')
      : localAuthor;

    if (!ReleaseUtil.isValidString(authorName)) {
      throw new Error('please set .fe-config.release valid author');
    }

    const repoName =
      // @ts-expect-error
      feConfig.repository?.url.split('/').pop()?.replace('.git', '') ||
      // @ts-expect-error
      repository.url.split('/').pop()?.replace('.git', '');
    if (!ReleaseUtil.isValidString(repoName)) {
      throw new Error('please set .fe-config.release repository');
    }

    // @ts-expect-error
    return { repoName, authorName };
  }

  /**
   * Retrieves the dry run pull request URL based on the shell and pull request number.
   *
   * This method constructs a pull request URL using the repository information obtained from the shell.
   *
   * @param shell - The shell instance for executing commands.
   * @param number - The pull request number.
   * @returns A promise that resolves to the dry run pull request URL.
   */
  static async getDryRrunPRUrl(
    shell: {
      run: (command: string, options: { dryRun: boolean }) => Promise<string>;
    },
    number: string
  ): Promise<string> {
    const repoInfo = await shell.run('git remote get-url origin', {
      dryRun: false
    });

    if (!repoInfo) {
      return 'https://github.com/[username]/[repo]/pull/' + number;
    }

    return (
      repoInfo
        .replace(/\.git$/, '')
        .replace('git@github.com:', 'https://github.com/') +
      '/pull/' +
      number
    );
  }

  /**
   * Retrieves the search places for release-it configuration files.
   *
   * This method returns an array of potential configuration file names for release-it.
   *
   * @returns An array of configuration file names.
   */
  static getReleaseItSearchPlaces(): string[] {
    // https://github.com/release-it/release-it/blob/main/lib/config.js#L11
    return [
      'package.json',
      '.release-it.json',
      '.release-it.js',
      '.release-it.ts',
      '.release-it.cjs',
      '.release-it.yaml',
      '.release-it.yml'
      // FIXME:
      // '.release-it.toml'
    ];
  }
}
