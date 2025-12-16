import ReleaseContext, {
  ReleaseContextOptions
} from '../../src/implments/ReleaseContext';
import { defaultFeConfig } from '@qlover/scripts-context';
import { WorkspaceValue } from '../../src/plugins/workspaces/Workspaces';

describe('ReleaseContext', () => {
  const contextName = 'release';
  const defaultWorkspace: WorkspaceValue = {
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
  });
});
