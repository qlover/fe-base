import { ReflectionKind } from 'typedoc';

/**
 * @type {typeof import('../index.js').ReflectionKindName}
 */
export const ReflectionKindName = {};
Object.entries(ReflectionKind).reduce((acc, [key, value]) => {
  acc[value] = key;
  return acc;
}, ReflectionKindName);

const DisplayPartsKindName = {
  text: 'Text',
  code: 'Code',
  inlineTag: 'InlineTag'
};

export class TypeDocConverter {
  /**
   *
   * @param {Object} params
   * @param {import('typedoc').ProjectReflection} params.project
   * @param {import('@qlover/fe-utils').Logger} params.logger
   * @param {number} params.level 1 优先ts类型 2 优先注释类型 default 1
   * @param {boolean} params.hasSkipInherited 是否跳过继承的属性 default true
   */
  constructor({ project, logger, level = 1, hasSkipInherited = true }) {
    /**
     * @type {import('typedoc').ProjectReflection}
     */
    this.project = project;
    this.logger = logger;
    this.level = level;

    /**
     * 是否跳过继承的属性
     * @type {boolean}
     */
    this.hasSkipInherited = hasSkipInherited;
  }

  getLevelValue(tsValue, docsValue) {
    if (this.level === 1) {
      return tsValue;
    }

    return docsValue;
  }

  warpType(typeString) {
    return `\`${typeString.replace(/\|/g, '\\|')}\``;
  }

  /**
   * 获取一个blockTags中的一个tag的内容
   *
   * FIXME: 未找到返回null
   * @param {import('typedoc').CommentTag[]} blockTags
   * @param {string} tag
   * @returns {string|null}
   */
  getOneBlockTags(blockTags, tag) {
    const target = blockTags.find((item) => item.tag === tag);
    if (target) {
      return target.content.map((item) => item.text).join(' ');
    }
    return null;
  }

  /**
   * 获取一个blockTags中的一个tag的内容
   * @param {import('typedoc').CommentTag[]} blockTags
   * @param {string} tag
   * @returns {import('typedoc').CommentDisplayPart[]}
   */
  getBlockTags(blockTags, tag) {
    const result = blockTags
      .filter((item) => item.tag === tag)
      .map((item) => item.content)
      .flat();
    return this.toTemplateSummaryList(result);
  }

  /**
   * 处理参数类型, 可以是一个范型
   *
   * 用反引号包含起来，否则会引起 模板渲染
   * @param {import('typedoc').Type} type
   * @param {string} name
   * @returns {string}
   */
  getParamType(type) {
    return this.warpType(type.toString());
  }

  /**
   * 获取摘要列表
   * @param {import('typedoc').CommentDisplayPart[]} summary
   * @returns {import('typedoc').CommentDisplayPart[]}
   */
  toTemplateSummaryList(summary) {
    return summary.map((item) => this.toTemplateSummary(item));
  }

  /**
   * 将一个summary转换为模板需要的对象
   * @param {import('typedoc').CommentDisplayPart} summary
   * @param {string} tag
   * @returns {import('typedoc').CommentDisplayPart & { isText?: boolean, isCode?: boolean, isInlineTag?: boolean, tag: string }}
   */
  toTemplateSummary(summary, tag) {
    return {
      ...summary,
      [`is${DisplayPartsKindName[summary.kind]}`]: true,
      tag,
      title: tag?.replace('@', '')
    };
  }

  /**
   * 将一个参数列表转换为模板需要的对象
   * @param {import('typedoc').ParameterReflection[]} parameters
   * @param {import('typedoc').DeclarationReflection} member
   * @param {import('typedoc').DeclarationReflection} classItem
   * @returns {Object[]}
   */
  toParametersList(parameters, member, classItem) {
    const result = [];
    parameters.forEach((param) => {
      const decChildren = param.type?.declaration?.children || [];
      try {
        // 如果是一个引用类型？
        if (decChildren.length > 0) {
          decChildren.forEach((child) => {
            const { blockTags = [] } = child.comment || {};
            result.push(this.toParametersListItem(child, param, blockTags));
          });
        } else {
          const { blockTags = [] } = param.comment || {};
          result.push(this.toParametersListItem(param, null, blockTags));
        }
      } catch (e) {
        this.logger.warn(
          'toParametersListItem Error:',
          `${this.project?.id} ${this.project?.name}`,
          `${classItem?.id} ${classItem?.name}`,
          `${member?.id} ${member?.name}`,
          `${param?.id} ${param?.name}`
        );
        this.logger.error(e.message);
      }
    });
    return result;
  }

  /**
   * 获取不包含 `@returns` 和 `@param` 的 blockTags
   * @param {import('typedoc').CommentDisplayPart[]} blockTags
   * @returns {import('typedoc').CommentDisplayPart[]}
   */
  getBlockTagsNoParamAndReturn(blockTags) {
    return this.filterBlockTagsNot(blockTags, ['@returns', '@param']);
  }

