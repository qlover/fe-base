import fsExtra from 'fs-extra';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';

class DeclarationReflectionParser {
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
   * @returns {Object[]}
   */
  toParametersList(parameters) {
    const result = [];
    parameters.forEach((param) => {
      const decChildren = param.type?.declaration?.children || [];
      // 如果是一个引用类型？
      if (decChildren.length > 0) {
        decChildren.forEach((child) => {
          const { blockTags = [] } = child.comment;
          result.push(this.toParametersListItem(child, param, blockTags));
        });
      } else {
        const { blockTags = [] } = param.comment;
        result.push(this.toParametersListItem(param, null, blockTags));
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
    blockTags = blockTags || child.comment.blockTags;
    return {
      id: child.id,
      name: parent ? parent.name + '.' + child.name : child.name,
      type: this.getParamType(child.type, child.type?.name),
      summaryList: this.getSummaryList(child.comment.summary),
      descriptionList: this.getBlockTags(
        child.comment.blockTags,
        '@description'
      ),
      defaultValue: this.getOneBlockTags(child.comment.blockTags, '@default'),
      since: this.getOneBlockTags(child.comment.blockTags, '@since'),
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
    return this.project.getReflectionById(member.id).sources[0];
  }
  /**
   * 将一个成员转换为模板需要的对象
   * @param {import('typedoc').DeclarationReflection} member
   * @returns {Object}
   */
  toTemplateResult(member, parameters, type = 'class') {
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
          ? this.toParametersList(parameters)
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
   * @returns {Object[]}
   */
  classMembersToTemplateResults(reflection) {
    // 扁平化所有 signatures
    const { children = [] } = reflection;

    const result = [];

    children.forEach((member) => {
      const { signatures = [] } = member;

      if (signatures.length > 0) {
        signatures.forEach((memberSignature) => {
          const templateResult = this.toTemplateResult(
            memberSignature,
            memberSignature.parameters,
            'method'
          );
          // 设置方法名
          templateResult.name = member.name;

          result.push(templateResult);
        });
      }
      // 说明没有定义签名
      else {
        const templateResult = this.toTemplateResult(
          member,
          undefined,
          'properties'
        );
        result.push(templateResult);
      }
    });

    return result;
  }
}
export class ProjectReflectionParser {
  constructor({ entryPoints, outputPath }) {
    this.entryPoints = entryPoints;
    this.outputPath = outputPath;
  }

  async load(path) {
    path = path || this.outputPath;
    if (!fsExtra.existsSync(path)) {
      return;
    }
    const project = fsExtra.readJSONSync(path);

    const app = await this.getApp();
    const reflections = app.deserializer.reviveProject(project);

    this.project = reflections;

    return this.project;
  }

  async writeTo(project) {
    const app = await this.getApp();
    // 删除文件
    fsExtra.removeSync(this.outputPath);
    // 确保文件存在，不存在则创建
    fsExtra.ensureFileSync(this.outputPath);

    fsExtra.writeFileSync(
      this.outputPath,
      JSON.stringify(app.serializer.projectToObject(project, './'), null, 2),
      'utf-8'
    );
  }

  async getApp() {
    if (this.app) {
      return this.app;
    }

    const app = await Application.bootstrap(
      {
        // typedoc options here
        entryPoints: this.entryPoints,
        skipErrorChecking: true
      },
      [new TSConfigReader(), new TypeDocReader()]
    );

    this.app = app;
    return app;
  }

  /**
   * 解析类
   * @param {import('typedoc').ProjectReflection} project
   * @returns {{class: Object, members: Object[]}[]}
   */
  parseClasses(project) {
    project = project || this.project;
    if (!project) {
      return;
    }

    const classList = project.groups
      .filter((group) => group.title === 'Classes')
      .map((group) => group.children)
      .flat();

    const result = classList.map((classItem) => {
      return this.parseClass(classItem, project);
    });

    return result;
  }

  /**
   * 解析一个类, 返回一个模板需要的对象
   * @param {import('typedoc').DeclarationReflection} classItem
   * @param {import('typedoc').ProjectReflection} project
   * @returns {{class: Object, members: Object[]}}
   */
  parseClass(classItem, project) {
    const result = {};
    // 解析出 class 数据
    const drp = new DeclarationReflectionParser(project);
    result.class = drp.toTemplateResult(classItem, undefined, 'class');

    // 解析出 class 的成员数据
    result.members = drp.classMembersToTemplateResults(classItem);

    return result;
  }

  /**
   * 根据path解析出反射内容
   * @param {string} path
   */
  parsePath(path) {
    const reflections = this.project.reflections;
    const classInfo = this.findClassByFileName(reflections, path);

    if (classInfo && classInfo.comment) {
      return classInfo.comment.summary.map((item) => item.text).join(' ');
    }
    return null;
  }

  /**
   * 在反射数据中查找指定文件名的类信息
   * @param {Object} reflections 反射数据
   * @param {string} fileName 文件名
   * @returns {Object|null} 类信息
   */
  findClassByFileName(reflections, fileName) {
    for (const key in reflections) {
      const reflection = reflections[key];
      if (reflection.sources) {
        for (const source of reflection.sources) {
          if (source.fileName.includes(fileName)) {
            return reflection;
          }
        }
      }
    }
    return null;
  }
}
