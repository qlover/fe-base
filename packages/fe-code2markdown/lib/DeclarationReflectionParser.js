export class DeclarationReflectionParser {
  /**
   * @param {import('typedoc').ProjectReflection} project
   */
  constructor(project) {
    /**
     * @type {import('typedoc').ProjectReflection}
     */
    this.project = project;
  }

  /**
   * 获取一个blockTags中的一个tag的内容
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
   * @param {import('typedoc').Type} type
   * @param {string} name
   * @returns {string}
   */
  getParamType(type, name) {
    name = name || type.name || '';
    const fx = type.typeArguments
      ? `<${type.typeArguments.map((item) => item.name).join(',')}>`
      : '';
    return name + fx;
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
   * @param {import('typedoc').CommentDisplayPart[]} summary
   * @param {string} tag
   * @returns {import('typedoc').CommentDisplayPart & { isText: boolean, isCode: boolean, isLink: boolean, isInlineTag: boolean, tag: string }}
   */
  toTemplateSummary(summary, tag) {
    return {
      ...summary,
      isText: summary.kind === 'text',
      isCode: summary.kind === 'code',
      isLink: summary.kind === 'link',
      isInlineTag: summary.kind === 'inlineTag',
      tag
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
        console.warn(
          'toParametersListItem Error:',
          `${this.project?.id} ${this.project?.name}`,
          `${classItem?.id} ${classItem?.name}`,
          `${member?.id} ${member?.name}`,
          `${param?.id} ${param?.name}`
        );
        console.error(e.message);
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

    return {
      id: child.id,
      name: parent ? parent.name + '.' + child.name : child.name,
      type: this.getParamType(child.type, child.type?.name),
      blockTagsList,
      summaryList: this.toTemplateSummaryList(child.comment?.summary || []),
      descriptionList: this.getBlockTags(blockTags, '@description'),
      defaultValue: this.getOneBlockTags(blockTags, '@default'),
      since: this.getOneBlockTags(blockTags, '@since'),
      deprecated: this.getOneBlockTags(blockTags, '@deprecated') !== null
    };
  }

  /**
   * Get the real source of a member, ensuring it belongs to the current class
   * @param {import('typedoc').DeclarationReflection} member
   * @param {import('typedoc').DeclarationReflection} classItem
   * @returns {import('typedoc').SourceReference|undefined}
   */
  getRealSource(member, classItem) {
    const reflection = this.project.getReflectionById(member.id);
    if (!reflection || !reflection.sources?.length) {
      return undefined;
    }

    // Verify the source belongs to the current class
    const source = reflection.sources[0];
    if (classItem && classItem.sources?.length) {
      const classSource = classItem.sources[0];
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
      return type.name;
    }

    // @returns 注释返回类型
    return this.getOneBlockTags(blockTags, '@returns')?.text;
  }

  /**
   * 检查结果
   * @param {Object} result
   */
  adjustResult(result) {
    return {
      ...result,
      showSummary: result.summaryList.length > 0,
      showDescription: result.descriptionList.length > 0,
      showExample: result.exampleList.length > 0,
      showParameters: result.parameters && result.parameters.length > 0
    };
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
   * 是否是方法类型
   * @param {string} type
   * @returns {boolean}
   */
  isMethodType(type) {
    return type === 'method' || type === 'constructor';
  }

  /**
   * 将一个成员转换为模板需要的对象
   * @param {Object} params
   * @param {import('typedoc').DeclarationReflection} params.member
   * @param {import('typedoc').ParameterReflection[]} params.parameters
   * @param {string} params.type
   * @param {import('typedoc').DeclarationReflection} params.classItem
   * @returns {Object}
   */
  toTemplateResult({ member, parameters, type = 'class', classItem }) {
    const { name } = member;
    const comments = this.getComments(member);
    const { summary, blockTags } = comments;

    const exampleList = this.filterBlockTags(blockTags, '@example');
    const descriptionList = this.filterBlockTags(blockTags, '@description');
    const blockTagsList = this.getBlockTagsNoParamAndReturn(blockTags);

    const result = {
      id: member.id,
      name: name,
      summaryList: summary,
      blockTagsList,
      parameters:
        this.isMethodType(type) && parameters
          ? this.toParametersList(parameters, member, classItem)
          : undefined,

      /** @deprecated */
      descriptionList,
      /** @deprecated */
      exampleList,
      /** @deprecated */
      returnValue:
        this.is && parameters ? this.getReturnValue(member) : undefined,
      type,
      source: this.getRealSource(member, classItem)
    };

    return this.adjustResult(result);
  }

  /**
   * 将一个类的成员转换为模板需要的对象
   * @param {import('typedoc').DeclarationReflection} reflection
   * @param {import('typedoc').DeclarationReflection} classItem
   * @returns {Object[]}
   */
  classMembersToTemplateResults(reflection, classItem) {
    const { children = [] } = reflection;
    const result = [];
    const classSource = classItem?.sources?.[0]?.fileName;

    children.forEach((member) => {
      const { signatures = [] } = member;

      // Verify member belongs to current class
      const memberSource = member.sources?.[0]?.fileName;
      if (classSource && memberSource && classSource !== memberSource) {
        console.warn(
          `Member ${member.name} source (${memberSource}) differs from class source (${classSource})`
        );
        return; // Skip this member
      }

      console.info('signatures:', member.id, member.name);
      console.info(signatures.map((item) => item.name));

      if (signatures.length > 0) {
        signatures.forEach((memberSignature) => {
          const templateResult = this.toTemplateResult({
            member: memberSignature,
            parameters: memberSignature.parameters,
            type: 'method',
            classItem
          });
          // 设置方法名
          templateResult.name = member.name;

          result.push(templateResult);
        });
      }
      // 说明没有定义签名
      else {
        const templateResult = this.toTemplateResult({
          member,
          parameters: undefined,
          type: 'properties',
          classItem
        });
        result.push(templateResult);
      }
    });

    return result;
  }

  /**
   * 获取类的注释
   * 包含 summary, blockTags,
   * 将格式统一成 { tag, text, kind, isText, isCode, isLink, isInlineTag }
   * @param {import('typedoc').DeclarationReflection} classItem
   * @returns {{summary: import('typedoc').CommentDisplayPart[], blockTags: import('typedoc').CommentDisplayPart[]}}
   */
  getComments(classItem) {
    let { summary = [], blockTags = [] } = classItem.comment || {};

    blockTags = blockTags.flatMap((tag) => {
      return tag.content.map((item) => this.toTemplateSummary(item, tag.tag));
    });

    return { summary: this.toTemplateSummaryList(summary), blockTags };
  }
}
