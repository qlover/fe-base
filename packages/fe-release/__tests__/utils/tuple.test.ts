/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { tuple } from '../../src/utils/tuple';
import {
  ScriptContext,
  ScriptPlugin,
  ScriptPluginProps
} from '@qlover/scripts-context';

class TestPlugin extends ScriptPlugin<ScriptContext<any>, ScriptPluginProps> {
  constructor(context: any, option1: string, option2: number) {
    super(context, 'test');
    this.option1 = option1;
    this.option2 = option2;
  }

  public option1: string;
  public option2: number;
}

describe('tuple utils', () => {
  describe('tuple function', () => {
    it('should create tuple with class reference', () => {
      const result = tuple(TestPlugin, 'test', 123);

      expect(result).toEqual([TestPlugin, 'test', 123]);
    });

    it('should create tuple with string path', () => {
      const result = tuple('./path/to/plugin', 'test', 123);

      expect(result).toEqual(['./path/to/plugin', 'test', 123]);
    });

    it('should create tuple with package name', () => {
      const result = tuple('@scope/plugin-name', 'test', 123);

      expect(result).toEqual(['@scope/plugin-name', 'test', 123]);
    });

    it('should work with no arguments', () => {
      class SimplePlugin extends ScriptPlugin<
        ScriptContext<any>,
        ScriptPluginProps
      > {
        constructor(context: any) {
          super(context, 'simple-plugin');
        }
      }

      const result = tuple(SimplePlugin);

      expect(result).toEqual([SimplePlugin]);
    });
  });
});
