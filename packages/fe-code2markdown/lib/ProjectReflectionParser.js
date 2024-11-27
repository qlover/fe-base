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
    this.logger.info('Generate JSON file success', this.outputPath);
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

    try {
      result.class = drp.toTemplateResult({
        member: classItem,
        type: 'class'
      });
    } catch (e) {
      this.logger.info('Get classItem Class error', classItem.name);
      this.logger.error(e);
    }

    try {
      // 解析出 class 的成员数据
      result.members = drp.classMembersToTemplateResults(classItem);
    } catch (e) {
      this.logger.info('Get classItem Members error', classItem.name);
      this.logger.error(e);
    }

    return result;
  }
}
