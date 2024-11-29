import fsExtra from 'fs-extra';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';
import {
  DeclarationReflectionParser,
  ReflectionKindName
} from './DeclarationReflectionParser.js';

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
   * 解析 class 的 children
   * @param {import('typedoc').DeclarationReflection} reflection
   * @returns {Object[]}
   */
  parseClassItems(classItem) {
    const finalResult = [];
    const result = this.drp.toTemplateResult({
      member: classItem,
      kind: classItem.kind
    });

    this.logger.debug(result.kindName, result.name, result.id);

    const members = [];
    // 第二层， 基本是 Constructors,Properties, Methods ...
    const groupsLevel2 = this.groupBy(classItem, 'groups');
    Object.entries(groupsLevel2).forEach(([v2KindName, v2children]) => {
      const typeResults = v2children.flatMap((v2member) => {
        return this.drp.classMemberToTemplateResult({
          member: v2member,
          classItem,
          groupKindName: v2KindName
        });
      });

      members.push(...typeResults);
    });

    // 增加 hasMembers 属性，用于模板渲染
    Object.assign(result, { members, hasMembers: members.length > 0 });
    finalResult.push(result);

    return finalResult;
  }

  /**
   * 按 source 分组, 文件路径
   * @returns {Map<string, {[key in ReflectionKind]: import('typedoc').DeclarationReflection[]}>}
   */
  parseWithSource() {
    /**
     * @type {Map<string, {[key in ReflectionKind]: import('typedoc').DeclarationReflection[]}>}
     */
    const sourceMaps = new Map();

    for (const child of this.project.children) {
      try {
        const fullFileName =
          this.drp.getRealSource(child).fullFileName ||
          child.sources[0].fileName;

        if (!sourceMaps.has(fullFileName)) {
          sourceMaps.set(fullFileName, {});
        }

        const values = sourceMaps.get(fullFileName);

        if (!values[child.kind]) {
          values[child.kind] = [];
        }

        values[child.kind].push(...this.parseClassItems(child));
      } catch {
        this.logger.error('No sources for class', child.name);
      }
    }

    return sourceMaps;
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
   * 按 source 分组, 文件路径
   *
   * @param {import('typedoc').ProjectReflection} project
   * @returns {import('../index.d.ts').ParserContextMap}
   */
  parseWithSources(project) {
    const parsed = new ParsedGroup(project, this.logger);

    const sourceMaps = parsed.parseWithSource();

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
}
