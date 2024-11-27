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
    return this.getSummaryList(result);
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
  getSummaryList(summary) {
    return summary.map((item) => {
      return {
        ...item,
        isText: item.kind === 'text',
        isCode: item.kind === 'code',
        isLink: item.kind === 'link',
        isInlineTag: item.kind === 'inlineTag'
      };
    });
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
   * 将一个参数转换为模板需要的对象
   * @param {import('typedoc').ParameterReflection} child
   * @param {import('typedoc').DeclarationReflection | undefined} parent
   * @param {import('typedoc').CommentTag[] | undefined} blockTags
   * @returns {Object}
   */
  toParametersListItem(child, parent, blockTags) {
    blockTags = blockTags || child.comment?.blockTags || [];
    return {
      id: child.id,
      name: parent ? parent.name + '.' + child.name : child.name,
      type: this.getParamType(child.type, child.type?.name),
      summaryList: this.getSummaryList(child.comment?.summary || []),
      descriptionList: this.getBlockTags(blockTags, '@description'),
      defaultValue: this.getOneBlockTags(blockTags, '@default'),
      since: this.getOneBlockTags(blockTags, '@since'),
      deprecated: this.getOneBlockTags(blockTags, '@deprecated') !== null
    };
  }

  /**
   *
   * @param {import('typedoc').DeclarationReflection} project
   * @returns
   */
  getRealSource(member) {
    // FIXME: 获取绝对路径, 目前获取第一个
    return this.project.getReflectionById(member.id).sources?.[0];
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
   * 将一个成员转换为模板需要的对象
   * @param {Object} params
   * @param {import('typedoc').DeclarationReflection} params.member
   * @param {import('typedoc').ParameterReflection[]} params.parameters
   * @param {string} params.type
   * @param {import('typedoc').DeclarationReflection} params.classItem
   * @returns {Object}
   */
  toTemplateResult({ member, parameters, type = 'class', classItem }) {
    const { name, comment = {} } = member;
    const blockTags = comment.blockTags || [];

    const result = {
      id: member.id,
      name: name,
      summaryList: this.getSummaryList(comment?.summary || []),
      descriptionList: this.getBlockTags(blockTags, '@description'),
      exampleList: this.getBlockTags(blockTags, '@example'),
      parameters:
        type === 'method' && parameters
          ? this.toParametersList(parameters, member, classItem)
          : undefined,
      returnValue:
        type === 'method' && parameters
          ? this.getReturnValue(member)
          : undefined,
      type,
      source: this.getRealSource(member)
    };

    return this.adjustResult(result);
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
   * 将一个类的成员转换为模板需要的对象
   * @param {import('typedoc').DeclarationReflection} reflection
   * @param {import('typedoc').DeclarationReflection} classItem
   * @returns {Object[]}
   */
  classMembersToTemplateResults(reflection, classItem) {
    const { children = [] } = reflection;
    const result = [];

    children.forEach((member) => {
      const { signatures = [] } = member;

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
}
