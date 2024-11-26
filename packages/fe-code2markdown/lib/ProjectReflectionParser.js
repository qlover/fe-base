import fsExtra from 'fs-extra';

export class ProjectReflectionParser {
  constructor({ path }) {
    if (typeof path === 'string' && path) {
      this.load(path);
    }
  }

  load(path) {
    this.project = fsExtra.readJSONSync(path);
    return this.project;
  }

  parseClasses() {
    const groupClassess = this.project.groups.find(
      (group) => group.title === 'Classes'
    );

    groupClassess.children.forEach((item) => {
      const classId = item.replace('~reflections~', '');
      const target = this.project.reflections[classId];

      console.log(classId, target.name);
      const targetConstructor = target.children.find(
        (child) => child.name === 'constructor'
      );
      if (targetConstructor) {
        console.log('[constructor]', targetConstructor.id);
      }

      const targetMethods = target.children.filter(
        (child) => child.kind === 'method'
      );
      console.log('[methods]', targetMethods);
    });
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
