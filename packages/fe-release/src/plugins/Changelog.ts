import { execSync } from 'child_process';
import ReleaseContext from '../implments/ReleaseContext';
import Plugin from './Plugin';

interface CommitType {
  type: string;
  section: string;
  hidden?: boolean;
}

interface Commit {
  hash: string;
  type: string | null;
  scope: string | null;
  subject: string;
  body: string | null;
  files: string[];
}

export default class Changelog extends Plugin {
  private types: CommitType[] = [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'perf', section: 'Performance Improvements' },
    { type: 'revert', section: 'Reverts' },
    { type: 'docs', section: 'Documentation', hidden: true },
    { type: 'style', section: 'Styles', hidden: true },
    { type: 'refactor', section: 'Code Refactoring' },
    { type: 'test', section: 'Tests', hidden: true },
    { type: 'build', section: 'Build System', hidden: true },
    { type: 'ci', section: 'Continuous Integration', hidden: true }
  ];

  constructor(context: ReleaseContext) {
    super(context, 'changelog');
    // 如果配置中有自定义 types，则覆盖默认值
    const customTypes = this.context.getConfig('changelog.types');
    if (customTypes) {
      this.types = customTypes as CommitType[];
    }
  }

  private parseCommit(commitStr: string): Commit {
    const [hashSubject, ...bodyLines] = commitStr.split('\n');
    const [hash, subject] = hashSubject.split(' ', 2);

    // 解析 conventional commit
    const typeMatch = subject.match(/^(\w+)(?:\(([^)]+)\))?: (.+)$/);
    const [, type = null, scope = null, message = subject] = typeMatch || [];

    // 获取提交涉及的文件
    const files = execSync(`git show --pretty="" --name-only ${hash}`)
      .toString()
      .trim()
      .split('\n');

    return {
      hash: hash.trim(),
      type,
      scope,
      subject: message.trim(),
      body: bodyLines.join('\n').trim() || null,
      files
    };
  }

  private getCommitsSinceLastTag(): Commit[] {
    const lastTag = execSync('git describe --tags --abbrev=0')
      .toString()
      .trim();
    const format = '%H %s'; // hash and subject
    const command = `git log ${lastTag}..HEAD --pretty=format:"${format}"`;

    const output = execSync(command).toString().trim();
    if (!output) return [];

    return output.split('\n').map((commit) => this.parseCommit(commit));
  }

  private groupCommitsByWorkspace(commits: Commit[]): Record<string, Commit[]> {
    const workspaces = this.context.workspaces!;
    const result: Record<string, Commit[]> = {};

    // 初始化工作区数组
    workspaces.forEach((ws) => {
      result[ws.name] = [];
    });

    commits.forEach((commit) => {
      // 根据文件路径判断属于哪个工作区
      workspaces.forEach((ws) => {
        const hasWorkspaceFiles = commit.files.some((file) =>
          file.startsWith(ws.path)
        );
        if (hasWorkspaceFiles) {
          result[ws.name].push(commit);
        }
      });
    });

    return result;
  }

  private formatChangelog(groupedCommits: Record<string, Commit[]>): string {
    let changelog = '';

    Object.entries(groupedCommits).forEach(([workspace, commits]) => {
      if (commits.length === 0) return;

      changelog += `\n## ${workspace}\n`;

      // 按 type 分组
      const byType: Record<string, Commit[]> = {};
      commits.forEach((commit) => {
        if (!commit.type) return;
        if (!byType[commit.type]) byType[commit.type] = [];
        byType[commit.type].push(commit);
      });

      // 按配置的类型顺序输出
      this.types.forEach(({ type, section, hidden }) => {
        if (hidden || !byType[type]) return;

        changelog += `\n### ${section}\n\n`;
        byType[type].forEach((commit) => {
          const scope = commit.scope ? `**${commit.scope}**: ` : '';
          changelog += `- ${scope}${commit.subject} (${commit.hash.slice(0, 7)})\n`;
        });
      });
    });

    return changelog;
  }

  async onExec(): Promise<void> {
    try {
      // 1. 获取最近一次 tag 到现在的所有提交
      const commits = this.getCommitsSinceLastTag();

      // 2. 按工作区分组提交
      const groupedCommits = this.groupCommitsByWorkspace(commits);

      // 3. 生成 changelog
      const changelog = this.formatChangelog(groupedCommits);

      // 4. 保存到上下文中，供其他插件使用
      this.setConfig({ changelog });

      // 5. 输出日志
      this.context.logger.info(
        'Generated changelog for workspaces:',
        Object.keys(groupedCommits)
      );
    } catch (error) {
      this.context.logger.error('Failed to generate changelog:', error);
    }
  }
}
