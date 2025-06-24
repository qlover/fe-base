import {
  FeScriptContextOptions,
  ScriptShared,
  ScriptContext
} from '@qlover/scripts-context';
import { ProjectReflection } from 'typedoc';
import { ReaderOutput } from '../plugins/reader';
import { FormatProjectValue } from '../plugins/typeDocs';

export interface Code2MDContextOptions<
  T extends Code2MDContextConfig = Code2MDContextConfig
> extends Omit<FeScriptContextOptions<T>, 'constructor'> {}

export interface Code2MDContextConfig extends ScriptShared {
  entryPoints: string[];

  /**
   * 输出 JSON 文件路径
   */
  outputJSONFilePath: string;

  /**
   * 生成路径
   */
  generatePath: string;
  /**
   * typedoc parse base path
   */
  basePath?: string;
  tplPath: string;

  /**
   * hbs template root dir
   */
  hbsRootDir: string;

  /**
   * Whether to remove the prefix of the entry point
   *
   * @default `false`
   * @since 0.1.0
   */
  removePrefix?: boolean;

  /**
   * typedoc project reflection
   * @private
   */
  projectReflection?: ProjectReflection;

  /**
   * typedoc project reflection
   * @private
   */
  formatProject?: FormatProjectValue[];

  /**
   * reader outputs
   * @private
   */
  readerOutputs?: ReaderOutput[];
}

export default class Code2MDContext extends ScriptContext<Code2MDContextConfig> {
  constructor(options: Code2MDContextOptions) {
    super({
      ...options,
      // @ts-expect-error
      options: {
        ...options.options,
        rootPropName: 'code2md'
      }
    });
  }
}
