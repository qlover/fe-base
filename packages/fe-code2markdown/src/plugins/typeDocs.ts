/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Application,
  CommentDisplayPart,
  ParameterReflection,
  ProjectReflection,
  ReflectionKind,
  TSConfigReader,
  TypeDocReader
} from 'typedoc';
import { ScriptPlugin } from '@qlover/scripts-context';
import { ReflectionKindName } from '../type';
import fsExtra from 'fs-extra';
import { resolve } from 'path';
import Code2MDContext from '../implments/Code2MDContext';

export interface FormatProjectValue {
  /**
   * 唯一标识
   */
  id: number;
  /**
   * 解析类型
   */
  kind: ReflectionKind;
  /**
   * 解析出的类型名
   *
   * 例如：Class,Interface,Constructor,Property ...
   */
  kindName: FormatProjectKindName;
  /**
   * 名称
   */
  name: string;

  /**
   * 类型字符串
   *
   * 例如：`string`
   */
  typeString: string;

  /**
   * 描述内容
   *
   * 包含所有 @ 标签和 summary
   */
  descriptions: FormatProjectDescription[];

  /**
   * 源文件信息
   *
   * 记录该元素来自哪个文件的哪一行
   */
  source?: FormatProjectSource;

  /**
   * 参数列表
   *
   * 比如方法的参数，是一个列表, 至少有以下：
   *
   * 1. 参数名
   * 2. 参数类型
   * 3. 参数描述
   * 4. 参数默认值
   * 5. 参数是否已废弃
   * 6. 来自那个版本
   */
  parametersList?: FormatProjectValue[];

  /**
   * 子元素
   *
   * - 声明为 interface,class 的成员当作子元素
   * - 声明为 type 的成员，也应该是子元素
   * - 声明为 enum 的成员，只当作属性(后期可考虑换成表格表示)
   * - signatures 也是当作子元素
   */
  children?: FormatProjectValue[];

  // 当有parametersList时，以下属性为必填
  defaultValue?: string;
  since?: string;
  deprecated?: boolean;
  /**
   * 是否可选
   */
  optional?: boolean;
}

export type FormatProjectKindName =
  (typeof ReflectionKindName)[keyof typeof ReflectionKindName];

export interface FormatProjectDescription {
  /**
   * if comment.summary tag is `@summary`
   */
  tag: string;

  name?: string;

  content: CommentDisplayPart[];
}

/**
 * 源文件信息
 *
 * @description 用于记录代码元素的来源文件信息
 */
export interface FormatProjectSource {
  /**
   * 文件名
   */
  fileName: string;

  /**
   * 行号
   */
  line: number;

  /**
   * 字符位置
   */
  character: number;

