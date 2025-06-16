import type Code2MDContext from '../../implments/Code2MDContext';
import {
  Application,
  ProjectReflection,
  TSConfigReader,
  TypeDocReader
} from 'typedoc';
import { ScriptPlugin } from '../../scripts-plugin';
import fsExtra from 'fs-extra';

export default class TypeDocJson extends ScriptPlugin<Code2MDContext> {
  private app?: Application;

  constructor(context: Code2MDContext) {
    super(context, 'TypeDocJson');
  }

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

  override async onBefore(): Promise<void> {
    const app = await this.getApp();
    const project = await app.convert();

    if (!project) {
      throw new Error('Failed to convert project');
    }

    this.context.setConfig({ projectReflection: project });

    await this.writeToFile(project);
  }

  async writeToFile(project: ProjectReflection): Promise<void> {
    const path = this.context.options.outputJSONFilePath;

    if (!path) {
      this.logger.warn('ProjectReader writeTo Ouput path is empty!');
      return;
    }

    const app = await this.getApp();

    this.writeJSON(app.serializer.projectToObject(project, './'), path);
    this.logger.info('Generate JSON file success', path);
  }

  writeJSON(value: unknown, path: string): void {
    if (!path) {
      this.logger.warn('ProjectReader writeJSON Ouput path is empty!');
      return;
    }

    fsExtra.removeSync(path);
    fsExtra.ensureFileSync(path);
    fsExtra.writeFileSync(path, JSON.stringify(value, null, 2), 'utf-8');
  }
}
