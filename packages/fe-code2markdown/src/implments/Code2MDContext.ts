import { FeScriptContextOptions } from '@qlover/scripts-context';
import { ScriptContext } from '../scripts-plugin';
import { ProjectReflection } from 'typedoc';
import { ReaderOutput } from '../plugins/reader';

export interface Code2MDContextOptions<
  T extends Code2MDContextConfig = Code2MDContextConfig
> extends Omit<FeScriptContextOptions<T>, 'constructor'> {}

export interface Code2MDContextConfig {
  entryPoints: string[];
  outputJSONFilePath: string;
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

  readerOutputs?: ReaderOutput[];
}

export default class Code2MDContext extends ScriptContext<Code2MDContextConfig> {}
