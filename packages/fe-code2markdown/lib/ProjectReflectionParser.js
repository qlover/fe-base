import fsExtra from 'fs-extra';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';
import { DeclarationReflectionParser } from './DeclarationReflectionParser.js';

class ParsedGroup {
  /**
   *
   * @param {import('typedoc').ProjectReflection} project
   * @param {import('@qlover/fe-utils').Logger} logger
   */
  constructor(project, logger) {
    this.project = project;
    this.logger = logger;
    this.drp = new DeclarationReflectionParser(project, logger);
  }

  /**
   * 按照分类分组
   *
   * @param {'groups' | 'categories'} key
   * @param {import('typedoc').ProjectReflection} project
   * @returns {{[key: string]: import('typedoc').DeclarationReflection[]}}
   */
  groupBy(project, key = 'groups') {
    const targetGroups = project[key] || [];
    return targetGroups.reduce((acc, group) => {
      acc[group.title] = group.children;
      return acc;
    }, {});
  }

  /**
   * 解析
   * @returns {Object[]}
   */
  parse() {
    const groups = this.groupBy(this.project, 'groups');
    const finalResult = [];

    Object.entries(groups).forEach(([type, children]) => {
      // 第一层大类，基本是 Enumerations, Classes, Interfaces, Type Aliases, Variables ...
      if (type === 'Classes') {
        children.forEach((classItem) => {
          const result = this.drp.toTemplateResult({ member: classItem, type });
          this.logger.debug(result.type, result.name, result.id);

          const members = [];
          // 第二层， 基本是 Constructors,Properties, Methods ...
          const groupsLevel2 = this.groupBy(classItem, 'groups');
          Object.entries(groupsLevel2).forEach(([v2type, v2children]) => {
            const typeResults = v2children.flatMap((v2member) => {
              return this.drp.classMemberToTemplateResult({
                member: v2member,
                classItem,
                type: v2type
              });
            });

            members.push(...typeResults);
          });

          // 增加 hasMembers 属性，用于模板渲染
          Object.assign(result, { members, hasMembers: members.length > 0 });
          finalResult.push(result);
        });
      }
    });
    return finalResult;
  }
}

export class ProjectReflectionParser {
  /**
   * @param {{entryPoints: string[], outputPath: string, logger: import('@qlover/fe-utils').Logger}} options
   */
  constructor({ entryPoints, outputPath, logger }) {
    this.entryPoints = entryPoints;
    this.outputPath = outputPath;
    this.logger = logger;
  }

  /**
   * 加载项目
   * @param {string} path
   * @returns {import('typedoc').ProjectReflection}
   */
  async load(path) {
    path = path || this.outputPath;

    if (!path) {
      this.logger.wain('Ouput path is empty!');
      return;
    }

    if (!fsExtra.existsSync(path)) {
      return;
    }
    const project = fsExtra.readJSONSync(path);

    const app = await this.getApp();
    const reflections = app.deserializer.reviveProject(project);

    this.project = reflections;

    return this.project;
  }

  /**
   * 写入项目
   * @param {import('typedoc').ProjectReflection} project
   */
  async writeTo(project, path) {
    path = path || this.outputPath;

    if (!path) {
      this.logger.wain('Ouput path is empty!');
      return;
    }

    const app = await this.getApp();

    this.writeJSON(app.serializer.projectToObject(project, './'), path);
    this.logger.info('Generate JSON file success', path);
  }

  writeJSON(value, path) {
    if (!path) {
      this.logger.wain('Ouput path is empty!');
      return;
    }

    // 删除文件
    fsExtra.removeSync(path);

    // 确保文件存在，不存在则创建
    fsExtra.ensureFileSync(path);

    fsExtra.writeFileSync(path, JSON.stringify(value, null, 2), 'utf-8');
  }

  /**
   * 获取应用
   * @returns {Promise<Application>}
   */
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
   * 解析分类
   *
   * 默认按照 `@category`, 应用到 class, type, interface
   * @param {import('typedoc').ProjectReflection} project
   * @returns {Object[]}
   */
  parseWithGroups(project) {
    // 分两种 有分类和others
    // const parsedCategory = new ParsedCategory(project);
    const parsed = new ParsedGroup(project, this.logger);

    return parsed.parse();
  }
}
