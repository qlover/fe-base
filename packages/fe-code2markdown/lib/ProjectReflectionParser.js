import fsExtra from 'fs-extra';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';
import { DeclarationReflectionParser } from './DeclarationReflectionParser.js';

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
    this.logger.info('Generate JSON file success', this.outputPath);
  }

  /**
   * 获取应用
   * @returns {import('typedoc').Application}
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
   * 获取类
   * @param {import('typedoc').ProjectReflection} project
   * @returns {import('typedoc').DeclarationReflection[]}
   */
  getClassess(project) {
    return project.groups
      .filter((group) => group.title === 'Classes')
      .map((group) => group.children)
      .flat();
  }

  /**
   * 解析二级子项
   * @param {import('typedoc').DeclarationReflection} rootChild
   * @param {import('typedoc').ReflectionGroup} group
   * @param {DeclarationReflectionParser} drp
   * @returns {Object[]}
   */
  parseLevel2Children(rootChild, group, drp) {
    const level2Children = [];
    group.children.forEach((child) => {
      const templateResults = drp.classMembersToTemplateResults(
        child,
        rootChild
      );
      level2Children.push(...templateResults);
    });
    return level2Children;
  }

  /**
   * 解析类模板数据
   * @param {import('typedoc').ProjectReflection} project
   * @returns {Object[]}
   */
  parseWithGroups(project) {
    const drp = new DeclarationReflectionParser(project);

    const resultFinal = [];

    project.groups.forEach((group) => {
      // 第一层
      for (const rootChild of group.children) {
        const result = drp.toTemplateResult({
          member: rootChild,
          type: group.title.toLowerCase()
        });

        // 如果 rootChild 是 `type`
        if (rootChild.type && rootChild.type.type === 'reflection') {
          this.logger.info(
            'type:',
            rootChild.id,
            rootChild.name,
            rootChild.type
          );
          const level2Children = this.parseLevel2Children(
            rootChild.type.declaration,
            group,
            drp
          );
          result.members = level2Children;
        }

        // 如果存在 children
        else if (
          Array.isArray(rootChild.children) &&
          rootChild.children.length
        ) {
          this.logger.info(
            'children:',
            rootChild.id,
            rootChild.name,
            rootChild.children.map((child) => child.name)
          );
          // 第二层
          const level2Children = this.parseLevel2Children(
            rootChild,
            group,
            drp
          );
          result.members = level2Children;
        }

        result.hasMembers = result.members && result.members.length > 0;
        resultFinal.push(result);
      }
    });

    return resultFinal;
  }
}