  /**
   * 将一个参数转换为模板需要的对象
   * @param {import('typedoc').ParameterReflection} child
   * @param {import('typedoc').DeclarationReflection | undefined} parent
   * @param {import('typedoc').CommentTag[] | undefined} blockTags
   * @returns {Object}
   */
  toParametersListItem(child, parent, blockTags) {
    blockTags = blockTags || child.comment?.blockTags || [];
    // 过滤掉 @returns 和 @param
    const blockTagsList = this.getBlockTagsNoParamAndReturn(blockTags);

    // 参数默认值
    const defaultValue = this.getLevelValue(
      child.defaultValue,
      this.getOneBlockTags(blockTags, '@default')
    );

    // getOneBlockTags 没有找到会返回 null
    const deprecated = this.getOneBlockTags(blockTags, '@deprecated') !== null;

    return {
      id: child.id,
      name: parent ? parent.name + '.' + child.name : child.name,
      type: this.getParamType(child.type, child.type?.name),
      blockTagsList,
      summaryList: this.toTemplateSummaryList(child.comment?.summary || []),
      descriptionList: this.getBlockTags(blockTags, '@description'),
      defaultValue: defaultValue,
      since: this.getOneBlockTags(blockTags, '@since'),
      deprecated
    };
  }

  /**
   * Get the real source of a member, ensuring it belongs to the current class
   * @param {import('typedoc').DeclarationReflection} member
   * @param {import('typedoc').DeclarationReflection} parent
   * @returns {import('typedoc').SourceReference|undefined}
   */
  getRealSource(member, parent) {
    const reflection = this.project.getReflectionById(member.id);
    if (!reflection || !reflection.sources?.length) {
      return undefined;
    }

    // Verify the source belongs to the current class
    const source = reflection.sources[0];
    if (parent && parent.sources?.length) {
      const classSource = parent.sources[0];
      if (source.fileName !== classSource.fileName) {
        return undefined;
      }
    }

    return source;
  }

  /**
   * 获取返回值
   * @param {import('typedoc').DeclarationReflection} member
   * @returns {string}
   */
  getReturnValue(member) {
    const { comment = {}, type } = member;
    const blockTags = comment.blockTags || [];

    // ts 返回类型
    if (type?.name) {
      return type.toString();
    }

    // @returns 注释返回类型
    return this.getOneBlockTags(blockTags, '@returns')?.text;
  }

  /**
   * 过滤一个blockTags中的一个tag
   * @param {import('typedoc').CommentDisplayPart[]} blockTags
   * @param {string} tag
   * @returns {import('typedoc').CommentDisplayPart[]}
   */
  filterBlockTags(blockTags, tag) {
    return blockTags.filter((item) => item.tag == tag);
  }

  /**
   * 过滤一个blockTags中的一个tag
   * @param {import('typedoc').CommentDisplayPart[]} blockTags
   * @param {string[]|string} tags
   * @returns {import('typedoc').CommentDisplayPart[]}
   */
  filterBlockTagsNot(blockTags, tags) {
    if (Array.isArray(tags)) {
      return blockTags.filter((item) => !tags.includes(item.tag));
    }
    return blockTags.filter((item) => item.tag != tags);
  }

  /**
   * 获取类的注释
   * 包含 summary, blockTags,
   * 将格式统一成 { tag, text, kind, isText, isCode, isLink, isInlineTag }
   * @param {import('typedoc').DeclarationReflection} classItem
   * @returns {{summary: import('typedoc').Comment[], blockTags: import('typedoc').Comment[]}}
   */
  getComments(classItem) {
    let { summary = [], blockTags = [] } = classItem.comment || {};

    blockTags = blockTags.map((tag) => {
      const content = tag.content.map((item) =>
        this.toTemplateSummary(item, tag.tag)
      );
      // 如果 content 为空, 则不返回 content
      return { ...tag, content: content.length > 0 ? content : undefined };
    });

    return { summary: this.toTemplateSummaryList(summary), blockTags };
  }

  /**
   * 解析 class 的 children
   * @param {import('typedoc').DeclarationReflection} reflection
   * @returns {import('../index.js').HBSTemplateContext[]}
   */
  parseReflection(reflection) {
    const result = this.reflectionToTemplateResult({ reflection });
    this.logger.debug(result.kindName, result.name, result.id);

    // 一般只有 class, interface 有 children
    // 第二层， 基本是 Constructors,Properties, Methods ...
    if (reflection.children) {
      const members = [];
      for (const v2member of reflection.children) {
        const signatures = this.packSignatures(v2member, reflection);

        if (Array.isArray(signatures)) {
          members.push(...signatures);
        } else if (signatures) {
          members.push(signatures);
        }
      }

      // 增加 hasMembers 属性，用于模板渲染
      Object.assign(result, { members, hasMembers: members.length > 0 });
    }

    return result;
  }

