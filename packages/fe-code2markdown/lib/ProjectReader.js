import fsExtra from 'fs-extra';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';

export class ProjectReader {
  /**
   * @param {import('../index.d.ts').ReflectionGeneraterContext} context
   */
  constructor(context) {
    this.context = context;
  }

  get logger() {
    return this.context.logger;
  }

  /**
   * 加载项目
   * @param {string} path
   * @returns {import('typedoc').ProjectReflection}
   */
  async load(path) {
    path = path || this.context.options.outputJSONFilePath;

    if (!path) {
      this.logger.warn('Ouput path is empty!');
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
      this.logger.warn('Ouput path is empty!');
      return;
    }

    const app = await this.getApp();

    this.writeJSON(app.serializer.projectToObject(project, './'), path);
    this.logger.info('Generate JSON file success', path);
  }

  writeJSON(value, path) {
    if (!path) {
      this.logger.warn('Ouput path is empty!');
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
        entryPoints: this.context.options.entryPoints,
        skipErrorChecking: true
      },
      [new TSConfigReader(), new TypeDocReader()]
    );

    this.app = app;
    return app;
  }
}
