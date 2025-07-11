import fsExtra from 'fs-extra';
import { join, resolve } from 'path';
import Handlebars from 'handlebars';
import { ReflectionKind } from 'typedoc';
import { ReflectionKindName } from '../type';
import { FormatProjectValue } from '../plugins/typeDocs';
import { ValueOf } from '@qlover/fe-corekit';

export type FormatProjectValueMap = Record<
  ValueOf<typeof ReflectionKindName>,
  FormatProjectValue[]
>;

export class HBSTemplate {
  private templateContent: string;

  constructor({
    name = 'context',
    hbsRootDir,
    hbsHelpers
  }: {
    name?: string;
    hbsRootDir: string;
    hbsHelpers?: Record<string, Handlebars.HelperDelegate>;
  }) {
    const tplFile = name.includes('.hbs') ? name : name + '.hbs';

    // 在使用时 resolve 路径
    const resolvedHbsRootDir = resolve(hbsRootDir);
    this.templateContent = fsExtra.readFileSync(
      join(resolvedHbsRootDir, tplFile),
      'utf-8'
    );

    if (hbsHelpers) {
      Object.entries(hbsHelpers).forEach(([key, value]) => {
        Handlebars.registerHelper(key, value);
      });
    }
  }

  getTemplate(): string {
    return this.templateContent;
  }

  compile(
    context: FormatProjectValue,
    options?: Handlebars.RuntimeOptions
  ): string {
    return Handlebars.compile(this.templateContent)(context, options);
  }

  compileSource(contextMap: FormatProjectValueMap): string {
    const output: string[] = [];
    const types = [
      ReflectionKindName[ReflectionKind.Interface],
      ReflectionKindName[ReflectionKind.TypeAlias],
      ReflectionKindName[ReflectionKind.Class],
      ReflectionKindName[ReflectionKind.Function],
      ReflectionKindName[ReflectionKind.Variable],
      ReflectionKindName[ReflectionKind.Enum]
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
