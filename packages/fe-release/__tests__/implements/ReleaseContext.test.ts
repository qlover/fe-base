import ReleaseContext, {
  type ReleaseContextOptions
} from '../../src/implments/ReleaseContext';
import { defaultFeConfig } from '@qlover/scripts-context';
import type { WorkspaceInterface } from '../../src/interface/WorkspaceInterface';

describe('ReleaseContext', () => {
  const contextName = 'release';
  const defaultWorkspace: WorkspaceInterface = {
    name: 'test-package-name',
    version: '99.1020-test',
    path: 'test-package-path',
    root: 'test-package-root',
    packageJson: {
      name: 'test-package-name',
      version: '99.1020-test'
    }
  };
  let contextOptions: ReleaseContextOptions;

  beforeEach(() => {
    vi.clearAllMocks();

    contextOptions = {
      dryRun: false,
      verbose: false,
      feConfig: defaultFeConfig,
      logger: {
        log: vi.fn(),
        fatal: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
        trace: vi.fn(),
        addAppender: vi.fn(),
        context: vi.fn()
      },
      shell: {
        exec: vi.fn()
      },
      options: {
        workspaces: {
          workspace: defaultWorkspace
        }
      }
    };
  });

  describe('constructor', () => {
    it('should correctly initialize ReleaseContext instance', async () => {
      const context = new ReleaseContext(contextName, contextOptions);
      expect(context).toBeInstanceOf(ReleaseContext);
    });

    it('should create a unique releaseId on initialization', () => {
      const context = new ReleaseContext(contextName, contextOptions);

      expect(context.releaseId).toMatch(/^[a-f0-9]{16}$/);
    });

    it('should always generate releaseId internally', () => {
      const context = new ReleaseContext(contextName, {
        ...contextOptions,
        options: {
          ...contextOptions.options,
          releaseId: 'custom-id'
        }
      });

      expect(context.releaseId).toMatch(/^[a-f0-9]{16}$/);
      expect(context.releaseId).not.toBe('custom-id');
    });
  });
});
