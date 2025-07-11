import { ScriptPlugin } from '@qlover/scripts-context';
import Code2MDContext from '../implments/Code2MDContext';
import { FormatProjectValue } from './typeDocs';
import { HBSTemplate } from '../implments/HBSTemplate';
import fsExtra from 'fs-extra';
import { join, dirname, resolve } from 'path';
import { mkdirSync } from 'fs';
import { hbsHelpers } from '../implments/hbsHelper';

export class Formats extends ScriptPlugin<Code2MDContext> {
  private hbsTemplate: HBSTemplate;

  constructor(context: Code2MDContext) {
    super(context, 'Formats');

    this.hbsTemplate = new HBSTemplate({
      name: 'format-project',
      hbsRootDir: this.context.options.hbsRootDir,
      hbsHelpers: hbsHelpers
    });
  }

  async onBefore(): Promise<void> {
    const { formatProject = [] } = this.context.options;
    const fileGroups = this.groupByFile(formatProject);

    // 确保输出目录存在 - 在使用时 resolve 路径
    const resolvedGeneratePath = resolve(this.context.options.generatePath);
    mkdirSync(resolvedGeneratePath, { recursive: true });

    // 为每个文件分组生成独立的 markdown 文件
    fileGroups.forEach((items, filePath) => {
      const content: string[] = [];
      for (const item of items) {
        content.push(this.formatProjectValue(item));
      }

      const fileContent = content.join('\n');
      const markdownContent = this.generateMarkdownContent(fileContent);

      // 生成文件名并写入文件
      this.writeMarkdownFile(markdownContent, filePath);
    });
  }

  groupByFile(data: FormatProjectValue[]): Map<string, FormatProjectValue[]> {
    const fileGroups = new Map<string, FormatProjectValue[]>();

    for (const item of data) {
      const filePath = item.source?.fileName;
      if (filePath) {
        fileGroups.set(filePath, [...(fileGroups.get(filePath) || []), item]);
      }
    }
    return fileGroups;
  }

  formatProjectValue(data: FormatProjectValue, level: number = 0): string {
    const content: string[] = [];

    // 渲染当前元素，传递 level 参数
    const dataWithLevel = { ...data, level };
    const compiledContent = this.hbsTemplate.compile(dataWithLevel);
    const decodedContent = this.decodeHtmlEntities(compiledContent);
    content.push(decodedContent);

    // 如果有子元素，递归渲染
    if (data.children && data.children.length > 0) {
      for (const child of data.children) {
        const childContent = this.formatProjectValue(child, level + 1);
        content.push(childContent);
      }
    }

    return content.join('\n');
  }

  /**
   * 解码 HTML 实体
   *
   * @description 将 HTML 实体编码转换为普通字符
   *
   * @param text 包含 HTML 实体的文本
   * @returns 解码后的文本
   */
  private decodeHtmlEntities(text: string): string {
    const htmlEntities: Record<string, string> = {
      '&#x3D;&gt;': '=>',
      '&#x3D;': '=', // 等号
      '&#x60;': '`', // 反引号
      '&#x27;': "'", // 单引号
      '&gt;': '>',
      '&lt;': '<',
      '&amp;': '&',
      '&quot;': '"',
      '&#39;': "'"
    };

    let decodedText = text;
    Object.entries(htmlEntities).forEach(([entity, char]) => {
      decodedText = decodedText.replace(new RegExp(entity, 'g'), char);
    });

    return decodedText;
  }

  /**
   * 生成 markdown 文件内容
   *
   * @description 将文件分组的内容转换为完整的 markdown 文档
   *
   * @param fileContent 文件内容
   * @returns markdown 文档内容
   */
  private generateMarkdownContent(fileContent: string): string {
    const content: string[] = [];

    // 写入文件内容
    content.push(fileContent);

    return content.join('\n');
  }

  /**
   * 生成输出文件名
   *
   * @description 将源文件路径转换为输出文件名，保持目录结构，只改变扩展名
   * 当 removePrefix 为 true 时，会去掉 entry 的根路径
   *
   * @param filePath 源文件路径
   * @returns 输出文件名
   */
  private generateFileName(filePath: string): string {
    let processedPath = filePath;

    // 如果启用了 removePrefix，需要去掉 entry 的根路径
    if (this.context.options.removePrefix) {
      const originalPath = processedPath;
      processedPath = this.removeEntryPrefix(filePath);
      this.logger.debug(
        `Path processing: "${originalPath}" -> "${processedPath}"`
      );
    }

    // 保持完整的目录结构，只将扩展名从 .ts 改为 .md
    return processedPath.replace(/\.ts$/, '.md');
  }

