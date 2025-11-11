/**
 * BootstrapClient test-suite
 *
 * Coverage:
 * 1. main method       – Bootstrap client main flow tests
 * 2. parameter validation – Input parameter validation tests
 * 3. error handling    – Error handling tests
 * 4. integration       – Bootstrap flow integration tests
 */

import { testIOC } from '@__tests__/__mocks__/testIOC/TestIOC';
import { I, type IOCIdentifierMap } from '@config/IOCIdentifier';
import type { BootstrapClientArgs } from '@/core/bootstraps/BootstrapClient';
import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import type { BootstrapsRegistryInterface } from '@/core/bootstraps/BootstrapsRegistry';
import * as globals from '@/core/globals';
import type {
  BootstrapExecutorPlugin,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import type { ExecutorPlugin } from '@qlover/fe-corekit';

describe('BootstrapClient', () => {
  describe('bootstrap start flow', () => {
    const mockRoot = {
      location: { href: 'http://localhost:3000/en' }
    };

    const testBootstrapPlugin: BootstrapExecutorPlugin = {
      pluginName: 'test-bootstrap-1',
      onExec: vi.fn().mockResolvedValue(undefined)
    };

    it('should bootstrap real strapup flow', async () => {
      // 将 mock 函数提取出来，以便验证是否被调用
      const mockRegister = vi.fn().mockReturnValue([testBootstrapPlugin]);

      class TestBootstrapsRegistry implements BootstrapsRegistryInterface {
        register = mockRegister;
      }

      const args: BootstrapClientArgs = {
        root: mockRoot,
        bootHref: mockRoot.location.href,
        ioc: testIOC,
        RegistryClass: TestBootstrapsRegistry
      };

      const result = await BootstrapClient.main(args);

      expect(result).toEqual(args);
      expect(globals.logger.info).toHaveBeenCalledWith('bootstrap start...');
      expect(testBootstrapPlugin.onExec).toHaveBeenCalled();
      // 验证 register 方法是否被调用
      expect(mockRegister).toHaveBeenCalled();
    });

    it('should handle bootstrap I18nService', async () => {
      // 将 mock 函数提取出来，以便验证是否被调用
      const mockRegister = vi
        .fn()
        .mockImplementationOnce(
          (
            ioc: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
          ) => {
            // TestIocRegister 中已经注册了，无法bind
            return [ioc.get(I.I18nServiceInterface)];
          }
        );

      class TestBootstrapsRegistry implements BootstrapsRegistryInterface {
        register = mockRegister;
      }

      const args: BootstrapClientArgs = {
        root: mockRoot,
        bootHref: mockRoot.location.href,
        ioc: testIOC,
        RegistryClass: TestBootstrapsRegistry
      };

      await BootstrapClient.main(args);

      const ioc = testIOC.getIoc();
      expect(mockRegister).toBeCalled();
      expect(ioc).toBeDefined();

      const i18nService = ioc!.get(I.I18nServiceInterface);
      expect(i18nService).toBeDefined();
      // @ts-ignore
      expect(i18nService.pathname).toBe(args.bootHref);

      // mock i18n set language to en
      i18nService.emit({ ...i18nService.state, language: 'en' });

      expect(i18nService.state.language).toBe('en');
    });

    it('should handle bootstrap UserApiBootstarp', async () => {
      const mockUserService: ExecutorPlugin = {
        pluginName: 'TestUserService',
        onBefore: vi.fn().mockResolvedValue(undefined)
      };
      // 将 mock 函数提取出来，以便验证是否被调用
      const mockRegister = vi
        .fn()
        .mockImplementationOnce(
          (
            ioc: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
          ) => {
            return [ioc.get(I.UserServiceInterface)];
          }
        );

      class TestBootstrapsRegistry implements BootstrapsRegistryInterface {
        register = mockRegister;
      }

      const args: BootstrapClientArgs = {
        root: mockRoot,
        bootHref: mockRoot.location.href,
        ioc: testIOC,
        iocRegister: {
          register: vi
            .fn()
            .mockImplementationOnce(
              (
                ioc: IOCFunctionInterface<
                  IOCIdentifierMap,
                  IOCContainerInterface
                >
              ) => {
                ioc.bind(I.UserServiceInterface, mockUserService as any);
              }
            )
        },
        RegistryClass: TestBootstrapsRegistry
      };

      await BootstrapClient.main(args);
      const ioc = testIOC.getIoc();
      expect(ioc).toBeDefined();

      const userService = ioc!.get(I.UserServiceInterface);

      expect(userService).toBeDefined();
      expect(userService).toEqual(mockUserService);
      expect(userService.pluginName).toBe('TestUserService');
      expect(userService.onBefore).toBeCalled();
    });
  });
});