  /**
   * 按 source 分组, 文件路径
   * @returns {Map<string, {[key in import('typedoc').ReflectionKind]: import('typedoc').DeclarationReflection[]}>}
   */
  getProjectSourceMap() {
    const sourceMaps = new Map();

    for (const child of this.project.children) {
      // try {
      const fullFileName =
        this.getRealSource(child).fullFileName || child.sources[0].fileName;

      if (!sourceMaps.has(fullFileName)) {
        sourceMaps.set(fullFileName, {});
      }

      const values = sourceMaps.get(fullFileName);

      if (!values[child.kind]) {
        values[child.kind] = [];
      }

      values[child.kind].push(this.parseReflection(child));
      // } catch {
      //   this.logger.error('No sources for class', child.name);
      // }
    }

    return sourceMaps;
  }

  /**
   * 按 source 分组, 文件路径
   *
   * @returns {import('../index.d.ts').ParserContextMap}
   */
  getContextMap() {
    const sourceMaps = this.getProjectSourceMap();

    // 将 Map 转换为 Object
    // 并将 kind 变成字符串
    const result = {};
    for (const [fileName, values] of sourceMaps.entries()) {
      result[fileName] = Object.fromEntries(
        Object.entries(values).map(([kind, children]) => [
          ReflectionKindName[kind],
          children
        ])
      );
    }

    return result;
  }

  /**
   * 将一个反射的签名转换为模板需要的对象
   * @param {import('typedoc').DeclarationReflection} reflection
   * @param {import('typedoc').DeclarationReflection} parent
   * @returns {undefined | import('../index.js').HBSTemplateContext | import('../index.js').HBSTemplateContext[]}
   */
  packSignatures(reflection, parent) {
    const { inheritedFrom, implementationOf, signatures, name } = reflection;
    // 签名(定义)可能存在下面几种情况:
    // 1. extends 父类, 没有签名
    // 2. extends 父类, 有签名, 重写了父类签名
    // 3. 没有 extends 父类有签名
    // 4. 没有 extends 父类没有签名
    const isInherited = !!inheritedFrom;
    const isImplementation = !!implementationOf;

    this.logger.debug(
      'Inherited:',
      isInherited,
      'Implementation:',
      isImplementation
    );

    //  去掉所有来自继承的属性
    if (this.hasSkipInherited && isInherited) {
      this.logger.warn(`${name} is inherited, skip!`);
      return;
    }

    // 如果是 interface, children 都没有 signatures, 那么就是自身
    // 注意: reflection.kind 是成员， parent 才是类型
    if (
      parent.kind === ReflectionKind.Interface &&
      !Array.isArray(signatures)
    ) {
      return this.reflectionToTemplateResult({ reflection, parent });
    }

    if (!Array.isArray(signatures)) {
      this.logger.warn(
        `${parent?.name}.${reflection?.name} no signatures, skip!`
      );
      return;
    }

    const kindName = ReflectionKindName[reflection.kind];

    // 有重载的情况, 多个方法被声明, 目前就按多个处理
    return signatures.map((signature, index) => {
      const templateResult = this.reflectionToTemplateResult({
        reflection: signature,
        parent: reflection
      });

      this.logger.debug(
        `Created signature! [${kindName}]`,
        `${parent?.name}.${reflection?.name} signature[${index}]`,
        `Result: ${templateResult.name}`
      );

      return Object.assign(templateResult, {
        name: reflection.name,
        isInherited,
        isImplementation
      });
    });
  }

  /**
   * 将一个反射转换为模板需要的对象
   * @param {Object} params
   * @param {import('typedoc').DeclarationReflection} params.reflection
   * @param {import('typedoc').DeclarationReflection} params.parent
   * @returns {import('../index.d.ts').HBSTemplateContext}
   */
  reflectionToTemplateResult({ reflection, parent }) {
    const kindName = ReflectionKindName[reflection.kind];

    this.logger.debug(
      `Creating [${kindName}]`,
      parent?.name ? `${parent?.name}.${reflection?.name}` : reflection?.name,
      reflection.id
    );

    const { id, name, kind, type, parameters } = reflection;

    const { summary, blockTags } = this.getComments(reflection);
    const blockTagsList = this.getBlockTagsNoParamAndReturn(blockTags);
    const source = this.getRealSource(reflection, parent);

    const parametersList = parameters
      ? this.toParametersList(parameters, reflection, parent)
      : undefined;

    const result = {
      id: id,
      kind: kind,
      kindName: ReflectionKindName[kind],
      name: name,
      type: type ? this.getParamType(type) : undefined,
      summaryList: summary,
      blockTagsList,
      source,
      parametersList
    };

    this.logger.debug(
      `Created! [${kindName}]`,
      `${parent?.name ? `${parent?.name}.` : ''}${reflection?.name}`
    );

    return this.adjustResult(result);
  }

  /**
   * 检查结果, 添加一些标记, 方便模板直接渲染
   * @param {import('../index.js').HBSTemplateContext} result
   */
  adjustResult(result) {
    const kindName = ReflectionKindName[result.kind];

    return {
      ...result,
      [`is${kindName}`]: true
    };
  }
}
