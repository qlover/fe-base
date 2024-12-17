import fsExtra from 'fs-extra';
import path from 'path';
import Handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import { ReflectionKind } from 'typedoc';
import {
  HBSTemplateContext,
  HBSTemplateContextMap,
  ReflectionKindName
} from './type';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// FIXME: build 后，hbs 文件夹会跑到 dist 目录下，cjs, es 目录下，需要找到一个更好的解决方案
const rootDir = path.resolve(__dirname, '../../hbs');

export class HBSTemplate {
  private hbsPath: string;
  private templateContent: string;

  constructor(hbsPath: string) {
    this.hbsPath = hbsPath.includes('.hbs') ? hbsPath : hbsPath + '.hbs';

    this.templateContent = fsExtra.readFileSync(
      path.join(rootDir, this.hbsPath),
      'utf-8'
    );
  }

  getTemplate(): string {
    return this.templateContent;
  }

  compile(
    context: HBSTemplateContext,
    options?: Handlebars.RuntimeOptions
  ): string {
    return Handlebars.compile(this.templateContent)(context, options);
  }

  compileSource(contextMap: HBSTemplateContextMap): string {
    const output: string[] = [];
    // class -> interface -> type
    const types = [
      ReflectionKindName[ReflectionKind.Class],
      ReflectionKindName[ReflectionKind.Interface],
      ReflectionKindName[ReflectionKind.TypeAlias]
    ];
    types.forEach((type) => {
      if (contextMap[type as keyof typeof contextMap]) {
        output.push(
          ...contextMap[type as keyof typeof contextMap].map((context) =>
            this.compile(context)
          )
        );
      }
    });

    // other
    Object.entries(contextMap).forEach(([type, contexts]) => {
      // eslint-disable-next-line
      !types.includes(type as (typeof types)[number]) &&
        output.push(...contexts.map((context) => this.compile(context)));
    });

    return output.join('\n');
  }
}
