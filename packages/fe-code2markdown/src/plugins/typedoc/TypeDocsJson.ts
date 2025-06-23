/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Application,
  CommentDisplayPart,
  CommentTag,
  DeclarationReflection,
  ParameterReflection,
  ProjectReflection,
  ReflectionKind,
  SourceReference,
  TSConfigReader,
  TypeDocReader
} from 'typedoc';
import { ScriptPlugin } from '@qlover/scripts-context';
import { ReflectionKindName } from '../../type';
import fsExtra from 'fs-extra';
import Code2MDContext from '../../implments/Code2MDContext';

/**
 * 简化的参数数据结构
 *
 * @description 用于存储参数的基本信息，避免复杂的循环引用
 */
interface SimpleParameter {
  /**
   * 参数 ID
   */
  id: number;

  /**
   * 参数名称
   */
  name: string;

  /**
   * 参数类型
   */
  type: string;

  /**
   * 参数描述
   */
  description: string;

  /**
   * 摘要列表
   */
  summaryList: CommentDisplayPart[];

  /**
   * 块标签列表
   */
  blockTagsList: CommentDisplayPart[];

  /**
   * 默认值
   */
  defaultValue: string;

  /**
   * 版本信息
   */
  since: string;

  /**
   * 是否已废弃
   */
  deprecated: boolean;
}

/**
 * CommentTableData 接口定义
 *
 * @description 用于定义从 TypeDoc 项目数据转换后的注释表格数据结构
 *
 * @purpose
 * - 提供统一的数据结构来存储 TypeDoc 解析后的注释信息
 * - 支持递归的子元素结构
 * - 包含完整的类型、参数等信息
 *
 * @usage
 * 主要用于将 TypeDoc 的 ProjectReflection 数据转换为更适合生成文档的格式
 *
 * @example
 * ```typescript
 * const commentData: CommentTableData = {
 *   id: 1,
 *   kind: ReflectionKind.Class,
 *   name: 'MyClass',
 *   type: 'class',
 *   kindName: 'Class',
 *   summaryList: [],
 *   blockTagsList: [],
 *   parametersList: [],
 *   source: sourceRef,
 *   children: [],
 *   hasMembers: false
 * };
 * ```
 */
interface CommentTableData {
  id: number;
  kind: number;
  name: string;
  type: string | undefined;
  kindName: string;

  /**
   * 摘要列表
   */
  summaryList: CommentDisplayPart[];

  /**
   * 块标签列表
   */
  blockTagsList: CommentDisplayPart[];

  /**
   * 参数列表 - 简化的参数数据结构
   */
  parametersList: SimpleParameter[];

  /**
   * 源码信息
   */
  source: SourceReference;

  /**
   * 子元素
   */
  children: CommentTableData[];

  /**
   * 是否存在子元素
   */
  hasMembers: boolean;
}

/**
 * TypeDocJson 插件类
 *
 * @description 用于将 TypeDoc 项目数据转换为 JSON 格式并输出到文件
 *
 * @purpose
 * - 解析 TypeScript 项目并生成 TypeDoc 数据
 * - 将项目数据转换为 CommentTableData 格式
 * - 输出结构化的 JSON 文件供后续处理
 *
 * @workflow
 * 1. 初始化 TypeDoc Application
 * 2. 转换项目为 ProjectReflection
 * 3. 将数据转换为 CommentTableData 格式
 * 4. 写入 JSON 文件
 *
 * @example
 * ```typescript
 * const plugin = new TypeDocJson(context);
 * await plugin.onBefore(); // 自动执行转换和文件写入
 * ```
 */
export default class TypeDocJson extends ScriptPlugin<Code2MDContext> {
  private app?: Application;

  constructor(context: Code2MDContext) {
    super(context, 'TypeDocJson');
  }