  /**
   * 去掉 entry 的根路径
   *
   * @description 当 removePrefix 为 true 时，从文件路径中去掉 entry 的根路径部分
   * 基于 TypeDoc 解析后的实际路径进行处理
   *
   * @param filePath 源文件路径
   * @returns 去掉根路径后的文件路径
   */
  private removeEntryPrefix(filePath: string): string {
    const { entryPoints } = this.context.options;

    this.logger.debug(`Processing file: "${filePath}"`);
    this.logger.debug(`Entry points: ${JSON.stringify(entryPoints)}`);

    // 标准化路径分隔符
    const normalizedFilePath = filePath.replace(/\\/g, '/');

    // 找到最长的匹配前缀
    let longestPrefix = '';

    for (const entry of entryPoints) {
      // 标准化 entry 路径
      const normalizedEntry = entry.replace(/\\/g, '/');

      // 处理 entry 是文件的情况
      let entryDir = normalizedEntry;
      if (entryDir.endsWith('.ts') || entryDir.endsWith('.js')) {
        const lastSlashIndex = entryDir.lastIndexOf('/');
        if (lastSlashIndex !== -1) {
          entryDir = entryDir.substring(0, lastSlashIndex);
        } else {
          // 如果没有斜杠，说明是当前目录的文件
          entryDir = '';
        }
      }

      // 处理相对路径前缀
      if (entryDir.startsWith('./')) {
        entryDir = entryDir.substring(2);
      }

      // 如果 entry 是目录，确保以 / 结尾（除非是空字符串）
      if (entryDir && !entryDir.endsWith('/')) {
        entryDir += '/';
      }

      this.logger.debug(`Entry: "${entry}" -> EntryDir: "${entryDir}"`);

      // 检查文件路径是否以 entry 目录开头
      if (
        normalizedFilePath.startsWith(entryDir) &&
        entryDir.length > longestPrefix.length
      ) {
        longestPrefix = entryDir;
        this.logger.debug(`Found match! Longest prefix: "${longestPrefix}"`);
      }
    }

    // 如果找到了匹配的前缀，去掉它
    if (longestPrefix) {
      const result = filePath.substring(longestPrefix.length);
      // 如果结果以 / 开头，去掉它
      const finalResult = result.startsWith('/') ? result.substring(1) : result;
      this.logger.debug(`Final result: "${filePath}" -> "${finalResult}"`);
      return finalResult;
    }

    // 如果没有找到匹配的前缀，返回原路径
    this.logger.debug(`No prefix found, returning original: "${filePath}"`);
    return filePath;
  }

  /**
   * 写入 markdown 文件
   *
   * @description 将生成的 markdown 内容写入到指定文件
   *
   * @param markdownContent markdown 内容
   * @param filePath 原始文件路径
   */
  private async writeMarkdownFile(
    markdownContent: string,
    filePath: string
  ): Promise<void> {
    // 在使用时拼接路径并 resolve
    const fileName = this.generateFileName(filePath);
    const resolvedGeneratePath = resolve(this.context.options.generatePath);
    const outputPath = join(resolvedGeneratePath, fileName);

    try {
      // 确保输出目录存在（包括子目录）
      const outputDir = dirname(outputPath);
      mkdirSync(outputDir, { recursive: true });

      // 写入文件
      fsExtra.writeFileSync(outputPath, markdownContent, 'utf-8');

      this.logger.info(`Markdown documentation written to: ${outputPath}`);
    } catch (error) {
      this.logger.error(`Failed to write markdown file: ${error}`);
      throw error;
    }
  }

  /**
   * 成功后的生命周期方法
   *
   * @description 在所有 markdown 文件生成完成后执行，用于格式化输出目录
   * 支持执行 eslint 或 prettier 格式化
   */
  async onSuccess(): Promise<void> {
    const { generatePath, formatOutput } = this.context.options;

    // 如果没有启用格式化，直接返回
    if (!formatOutput) {
      return;
    }

    const resolvedGeneratePath = resolve(generatePath);
    this.logger.info(`Formatting output directory: ${resolvedGeneratePath}`);

    try {
      // 检查输出目录是否存在
      if (!fsExtra.existsSync(resolvedGeneratePath)) {
        this.logger.warn(
          `Output directory does not exist: ${resolvedGeneratePath}`
        );
        return;
      }

      // 根据配置选择格式化工具
      if (formatOutput === 'eslint' || formatOutput === 'prettier') {
        await this.formatOutputDirectory(resolvedGeneratePath, formatOutput);
      } else {
        this.logger.warn(
          `Unknown format tool: ${formatOutput}. Supported: eslint, prettier`
        );
      }
    } catch (error) {
      this.logger.error(`Failed to format output directory: ${error}`);
      // 格式化失败不应该影响主流程，所以只记录错误不抛出
    }
  }

  /**
   * 格式化输出目录
   *
   * @description 使用指定的工具格式化输出目录中的 markdown 文件
   *
   * @param outputPath 输出目录路径
   * @param formatTool 格式化工具 (eslint 或 prettier)
   */
  private async formatOutputDirectory(
    outputPath: string,
    formatTool: 'eslint' | 'prettier'
  ): Promise<void> {
    const commands = {
      eslint: `npx eslint "${outputPath}/**/*.md" --fix`,
      prettier: `npx prettier "${outputPath}/**/*.md" --write`
    };

    const command = commands[formatTool];

    if (!command) {
      this.logger.error(`Unsupported format tool: ${formatTool}`);
      return;
    }

    this.logger.info(`Executing ${formatTool} on output directory...`);

    try {
      const result = await this.shell.exec(command, {
        silent: false, // 显示命令输出
        dryRun: this.context.dryRun
      });

      this.logger.info(`${formatTool} formatting completed successfully`);
      this.logger.debug(`${formatTool} output: ${result}`);
    } catch (error) {
      this.logger.error(`${formatTool} formatting failed: ${error}`);
      // 格式化失败不应该影响主流程，所以只记录错误不抛出
    }
  }
}
