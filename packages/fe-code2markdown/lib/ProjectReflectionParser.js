import fsExtra from 'fs-extra';
import { Application, TSConfigReader, TypeDocReader } from 'typedoc';
import Handlebars from 'handlebars';
import lodash from 'lodash';

const { groupBy } = lodash;
export class ProjectReflectionParser {
  constructor({ entryPoints, outputPath }) {
    this.entryPoints = entryPoints;
    this.outputPath = outputPath;
  }

  async load(path) {
    const project = fsExtra.readJSONSync(path || this.outputPath);

    const app = await this.getApp();
    const reflections = app.deserializer.reviveProject(project);

    this.project = reflections;

    return this.project;
  }

  async writeTo(project) {
    const app = await this.getApp();
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
  async parseClasses(project) {
    project = project || this.project;
    if (!project) {
      return;
    }

    const groupClassess = project.groups.find(
      (group) => group.title === 'Classes'
    );

    // console.log('[groupClassess]', groupClassess);

    const result = this.parseClass(groupClassess.children[0]);

    console.log(result);

    // groupClassess.children.forEach((item) => {
    //   this.parseClass(item);
    // });
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
   * 处理参数类型
   * @param {import('typedoc').Type} type
   */
  padParamType(type, name) {
    name = name || type.name || '';
    const fx = type.typeArguments
      ? `<${type.typeArguments.map((item) => item.name).join(',')}>`
      : '';
    return name + fx;
  }

  /**
   *
   * @param {import('typedoc').DeclarationReflection} classItem
   */
  parseClass(classItem) {
    // 读取模板文件
    const templateContent = fsExtra.readFileSync('./hbs/class.hbs', 'utf-8');

    // 编译模板
    const template = Handlebars.compile(templateContent);

    const groupByBlocksTags = groupBy(classItem.comment.blockTags, 'tag');

    // TODO: 目前只支持一个构造函数
    const classConstructor = [];

    classItem.children
      .find((item) => item.name === 'constructor')
      ?.signatures?.forEach((signature) => {
        signature.parameters.forEach((param) => {
          const tableList = [];
          // 如果是一个引用类型？
          if (param.type?.declaration.children) {
            param.type?.declaration.children.forEach((child) => {
              const blockTags = child.comment.blockTags;
              const summaryList = child.comment.summary.map(
                (item) => item.text
              );
              const description = this.getOneBlockTags(
                blockTags,
                '@description'
              );

              tableList.push({
                name: param.name + '.' + child.name,
                type: this.padParamType(child.type, child.type?.name),
                defaultValue: this.getOneBlockTags(blockTags, '@default'),
                description: [...summaryList, description],
                since: this.getOneBlockTags(blockTags, '@since'),
                deprecated:
                  this.getOneBlockTags(blockTags, '@deprecated') !== null
              });
            });
          } else {
            const blockTags = param.comment.blockTags;
            const summaryList = param.comment.summary.map((item) => item.text);
            const description = this.getOneBlockTags(blockTags, '@description');

            tableList.push({
              name: param.name,
              type: this.padParamType(param.type),
              defaultValue: this.getOneBlockTags(blockTags, '@default'),
              description: [...summaryList, description],
              since: this.getOneBlockTags(blockTags, '@since'),
              deprecated:
                this.getOneBlockTags(blockTags, '@deprecated') !== null
            });
          }

          classConstructor.push({
            name: classItem.name + '.' + param.name,
            parametersList: tableList
          });
        });
      });

    const result = template({
      name: classItem.name,
      summaryList: classItem.comment.summary,
      descriptionList: groupByBlocksTags['@description'].map(
        (item) => item.content
      ),
      exampleList: groupByBlocksTags['@example']
        .map((item) => item.content)
        .flat()
        .map((item) => ({
          isCode: item.kind === 'code',
          text: item.text,
          kind: item.kind
        })),
      classConstructor: classConstructor
    });
    console.log(classConstructor);

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
