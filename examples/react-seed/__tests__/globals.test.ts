import * as globals from '@/globals';
import { name, version } from '../package.json';
import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type { IOCIdentifierMap } from '@config/ioc-identifier';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge/ioc';
import type { Logger, LoggerInterface, LoggerOptions } from '@qlover/logger';

describe('globals.ts', () => {
  describe('成员测试', () => {
    it('should export the expected globals', () => {
      expect(globals).toHaveProperty('seedConfig');
      expect(globals).toHaveProperty('logger');
      expect(globals).toHaveProperty('containerImpl');
      expect(globals).toHaveProperty('IOC');
    });

    it('应该是正确的类型', () => {
      expectTypeOf(globals.seedConfig).toEqualTypeOf<SeedConfigInterface>();
      expectTypeOf(globals.logger).toEqualTypeOf<LoggerInterface>();
      expectTypeOf(
        globals.containerImpl
      ).toEqualTypeOf<IOCContainerInterface>();
      expectTypeOf(globals.IOC).toEqualTypeOf<
        IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
      >();
      expectTypeOf(
        globals.IOC.implemention!
      ).toEqualTypeOf<IOCContainerInterface>();
    });
  });

  describe('seedConfig 测试', () => {
    it('应该具有正确的只读属性', () => {
      // 测试属性存在性
      expect(globals.seedConfig).toHaveProperty('env');
      expect(globals.seedConfig).toHaveProperty('name');
      expect(globals.seedConfig).toHaveProperty('version');
      expect(globals.seedConfig).toHaveProperty('isProduction');

      // 测试属性类型
      expect(typeof globals.seedConfig.env).toBe('string');
      expect(typeof globals.seedConfig.name).toBe('string');
      expect(typeof globals.seedConfig.version).toBe('string');
      expect(typeof globals.seedConfig.isProduction).toBe('boolean');
    });

    it('环境相关属性应该符合预期', () => {
      expect(globals.seedConfig.env).toBe('test');
      expect(globals.seedConfig.isProduction).toBe(false);
    });

    it('应用信息应该匹配 package.json', () => {
      expect(globals.seedConfig.name).toBe(name);
      expect(globals.seedConfig.version).toBe(version);
    });

    it('属性应该是只读的', () => {
      // 尝试修改只读属性应该失败
      expect(() => {
        // @ts-expect-error - 测试只读属性
        globals.seedConfig.env = 'modified';
      }).toThrow();
    });
  });

  describe('logger 测试', () => {
    it('应该具有 Logger 接口的所有方法', () => {
      expect(globals.logger).toHaveProperty('debug');
      expect(globals.logger).toHaveProperty('info');
      expect(globals.logger).toHaveProperty('warn');
      expect(globals.logger).toHaveProperty('error');
      expect(globals.logger).toHaveProperty('fatal');

      // 测试方法类型
      expect(typeof globals.logger.debug).toBe('function');
      expect(typeof globals.logger.info).toBe('function');
      expect(typeof globals.logger.warn).toBe('function');
      expect(typeof globals.logger.error).toBe('function');
      expect(typeof globals.logger.fatal).toBe('function');
    });

    it('应该具有正确的配置属性', () => {
      const options = (globals.logger as Logger)[
        'options'
      ] as LoggerOptions<unknown>;
      expect(options['name']).toBe(name);
      expect(options['silent']).toBe(false);
      expect(options['level']).toBe('debug');
    });

    it('应该能够正常记录日志', () => {
      // 测试基本的日志方法调用
      expect(() => globals.logger.debug('test debug message')).not.toThrow();
      expect(() => globals.logger.info('test info message')).not.toThrow();
      expect(() => globals.logger.warn('test warn message')).not.toThrow();
      expect(() => globals.logger.error('test error message')).not.toThrow();
    });
  });

  describe('containerImpl 测试', () => {
    it('应该实现 IOCContainerInterface 接口', () => {
      expect(globals.containerImpl).toHaveProperty('bind');
      expect(globals.containerImpl).toHaveProperty('get');
      expect(globals.containerImpl).toHaveProperty('bindFactory');
      expect(globals.containerImpl).toHaveProperty('reset');

      // 测试方法类型
      expect(typeof globals.containerImpl.bind).toBe('function');
      expect(typeof globals.containerImpl.get).toBe('function');
    });

    it('应该能够绑定和获取服务', () => {
      // 创建测试服务
      class TestService {
        public getValue(): string {
          return 'test value';
        }
      }

      const testIdentifier = 'TestService';

      // 绑定服务
      expect(() => {
        globals.containerImpl.bind(testIdentifier, TestService);
      }).not.toThrow();

      // 获取服务实例
      const instance = globals.containerImpl.get<TestService>(testIdentifier);
      expect(instance).toBeDefined();
      expect(instance.getValue()).toBe('test value');
    });
  });

  describe('IOC 测试', () => {
    it('应该具有正确的函数接口', () => {
      expect(typeof globals.IOC).toBe('function');
      expect(globals.IOC).toHaveProperty('implemention');
      expect(globals.IOC).toHaveProperty('get');
      expect(globals.IOC).toHaveProperty('bind');
    });

    it('implemention 属性应该指向正确的容器实例', () => {
      expect(globals.IOC.implemention).toBe(globals.containerImpl);
    });

    it('应该能够通过 IOC 函数获取服务', () => {
      // 绑定测试服务
      class TestIOCService {
        public getMessage(): string {
          return 'IOC test message';
        }
      }

      const serviceIdentifier = 'TestIOCService';
      globals.containerImpl.bind(serviceIdentifier, TestIOCService);

      // 通过 IOC 函数获取
      const serviceInstance = globals.IOC<TestIOCService>(serviceIdentifier);
      expect(serviceInstance.getMessage()).toBe('IOC test message');
    });

    it('应该支持泛型类型推断', () => {
      interface TestInterface {
        id: number;
        name: string;
      }

      const testValue: TestInterface = { id: 1, name: 'test' };
      const identifier = 'TestInterfaceService';

      globals.containerImpl.bind(identifier, testValue);

      // 类型推断应该工作正常
      const result = globals.IOC<TestInterface>(identifier);
      expect(result.id).toBe(1);
      expect(result.name).toBe('test');
    });
  });

  describe('集成测试', () => {
    it('所有组件应该能够协同工作', () => {
      // 创建一个需要 logger 依赖的服务
      class ServiceWithLogger {
        constructor(private logger: LoggerInterface) {}

        public logMessage(message: string): string {
          this.logger.info(message);
          return `logged: ${message}`;
        }
      }

      // 绑定服务
      globals.containerImpl.bind(
        'ServiceWithLogger',
        new ServiceWithLogger(globals.logger)
      );

      // 获取服务实例（应该自动注入 logger）
      const service = globals.IOC<ServiceWithLogger>('ServiceWithLogger');

      // 测试服务功能
      const result = service.logMessage('integration test');
      expect(result).toBe('logged: integration test');
    });

    it('应该能够在不同模块间共享状态', () => {
      // 测试容器状态的持久性
      const sharedData = { counter: 0 };
      const identifier = 'SharedDataService';

      globals.containerImpl.bind(identifier, sharedData);

      // 从不同地方获取应该得到相同的实例
      const data1 = globals.IOC<{ counter: number }>(identifier);
      const data2 = globals.containerImpl.get<{ counter: number }>(identifier);

      expect(data1).toBe(data2);
      expect(data1.counter).toBe(0);

      // 修改一个引用应该影响另一个
      data1.counter = 5;
      expect(data2.counter).toBe(5);
    });
  });

  describe('边界情况测试', () => {
    it('获取不存在的服务应该抛出错误', () => {
      expect(() => {
        globals.containerImpl.get('NonExistentService');
      }).toThrow();
    });

    it('重复绑定相同标识符应该覆盖之前的绑定', () => {
      const identifier = 'DuplicateService';

      globals.containerImpl.bind(identifier, { version: 1 });
      const instance1 = globals.containerImpl.get<{ version: number }>(
        identifier
      );
      expect(instance1.version).toBe(1);

      globals.containerImpl.bind(identifier, { version: 2 });
      const instance2 = globals.containerImpl.get<{ version: number }>(
        identifier
      );
      expect(instance2.version).toBe(2);
    });

    it('logger 在生产环境下的行为', () => {
      // 虽然当前是测试环境，但可以测试 silent 属性
      expect((globals.logger as Logger)['options'].silent).toBe(false);
    });
  });
});