  /**
   * 获取或创建 TypeDoc Application 实例
   *
   * @description 创建并配置 TypeDoc 应用程序实例，用于解析 TypeScript 项目
   *
   * @returns Promise<Application> TypeDoc 应用程序实例
   *
   * @example
   * ```typescript
   * const app = await this.getApp();
   * const project = await app.convert();
   * ```
   */
  async getApp(): Promise<Application> {
    if (this.app) {
      return this.app;
    }

    const app = await Application.bootstrap(
      {
        // typedoc options here
        basePath: this.context.options.basePath,
        entryPoints: this.context.options.entryPoints,
        skipErrorChecking: true
      },
      [new TSConfigReader(), new TypeDocReader()]
    );

    this.app = app;
    return app;
  }

  /**
   * 插件执行前的钩子方法
   *
   * @description 在插件执行前调用，负责转换项目并写入文件
   *
   * @throws {Error} 当项目转换失败时抛出错误
   *
   * @example
   * ```typescript
   * await plugin.onBefore();
   * ```
   */
  override async onBefore(): Promise<void> {
    const app = await this.getApp();
    const project = await app.convert();

    if (!project) {
      throw new Error('Failed to convert project');
    }

    this.context.setOptions({ projectReflection: project });

    await this.writeToFile(project);

    const tableData = this.convertProjectToCommentTableData(project);
    const cleanData = this.removeCircularReferences(tableData);
    this.writeJSON({ data: cleanData }, './typedoc-data.json');
  }

  /**
   * 将项目数据写入文件
   *
   * @description 将 ProjectReflection 转换为 CommentTableData 格式并写入 JSON 文件
   *
   * @param project TypeDoc 项目反射对象
   *
   * @example
   * ```typescript
   * await this.writeToFile(project);
   * ```
   */
  async writeToFile(project: ProjectReflection): Promise<void> {
    const path = this.context.options.outputJSONFilePath;

    if (!path) {
      this.logger.warn('ProjectReader writeTo Output path is empty!');
      return;
    }

    const app = await this.getApp();

    this.writeJSON(app.serializer.projectToObject(project, './'), path);
    this.logger.info('Generate JSON file success', path);
  }

  /**
   * 将 ProjectReflection 转换为 CommentTableData 格式
   *
   * @description 递归转换 TypeDoc 项目数据为 CommentTableData 结构
   *
   * @param project TypeDoc 项目反射对象
   * @returns CommentTableData[] 转换后的数据数组
   *
   * @example
   * ```typescript
   * const data = this.convertProjectToCommentTableData(project);
   * ```
   */
  private convertProjectToCommentTableData(
    project: ProjectReflection
  ): CommentTableData[] {
    const result: CommentTableData[] = [];

    if (!project.children) {
      return result;
    }

    for (const child of project.children) {
      const commentData = this.convertReflectionToCommentTableData(child);
      if (commentData) {
        result.push(commentData);
      }
    }

    return result;
  }

