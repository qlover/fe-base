import { ReactSeedConfig } from '@/impls/ReactSeedConfig';
import type { ReactSeedConfigInterface } from '@/interfaces/ReactSeedConfigInterface';

describe('ReactSeedConfig', () => {
  let originalEnv: Record<string, unknown>;

  beforeEach(() => {
    // Save original import.meta.env
    originalEnv = { ...import.meta.env };
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original import.meta.env
    Object.assign(import.meta.env, originalEnv);
  });

  describe('constructor', () => {
    it('should create an instance of ReactSeedConfig', () => {
      const config = new ReactSeedConfig();
      expect(config).toBeInstanceOf(ReactSeedConfig);
    });

    it('should implement ReactSeedConfigInterface', () => {
      const config = new ReactSeedConfig();
      expect(config).toHaveProperty('env');
      expect(config).toHaveProperty('name');
      expect(config).toHaveProperty('version');
      expect(config).toHaveProperty('isProduction');
    });
  });

  describe('env property', () => {
    it('should return import.meta.env.MODE value', () => {
      Object.assign(import.meta.env, {
        MODE: 'development',
        VITE_APP_NAME: 'test-app',
        VITE_APP_VERSION: '1.0.0',
        PROD: false
      });

      const config = new ReactSeedConfig();
      expect(config.env).toBe('development');
    });

    it('should return different values for different MODE', () => {
      const modes = ['development', 'production', 'test', 'staging'];

      modes.forEach((mode) => {
        Object.assign(import.meta.env, {
          MODE: mode,
          VITE_APP_NAME: 'test-app',
          VITE_APP_VERSION: '1.0.0',
          PROD: mode === 'production'
        });

        const config = new ReactSeedConfig();
        expect(config.env).toBe(mode);
      });
    });

    it('should be a getter that reads from import.meta.env.MODE', () => {
      Object.assign(import.meta.env, {
        MODE: 'custom-mode',
        VITE_APP_NAME: 'test-app',
        VITE_APP_VERSION: '1.0.0',
        PROD: false
      });

      const config = new ReactSeedConfig();
      expect(config.env).toBe('custom-mode');

      // Change MODE and verify getter reflects the change
      Object.assign(import.meta.env, { MODE: 'updated-mode' });
      expect(config.env).toBe('updated-mode');
    });
  });

  describe('name property', () => {
    it('should return import.meta.env.VITE_APP_NAME value', () => {
      Object.assign(import.meta.env, {
        MODE: 'test',
        VITE_APP_NAME: 'my-app',
        VITE_APP_VERSION: '1.0.0',
        PROD: false
      });

      const config = new ReactSeedConfig();
      expect(config.name).toBe('my-app');
    });

    it('should be readonly', () => {
      Object.assign(import.meta.env, {
        MODE: 'test',
        VITE_APP_NAME: 'test-app',
        VITE_APP_VERSION: '1.0.0',
        PROD: false
      });

      const config = new ReactSeedConfig();
      expectTypeOf(config.name).toEqualTypeOf<Readonly<string>>();
    });

    it('should handle different app names', () => {
      const appNames = ['app1', 'app2', 'my-super-app', 'test'];

      appNames.forEach((appName) => {
        Object.assign(import.meta.env, {
          MODE: 'test',
          VITE_APP_NAME: appName,
          VITE_APP_VERSION: '1.0.0',
          PROD: false
        });

        const config = new ReactSeedConfig();
        expect(config.name).toBe(appName);
      });
    });
  });

  describe('version property', () => {
    it('should return import.meta.env.VITE_APP_VERSION value', () => {
      Object.assign(import.meta.env, {
        MODE: 'test',
        VITE_APP_NAME: 'test-app',
        VITE_APP_VERSION: '2.5.1',
        PROD: false
      });

      const config = new ReactSeedConfig();
      expect(config.version).toBe('2.5.1');
    });

    it('should be readonly', () => {
      Object.assign(import.meta.env, {
        MODE: 'test',
        VITE_APP_NAME: 'test-app',
        VITE_APP_VERSION: '1.0.0',
        PROD: false
      });

      const config = new ReactSeedConfig();
      expectTypeOf(config.version).toEqualTypeOf<Readonly<string>>();
    });

    it('should handle different version formats', () => {
      const versions = ['1.0.0', '2.5.1', '0.1.0-alpha', '10.20.30'];

      versions.forEach((version) => {
        Object.assign(import.meta.env, {
          MODE: 'test',
          VITE_APP_NAME: 'test-app',
          VITE_APP_VERSION: version,
          PROD: false
        });

        const config = new ReactSeedConfig();
        expect(config.version).toBe(version);
      });
    });
  });

  describe('isProduction property', () => {
    it('should return import.meta.env.PROD value', () => {
      Object.assign(import.meta.env, {
        MODE: 'production',
        VITE_APP_NAME: 'test-app',
        VITE_APP_VERSION: '1.0.0',
        PROD: true
      });

      const config = new ReactSeedConfig();
      expect(config.isProduction).toBe(true);
    });

    it('should return false when PROD is false', () => {
      Object.assign(import.meta.env, {
        MODE: 'development',
        VITE_APP_NAME: 'test-app',
        VITE_APP_VERSION: '1.0.0',
        PROD: false
      });

      const config = new ReactSeedConfig();
      expect(config.isProduction).toBe(false);
    });

    it('should be readonly', () => {
      Object.assign(import.meta.env, {
        MODE: 'test',
        VITE_APP_NAME: 'test-app',
        VITE_APP_VERSION: '1.0.0',
        PROD: false
      });

      const config = new ReactSeedConfig();
      expectTypeOf(config.isProduction).toEqualTypeOf<Readonly<boolean>>();
    });

    it('should correctly reflect production vs non-production environments', () => {
      // Test production
      Object.assign(import.meta.env, {
        MODE: 'production',
        VITE_APP_NAME: 'test-app',
        VITE_APP_VERSION: '1.0.0',
        PROD: true
      });

      const prodConfig = new ReactSeedConfig();
      expect(prodConfig.isProduction).toBe(true);

      // Test development
      Object.assign(import.meta.env, {
        MODE: 'development',
        VITE_APP_NAME: 'test-app',
        VITE_APP_VERSION: '1.0.0',
        PROD: false
      });

      const devConfig = new ReactSeedConfig();
      expect(devConfig.isProduction).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should correctly initialize all properties from environment variables', () => {
      Object.assign(import.meta.env, {
        MODE: 'staging',
        VITE_APP_NAME: 'my-staging-app',
        VITE_APP_VERSION: '3.0.0-beta',
        PROD: false
      });

      const config = new ReactSeedConfig();
      expect(config.env).toBe('staging');
      expect(config.name).toBe('my-staging-app');
      expect(config.version).toBe('3.0.0-beta');
      expect(config.isProduction).toBe(false);
    });

    it('should match ReactSeedConfigInterface type', () => {
      Object.assign(import.meta.env, {
        MODE: 'test',
        VITE_APP_NAME: 'test-app',
        VITE_APP_VERSION: '1.0.0',
        PROD: false
      });

      const config = new ReactSeedConfig();
      const interfaceConfig: ReactSeedConfigInterface = config;

      expect(interfaceConfig.env).toBe(config.env);
      expect(interfaceConfig.name).toBe(config.name);
      expect(interfaceConfig.version).toBe(config.version);
      expect(interfaceConfig.isProduction).toBe(config.isProduction);
    });

    it('should handle multiple instances independently', () => {
      Object.assign(import.meta.env, {
        MODE: 'development',
        VITE_APP_NAME: 'app1',
        VITE_APP_VERSION: '1.0.0',
        PROD: false
      });

      const config1 = new ReactSeedConfig();
      expect(config1.name).toBe('app1');

      Object.assign(import.meta.env, {
        MODE: 'production',
        VITE_APP_NAME: 'app2',
        VITE_APP_VERSION: '2.0.0',
        PROD: true
      });

      const config2 = new ReactSeedConfig();
      expect(config2.name).toBe('app2');
      expect(config2.isProduction).toBe(true);

      // config1 should still reflect its original values (for readonly properties)
      // but env getter will reflect current import.meta.env.MODE
      expect(config1.name).toBe('app1'); // readonly, doesn't change
      expect(config1.env).toBe('production'); // getter, reflects current value
    });
  });

  describe('edge cases', () => {
    it('should handle empty string values', () => {
      Object.assign(import.meta.env, {
        MODE: '',
        VITE_APP_NAME: '',
        VITE_APP_VERSION: '',
        PROD: false
      });

      const config = new ReactSeedConfig();
      expect(config.env).toBe('');
      expect(config.name).toBe('');
      expect(config.version).toBe('');
    });

    it('should handle undefined environment variables gracefully', () => {
      // In Vite, these should always be defined, but test edge case
      Object.assign(import.meta.env, {
        MODE: 'test',
        VITE_APP_NAME: undefined as unknown as string,
        VITE_APP_VERSION: undefined as unknown as string,
        PROD: false
      });

      const config = new ReactSeedConfig();
      expect(config.env).toBe('test');
      expect(config.isProduction).toBe(false);
      // name and version might be undefined if env vars are not set
      expect(config.name).toBeDefined();
      expect(config.version).toBeDefined();
    });
  });
});