  /**
   * 源码链接 URL（如果有）
   */
  url?: string;
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
    super(context, 'typeDocs');
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
        basePath: resolve(this.context.options.basePath || process.cwd()),
        entryPoints: this.context.options.entryPoints.map((entry) =>
          resolve(entry)
        ),
        skipErrorChecking: true,
        // 确保包含所有成员
        includeVersion: true,
        excludePrivate: false,
        excludeProtected: false,
        excludeExternals: false
      },
      [new TSConfigReader(), new TypeDocReader()]
    );

    this.app = app;
    return app;
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
    this.logger.info('Generate JSON file success', path);
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

    // 在使用时 resolve 路径
    const resolvedPath = resolve(path);
    this.writeJSON(app.serializer.projectToObject(project, './'), resolvedPath);
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

    await this.writeToFile(project);

    const formatProject = this.formats(project);

    this.context.setOptions({ projectReflection: project, formatProject });

    // 在使用时 resolve 路径
    const resolvedTplPath = resolve(
      this.context.options.generatePath,
      this.context.options.tplPath
    );
    this.writeJSON(formatProject, resolvedTplPath);
  }

  /**
   * 将 ProjectReflection 转换为 FormatProjectValue 格式
   *
   * @description 递归转换 TypeDoc 项目数据为标准化格式
   *
   * @param project TypeDoc 项目反射对象
   * @returns FormatProjectValue[] 格式化后的项目数据数组
   *
   * @example
   * ```typescript
   * const formatData = this.formats(project);
   * ```
   */
  formats(project: ProjectReflection): FormatProjectValue[] {
    if (!project.children) {
      return [];
    }

    return project.children.map((child: any) =>
      this.convertReflectionToFormatValue(child)
    );
  }

  /**
   * 将单个 Reflection 转换为 FormatProjectValue
   *
   * @description 转换 TypeDoc 反射对象为 FormatProjectValue 格式
   *
   * @param reflection TypeDoc 反射对象
   * @returns FormatProjectValue 格式化后的数据
   */
  private convertReflectionToFormatValue(reflection: any): FormatProjectValue {
    const kindName =
      ReflectionKindName[reflection.kind as keyof typeof ReflectionKindName] ||
      'Unknown';

    // 获取类型字符串
    const typeString = this.getTypeString(reflection);

    // 格式化描述信息
    const descriptions = this.formatDescription(reflection.comment);

    // 获取源文件信息
    const source = this.getSourceInfo(reflection);

    // 处理参数列表
    let parametersList: FormatProjectValue[] | undefined;
    if (reflection.signatures?.[0]?.parameters) {
      parametersList = this.formatParameters(
        reflection.signatures[0].parameters
      );
    } else if (reflection.parameters) {
      parametersList = this.formatParameters(reflection.parameters);
    }

    // 处理子元素
    let children: FormatProjectValue[] | undefined;
    if (reflection.children) {
      children = reflection.children.map((child: any) =>
        this.convertReflectionToFormatValue(child)
      );
    }

    // 处理 type.declaration.children（用于 type 类型）
    if (
      reflection.type?.type === 'reflection' &&
      reflection.type.declaration?.children
    ) {
      const typeChildren = reflection.type.declaration.children.map(
        (child: any) => this.convertReflectionToFormatValue(child)
      );
      children = children ? [...children, ...typeChildren] : typeChildren;
    }

    // 处理签名作为子元素
    // 对于构造函数，将签名信息直接包含在构造函数对象中，不作为子元素
    if (reflection.signatures && reflection.signatures.length > 0) {
      if (reflection.kind === ReflectionKind.Constructor) {
        // 对于构造函数，将第一个签名的参数信息直接包含在构造函数中
        const firstSignature = reflection.signatures[0];
        if (firstSignature.parameters) {
          parametersList = this.formatParameters(firstSignature.parameters);
        }
        // 修改构造函数的名称，使其包含类名
        if (firstSignature.name && firstSignature.name.startsWith('new ')) {
          reflection.name = firstSignature.name;
        }
      } else {
        // 对于其他类型，将签名作为子元素
        const signatureChildren = reflection.signatures.map((signature: any) =>
          this.convertReflectionToFormatValue(signature)
        );
        children = children
          ? [...children, ...signatureChildren]
          : signatureChildren;
      }
    }

    // 获取额外属性
    const defaultValue = this.getDefaultValue(reflection);
    const since = this.getSinceVersion(reflection);
    const deprecated = this.isDeprecated(reflection);
    const optional = this.isOptional(reflection);

    return {
      id: reflection.id,
      kind: reflection.kind,
      kindName: kindName as any,
      name: reflection.name,
      typeString,
      descriptions,
      source,
      parametersList,
      children,
      defaultValue,
      since,
      deprecated,
      optional
    };
  }

  /**
   * 获取类型字符串
   *
   * @description 从 TypeDoc 反射对象中提取类型信息
   *
   * @param reflection TypeDoc 反射对象
   * @returns string 类型字符串
   */
  private getTypeString(reflection: any): string {
    if (reflection.type) {
      if (reflection.type.type === 'intrinsic') {
        return reflection.type.name;
      }
      if (reflection.type.type === 'reference') {
        // 对于引用类型，返回完整的类型名称
        return reflection.type.name || 'Reference';
      }
      if (reflection.type.type === 'literal') {
        return typeof reflection.type.value === 'string'
          ? `"${reflection.type.value}"`
          : String(reflection.type.value);
      }
      if (reflection.type.type === 'reflection') {
        return 'Object';
      }
      if (reflection.type.type === 'union') {
        return (
          reflection.type.types
            ?.map((t: any) => this.getTypeString({ type: t }))
            .join(' | ') || 'Union'
        );
      }
      if (reflection.type.type === 'intersection') {
        return (
          reflection.type.types
            ?.map((t: any) => this.getTypeString({ type: t }))
            .join(' & ') || 'Intersection'
        );
      }
    }

    // 对于方法/函数，返回函数签名
    if (reflection.signatures?.[0]) {
      const signature = reflection.signatures[0];
      const params =
        signature.parameters
          ?.map((p: any) => `${p.name}: ${this.getTypeString(p)}`)
          .join(', ') || '';
      const returnType = this.getTypeString(signature);
      return `(${params}) => ${returnType}`;
    }

    return 'unknown';
  }

  /**
   * 获取默认值
   *
   * @description 从反射对象中提取默认值信息
   *
   * @param reflection TypeDoc 反射对象
   * @returns string | undefined 默认值
   */
  private getDefaultValue(reflection: any): string | undefined {
    if (reflection.defaultValue !== undefined) {
      return String(reflection.defaultValue);
    }

    // 从注释中获取 @default 标签
    if (reflection.comment?.blockTags) {
      const defaultTag = reflection.comment.blockTags.find(
        (tag: any) => tag.tag === '@default'
      );
      if (defaultTag?.content?.[0]?.text) {
        return defaultTag.content[0].text.replace(/`/g, '');
      }
    }

    return undefined;
  }

  /**
   * 获取版本信息
   *
   * @description 从反射对象中提取 @since 标签信息
   *
   * @param reflection TypeDoc 反射对象
   * @returns string | undefined 版本信息
   */
  private getSinceVersion(reflection: any): string | undefined {
    if (reflection.comment?.blockTags) {
      const sinceTag = reflection.comment.blockTags.find(
        (tag: any) => tag.tag === '@since'
      );
      if (sinceTag?.content?.[0]?.text) {
        return sinceTag.content[0].text;
      }
    }
    return undefined;
  }

  /**
   * 检查是否已废弃
   *
   * @description 从反射对象中检查 @deprecated 标签
   *
   * @param reflection TypeDoc 反射对象
   * @returns boolean 是否已废弃
   */
  private isDeprecated(reflection: any): boolean {
    if (reflection.comment?.blockTags) {
      return reflection.comment.blockTags.some(
        (tag: any) => tag.tag === '@deprecated'
      );
    }
    return false;
  }

  /**
   * 检查是否可选
   *
   * @description 检查参数是否可选（有 ? 标记、默认值或 @optional 标签）
   *
   * @param reflection TypeDoc 反射对象
   * @returns boolean 是否可选
   */
  private isOptional(reflection: any): boolean {
    // 检查是否有 ? 标记（可选参数）
    if (reflection.flags?.isOptional) {
      return true;
    }

    // 检查是否有默认值
    if (reflection.defaultValue !== undefined) {
      return true;
    }

    // 检查 @default 标签
    if (reflection.comment?.blockTags) {
      const hasDefaultTag = reflection.comment.blockTags.some(
        (tag: any) => tag.tag === '@default'
      );
      if (hasDefaultTag) {
        return true;
      }
    }

    // 检查 @optional 标签
    if (reflection.comment?.blockTags) {
      const hasOptionalTag = reflection.comment.blockTags.some(
        (tag: any) => tag.tag === '@optional'
      );
      if (hasOptionalTag) {
        return true;
      }
    }

    return false;
  }

  /**
   * 格式化描述信息
   *
   * @description 将 TypeDoc 注释转换为 FormatProjectDescription 格式，过滤掉已单独提取的标签
   *
   * @param comment TypeDoc 注释对象
   * @returns FormatProjectDescription[] 格式化后的描述数组
   *
   * @example
   * ```typescript
   * const descriptions = this.formatDescription(reflection.comment);
   * ```
   */
  formatDescription(comment: any): FormatProjectDescription[] {
    if (!comment) {
      return [];
    }

    const descriptions: FormatProjectDescription[] = [];

    // 动态获取需要过滤掉的标签（优先 context 配置）
    const filteredTags = (this.context.options.filterTags as string[]) || [
      '@default',
      '@since',
      '@deprecated',
      '@optional'
    ];
    // 定义优先显示的标签
    const priorityTags = ['@summary', '@description'];

    // 处理 summary
    if (comment.summary && comment.summary.length > 0) {
      descriptions.push({
        tag: '@summary',
        content: comment.summary
      });
    }

    // 处理 blockTags，过滤掉已单独提取的标签
    if (comment.blockTags && comment.blockTags.length > 0) {
      const validTags = comment.blockTags.filter(
        (tag: any) => !filteredTags.includes(tag.tag)
      );

      // 按优先级排序：优先标签在前，其他按原顺序
      const sortedTags = validTags.sort((a: any, b: any) => {
        const aPriority = priorityTags.includes(a.tag);
        const bPriority = priorityTags.includes(b.tag);
        if (aPriority && !bPriority) return -1;
        if (!aPriority && bPriority) return 1;
        return 0;
      });

      sortedTags.forEach((tag: any) => {
        descriptions.push({
          tag: tag.tag,
          name: tag.name,
          content: tag.content || []
        });
      });
    }

    return descriptions;
  }

  /**
   * 格式化参数列表
   *
   * @description 将 TypeDoc 参数数组转换为 FormatProjectValue 格式
   *
   * @param parameters TypeDoc 参数数组
   * @returns FormatProjectValue[] 格式化后的参数数组
   *
   * @example
   * ```typescript
   * const params = this.formatParameters(signature.parameters);
   * ```
   */
  formatParameters(parameters: ParameterReflection[]): FormatProjectValue[] {
    if (!Array.isArray(parameters)) {
      return [];
    }

    const result: FormatProjectValue[] = [];

    parameters.forEach((param: any) => {
      // 检查参数是否是对象类型（如 options）
      if (
        param.type?.type === 'reflection' &&
        param.type.declaration?.children
      ) {
        // 先添加对象参数本身
        result.push({
          id: param.id,
          kind: param.kind,
          kindName: ReflectionKindName[
            param.kind as keyof typeof ReflectionKindName
          ] as any,
          name: param.name,
          typeString: this.getTypeString(param),
          descriptions: this.formatDescription(param.comment),
          defaultValue: this.getDefaultValue(param),
          since: this.getSinceVersion(param),
          deprecated: this.isDeprecated(param),
          optional: this.isOptional(param)
        });

        // 然后展开其属性
        const objectChildren = param.type.declaration.children;
        objectChildren.forEach((child: any) => {
          result.push({
            id: child.id,
            kind: child.kind,
            kindName: ReflectionKindName[
              child.kind as keyof typeof ReflectionKindName
            ] as any,
            name: `${param.name}.${child.name}`, // 使用 options.name 格式
            typeString: this.getTypeString(child),
            descriptions: this.formatDescription(child.comment),
            defaultValue: this.getDefaultValue(child),
            since: this.getSinceVersion(child),
            deprecated: this.isDeprecated(child),
            optional: this.isOptional(child)
          });
        });
      } else {
        // 普通参数
        result.push({
          id: param.id,
          kind: param.kind,
          kindName: ReflectionKindName[
            param.kind as keyof typeof ReflectionKindName
          ] as any,
          name: param.name,
          typeString: this.getTypeString(param),
          descriptions: this.formatDescription(param.comment),
          defaultValue: this.getDefaultValue(param),
          since: this.getSinceVersion(param),
          deprecated: this.isDeprecated(param),
          optional: this.isOptional(param)
        });
      }
    });

    return result;
  }

  /**
   * 获取源文件信息
   *
   * @description 从 TypeDoc 反射对象中提取源文件信息
   *
   * @param reflection TypeDoc 反射对象
   * @returns FormatProjectSource | undefined 源文件信息
   */
  private getSourceInfo(reflection: any): FormatProjectSource | undefined {
    // 优先从 sources 数组中获取第一个源文件信息
    if (
      reflection.sources &&
      Array.isArray(reflection.sources) &&
      reflection.sources.length > 0
    ) {
      const source = reflection.sources[0];
      return {
        fileName: source.fileName,
        line: source.line,
        character: source.character,
        url: source.url
      };
    }

    // 如果没有 sources，尝试从 source 属性获取
    if (reflection.source) {
      return {
        fileName: reflection.source.fileName,
        line: reflection.source.line,
        character: reflection.source.character,
        url: reflection.source.url
      };
    }

    return undefined;
  }
}