  /**
   * 将单个 DeclarationReflection 转换为 CommentTableData
   *
   * @description 转换单个反射对象为 CommentTableData 格式，包括处理子元素
   *
   * @param reflection 声明反射对象
   * @param parent 父级反射对象（可选）
   * @returns CommentTableData | null 转换后的数据或 null
   *
   * @example
   * ```typescript
   * const data = this.convertReflectionToCommentTableData(reflection);
   * ```
   */
  private convertReflectionToCommentTableData(
    reflection: DeclarationReflection,
    parent?: DeclarationReflection
  ): CommentTableData | null {
    try {
      const { id, name, kind, type } = reflection;
      const kindName = ReflectionKindName[kind] || 'Unknown';

      // 获取注释信息
      const { summary, blockTags } = this.getComments(reflection);
      const blockTagsList = this.getBlockTagsNoParamAndReturn(blockTags);

      // 获取源码信息
      const source = this.getRealSource(reflection, parent);

      // 处理参数列表 - 从 signatures 中获取参数
      let parametersList: SimpleParameter[] = [];
      if (
        reflection.signatures &&
        reflection.signatures.length > 0 &&
        reflection.signatures[0].parameters
      ) {
        parametersList = this.toParametersList(
          reflection.signatures[0].parameters
        );
      }

      // 获取类型字符串
      const typeString = type ? this.warpType(type.toString()) : undefined;

      // 处理子元素
      const children: CommentTableData[] = [];
      let hasMembers = false;

      if (reflection.children) {
        for (const child of reflection.children) {
          const childData = this.convertReflectionToCommentTableData(
            child,
            reflection
          );
          if (childData) {
            children.push(childData);
          }
        }
        hasMembers = children.length > 0;
      }

      // 特殊处理 TypeAlias
      if (kind === ReflectionKind.TypeAlias && type) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const typeReflection = type as any;
        if (
          typeReflection.type === 'reflection' &&
          typeReflection.declaration?.children
        ) {
          for (const child of typeReflection.declaration.children) {
            const childData = this.convertReflectionToCommentTableData(
              child as DeclarationReflection,
              reflection
            );
            if (childData) {
              children.push(childData);
            }
          }
          hasMembers = children.length > 0;
        }
      }

      return {
        id,
        kind,
        name,
        type: typeString,
        kindName,
        summaryList: summary,
        blockTagsList,
        parametersList,
        source: source ? this.createSafeSourceReference(source) : {},
        children,
        hasMembers
      };
    } catch (error) {
      this.logger.error(
        `Error converting reflection ${reflection.name}:`,
        error
      );
      return null;
    }
  }

  /**
   * 获取类的注释信息
   *
   * @description 提取反射对象的摘要和块标签信息
   *
   * @param reflection 声明反射对象
   * @returns 包含摘要和块标签的对象
   *
   * @example
   * ```typescript
   * const { summary, blockTags } = this.getComments(reflection);
   * ```
   */
  private getComments(reflection: DeclarationReflection): {
    summary: CommentDisplayPart[];
    blockTags: CommentTag[];
  } {
    const { summary, blockTags } = reflection.comment || {};

    return {
      summary: this.toTemplateSummaryList(summary || []),
      blockTags: blockTags || []
    };
  }

  /**
   * 转换摘要列表为模板格式
   *
   * @description 将 CommentDisplayPart 数组转换为模板需要的格式
   *
   * @param summary 摘要数组
   * @returns 转换后的摘要数组
   *
   * @example
   * ```typescript
   * const summaryList = this.toTemplateSummaryList(summary);
   * ```
   */
  private toTemplateSummaryList(
    summary: CommentDisplayPart[]
  ): CommentDisplayPart[] {
    return summary.map((item) => this.toTemplateSummary(item));
  }

  /**
   * 转换单个摘要为模板格式
   *
   * @description 为摘要项添加类型标识属性
   *
   * @param summary 摘要项
   * @param tag 标签（可选）
   * @returns 转换后的摘要项
   *
   * @example
   * ```typescript
   * const templateSummary = this.toTemplateSummary(summary);
   * ```
   */
  private toTemplateSummary(
    summary: CommentDisplayPart,
    tag?: string
  ): CommentDisplayPart {
    const DisplayPartsKindName = {
      text: 'Text',
      code: 'Code',
      inlineTag: 'InlineTag'
    };

    return {
      ...summary,
      [`is${DisplayPartsKindName[summary.kind as keyof typeof DisplayPartsKindName]}`]:
        true,
      tag,
      title: tag?.replace('@', '') || ''
    } as any;
  }

  /**
   * 获取不包含 @param 的块标签
   *
   * @description 过滤掉参数相关的块标签
   *
   * @param blockTags 块标签数组
   * @returns 过滤后的块标签数组
   *
   * @example
   * ```typescript
   * const filteredTags = this.getBlockTagsNoParamAndReturn(blockTags);
   * ```
   */
  private getBlockTagsNoParamAndReturn(
    blockTags: CommentTag[]
  ): CommentDisplayPart[] {
    return blockTags
      .filter((item) => !['@param'].includes(item.tag))
      .map((tag) => {
        return tag.content.map((item) => this.toTemplateSummary(item, tag.tag));
      })
      .flat();
  }

  /**
   * 获取真实的源码信息
   *
   * @description 获取反射对象的源码位置信息，确保属于当前类
   *
   * @param member 成员反射对象
   * @param parent 父级反射对象（可选）
   * @returns 源码引用信息或 undefined
   *
   * @example
   * ```typescript
   * const source = this.getRealSource(member, parent);
   * ```
   */
  private getRealSource(
    member: DeclarationReflection,
    parent?: DeclarationReflection
  ): SourceReference | undefined {
    if (!member.sources?.length) {
      return undefined;
    }

    const source = member.sources[0];
    if (parent && parent.sources?.length) {
      const classSource = parent.sources[0];
      if (source.fileName !== classSource.fileName) {
        return undefined;
      }
    }

    return source;
  }

  /**
   * 包装类型字符串
   *
   * @description 用反引号包装类型字符串，避免模板渲染问题
   *
   * @param typeString 类型字符串
   * @returns 包装后的类型字符串
   *
   * @example
   * ```typescript
   * const wrappedType = this.warpType('string | number');
   * // 返回: `string \| number`
   * ```
   */
  private warpType(typeString: string): string {
    return `\`${typeString.replace(/\|/g, '\\|')}\``;
  }

  /**
   * 写入 JSON 数据到文件
   *
   * @description 将数据序列化为 JSON 并写入指定文件
   *
   * @param value 要写入的数据
   * @param path 文件路径
   *
   * @example
   * ```typescript
   * this.writeJSON(data, '/path/to/output.json');
   * ```
   */
  writeJSON(value: unknown, path: string): void {
    if (!path) {
      this.logger.warn('ProjectReader writeJSON Output path is empty!');
      return;
    }

    fsExtra.removeSync(path);
    fsExtra.ensureFileSync(path);
    fsExtra.writeFileSync(path, JSON.stringify(value, null, 2), 'utf-8');
  }

  /**
   * 移除对象中的循环引用
   *
   * @description 递归清理对象中的循环引用，确保可以正常序列化为 JSON
   *
   * @param obj 要清理的对象
   * @param seen 已访问的对象集合，用于检测循环引用
   * @returns 清理后的对象
   *
   * @example
   * ```typescript
   * const cleanData = this.removeCircularReferences(data);
   * ```
   */
  private removeCircularReferences(obj: any, seen = new WeakSet()): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (seen.has(obj)) {
      return '[Circular Reference]';
    }

    seen.add(obj);

    if (Array.isArray(obj)) {
      const cleanArray = obj.map((item) =>
        this.removeCircularReferences(item, seen)
      );
      seen.delete(obj);
      return cleanArray;
    }

    const cleanObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // 跳过一些可能包含循环引用的 TypeDoc 内部属性
        if (this.shouldSkipProperty(key)) {
          continue;
        }

        try {
          cleanObj[key] = this.removeCircularReferences(obj[key], seen);
        } catch (error) {
          // 如果某个属性无法序列化，跳过它
          this.logger.debug(
            `Skipping property ${key} due to serialization error:`,
            error
          );
          cleanObj[key] = '[Serialization Error]';
        }
      }
    }

    seen.delete(obj);
    return cleanObj;
  }

  /**
   * 判断是否应该跳过某个属性
   *
   * @description 检查属性名是否为可能包含循环引用的 TypeDoc 内部属性
   *
   * @param key 属性名
   * @returns 是否应该跳过该属性
   *
   * @example
   * ```typescript
   * const shouldSkip = this.shouldSkipProperty('parent');
   * ```
   */
  private shouldSkipProperty(key: string): boolean {
    // 跳过可能包含循环引用的 TypeDoc 内部属性
    const skipProperties = [
      'parent',
      'project',
      'reflection',
      'reflections',
      'owner',
      'originalName',
      'traverse',
      'getFullName',
      'getAlias',
      'hasGetterOrSetter',
      'getAllSignatures'
    ];

    return skipProperties.includes(key) || key.startsWith('_');
  }

  /**
   * 创建安全的 SourceReference 对象
   *
   * @description 创建一个不包含循环引用的 SourceReference 副本
   *
   * @param source 原始 SourceReference 对象
   * @returns 安全的 SourceReference 对象
   *
   * @example
   * ```typescript
   * const safeSource = this.createSafeSourceReference(source);
   * ```
   */
  private createSafeSourceReference(source: SourceReference): any {
    if (!source) {
      return {};
    }

    return {
      fileName: source.fileName,
      line: source.line,
      character: source.character,
      fullFileName: source.fullFileName,
      url: source.url
    };
  }

  /**
   * 将参数列表转换为简化的参数数据结构
   *
   * @description 将 ParameterReflection 数组转换为 SimpleParameter 数组，参考 TypeDocConverter 的逻辑
   *
   * @param parameters ParameterReflection 数组
   * @returns SimpleParameter 数组
   *
   * @example
   * ```typescript
   * const parametersList = this.toParametersList(reflection.signatures[0].parameters);
   * ```
   */
  private toParametersList(
    parameters: ParameterReflection[]
  ): SimpleParameter[] {
    const result: SimpleParameter[] = [];

    parameters.forEach((param) => {
      try {
        // @ts-expect-error - TypeDoc 内部类型处理
        const decChildren = (param.type?.declaration?.children ||
          []) as ParameterReflection[];

        // 如果是一个引用类型，处理其子属性
        if (decChildren.length > 0) {
          decChildren.forEach((child) => {
            result.push(this.toParametersListItem(child, param));
          });
        } else {
          result.push(this.toParametersListItem(param));
        }
      } catch (error) {
        this.logger.warn(
          'toParametersListItem Error:',
          `${param?.id} ${param?.name}`,
          error
        );
        // 发生错误时，添加基本的参数信息
        result.push(this.toParametersListItem(param));
      }
    });

    return result;
  }

  /**
   * 将单个参数转换为 SimpleParameter 格式
   *
   * @description 转换单个参数反射对象为简化的参数数据结构
   *
   * @param param 参数反射对象
   * @param parent 父级参数（可选，用于嵌套参数）
   * @returns SimpleParameter 简化的参数数据
   */
  private toParametersListItem(
    param: ParameterReflection,
    parent?: ParameterReflection
  ): SimpleParameter {
    const { summary = [], blockTags = [] } = param.comment || {};

    // 过滤掉 @param 相关的块标签
    const blockTagsList = this.getBlockTagsNoParamAndReturn(blockTags);

    // 获取默认值
    const defaultValue = param.defaultValue || '';

    // 检查是否已废弃
    const deprecated = blockTags.some((tag) => tag.tag === '@deprecated');

    // 获取版本信息
    const since =
      blockTags
        .find((tag) => tag.tag === '@since')
        ?.content.map((item) => item.text)
        .join(' ') || '';

    // 处理摘要
    const summaryList = this.toTemplateSummaryList(summary);

    // 用于 markdown table，将 summary 转换为描述文本
    const description = this.summaryListToMarkdownTable(summaryList);

    return {
      id: param.id,
      name: parent ? `${parent.name}.${param.name}` : param.name,
      type: param.type ? this.warpType(param.type.toString()) : 'unknown',
      description,
      summaryList,
      blockTagsList,
      defaultValue,
      since,
      deprecated
    };
  }

  /**
   * 将摘要列表转换为 markdown table 格式
   *
   * @description 只处理 text 类型的 summary，将换行符转换为 <br>
   *
   * @param summaryList 摘要列表
   * @returns markdown table 格式的字符串
   */
  private summaryListToMarkdownTable(
    summaryList: CommentDisplayPart[]
  ): string {
    return summaryList
      .filter((summary) => summary.kind === 'text')
      .map((summary) => summary.text)
      .join('')
      .replace(/\n/g, '<br>');
  }
}
