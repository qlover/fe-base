import lodash from 'lodash';

const { isString, isPlainObject, get } = lodash;

export class ReleaseUtil {
  static isValidString(value) {
    return value && isString(value);
  }

  static parserPRNumber(output) {
    const prUrlPattern = /https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/(\d+)/;
    const match = output.match(prUrlPattern);
    return (match && match[1]) || '';
  }

  static getUserInfo(pkg, feConfig) {
    const { repository, author } = pkg;
    const localAuthor = feConfig.author || author;

    const authorName = isPlainObject(localAuthor)
      ? get(localAuthor, 'name')
      : localAuthor;

    if (!ReleaseUtil.isValidString(authorName)) {
      throw new Error('please set .fe-config.release valid author');
    }

    const repoName =
      feConfig.repository ||
      repository.url.split('/').pop()?.replace('.git', '');
    if (!ReleaseUtil.isValidString(repoName)) {
      throw new Error('please set .fe-config.release repository');
    }

    return { repoName, authorName };
  }

  static async getDryRrunPRUrl(shell, number) {
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

  static getReleaseItSearchPlaces() {
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
