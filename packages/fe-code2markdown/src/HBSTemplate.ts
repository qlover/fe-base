import fsExtra from 'fs-extra';
import { join } from 'path';
import Handlebars from 'handlebars';
import { ReflectionKind } from 'typedoc';
import {
  HBSTemplateContext,
  HBSTemplateContextMap,
  ReflectionKindName
} from './type';

export class HBSTemplate {
  private templateContent: string;

  constructor({
    name = 'context',
    hbsRootDir
  }: {
    name?: string;
    hbsRootDir: string;
  }) {
    const tplFile = name.includes('.hbs') ? name : name + '.hbs';

    this.templateContent = fsExtra.readFileSync(
      join(hbsRootDir, tplFile),
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
