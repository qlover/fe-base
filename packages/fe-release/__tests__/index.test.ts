import { describe, beforeEach, it, expect, vi, afterEach } from 'vitest';
import { ReleaseItInstanceType } from '../src/type';
import { Shell } from '@qlover/scripts-context';
import { Logger } from '@qlover/fe-corekit';
import Plugin from '../src/Plugin';
import ReleaseContext from '../src/interface/ReleaseContext';
import { release } from '../src/release';

type MockTestProps = {
  name: string;
  infile: (name: string) => string;
};

vi.mock('./testPlugin.js', () => {
  return {
    default: class extends Plugin<MockTestProps> {
      pluginName = 'test-plugin';

      constructor(context: ReleaseContext, props: MockTestProps) {
        // 可以在这里初始化 context 和 props
        super(context, props);
      }

      async onBefore(): Promise<void> {
        this.logger.info(
          'test-plugin onBefore',
          this.props.infile(this.props.name)
        );
      }
    }
  };
});

describe('index', () => {
  let releaseIt: ReleaseItInstanceType;
  let shell: Shell;
  let logger: Logger;

  beforeEach(() => {
    process.env.NPM_TOKEN = 'mocked_npm_token';
    process.env.GITHUB_TOKEN = 'mocked_github_token';
    releaseIt = vi.fn();
    logger = {
      exec: vi.fn(),
      info: vi.fn(),
      log: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    } as unknown as Logger;

    shell = new Shell({
      execPromise: vi.fn(),
      // @ts-expect-error
      logger
    });
  });

  afterEach(() => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.PAT_TOKEN;
  });

  it('should throw an error if packageJson is not provided', async () => {
    releaseIt = vi.fn().mockReturnValue({
      changelog: 'test',
      version: '1.0.0'
    });

    try {
      await release({ shell, options: { releaseIt, skipCheckPackage: true } });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('package.json is undefined');
    }
  });

  it('should call onBefore when the plugin is loaded', async () => {
    const name = 'testPlugin';
    const infileFunc = vi.fn().mockReturnValue(name);
    const plugins = {
      './testPlugin.js': {
        name: 'testPlugin',
        infile: infileFunc
      }
    };

    await release({
      shell,
      options: {
        releaseIt,
        skipCheckPackage: true,
        packageJson: {
          name: 'test',
          version: '1.0.0'
        }
      },
      dryRun: true,
      feConfig: {
        release: {
          // @ts-expect-error
          plugins
        }
      }
    });

    expect(infileFunc).toHaveBeenCalledWith(name);
  });
});
