import fsExtra from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import { ReflectionKindName } from './TypeDocConverter.js';
import { ReflectionKind } from 'typedoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../hbs');

export class HBSTemplate {
  constructor(hbsPath) {
    this.hbsPath = hbsPath.includes('.hbs') ? hbsPath : hbsPath + '.hbs';

    this.templateContent = fsExtra.readFileSync(
      path.join(rootDir, this.hbsPath),
      'utf-8'
    );
  }

  getTemplate() {
    return this.templateContent;
  }

  /**
   * @param {import('../index.d.ts').HBSTemplateContext} context
   * @param {object} options
   * @returns {string}
   */
  compile(context, options) {
    return Handlebars.compile(this.templateContent)(context, options);
  }

  /**
   * @param {import('../index.d.ts').HBSTemplateContextMap} contextMap
   */
  compileSource(contextMap) {
    const output = [];
    // class -> interface -> type
    const types = [
      ReflectionKindName[ReflectionKind.Class],
      ReflectionKindName[ReflectionKind.Interface],
      ReflectionKindName[ReflectionKind.Type]
    ];
    types.forEach((type) => {
      contextMap[type] &&
        output.push(
          ...contextMap[type].map((context) => this.compile(context))
        );
    });

    // other
    Object.entries(contextMap).forEach(([type, contexts]) => {
      !types.includes(type) &&
        output.push(...contexts.map((context) => this.compile(context)));
    });

    return output.join('\n');
  }
}
