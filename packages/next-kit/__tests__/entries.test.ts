import { describe, expect, it } from 'vitest';
import {
  NEXT_KIT_COMMON,
  DeleteStatus,
  assertReflectMetadata,
  isNextKitApiSuccess,
  isI18nKey,
  joinI18nKey,
  loginSchema,
  LoginValidator,
  UserRole
} from '../src/common';
import {
  NEXT_KIT_SERVER,
  PasswordEncrypt,
  isApiCorsEnabled,
  createLogger,
  ApiServer
} from '../src/server';
import {
  NEXT_KIT_CLIENT,
  LocalStorage,
  NavigateBridge,
  I18nService,
  RouterService,
  DialogHandler
} from '../src/client';

describe('@qlover/next-kit entries', () => {
  it('exports runtime markers', () => {
    expect(NEXT_KIT_COMMON).toBe('common');
    expect(NEXT_KIT_SERVER).toBe('server');
    expect(NEXT_KIT_CLIENT).toBe('client');
  });
});

describe('@qlover/next-kit/client', () => {
  it('constructs client helpers without IOC decorators', () => {
    const logger = { debug: () => undefined } as never;
    const bridge = new NavigateBridge(logger);
    expect(bridge.getUIBridge()).toBeNull();

    const i18n = new I18nService({
      fallbackLng: 'en',
      supportedLngs: ['en', 'zh']
    });
    expect(i18n.isValidLanguage('zh')).toBe(true);
    expect(i18n.t('missing')).toBe('missing');

    const router = new RouterService(bridge, { homePath: '/home' });
    expect(router.getLocale()).toBe('');

    expect(new LocalStorage()).toBeInstanceOf(LocalStorage);
    expect(new DialogHandler()).toBeInstanceOf(DialogHandler);
  });
});

describe('@qlover/next-kit/common', () => {
  it('exposes shared schema constants', () => {
    expect(DeleteStatus.UNDELETE).toBe(0);
    expect(UserRole.ADMIN).toBe(0);
  });

  it('validates i18n keys', () => {
    expect(isI18nKey('common:save')).toBe(true);
    expect(isI18nKey('bad')).toBe(false);
    expect(joinI18nKey('common', 'a', 'b')).toBe('common:a__b');
  });

  it('guards NextKitApi success payloads', () => {
    expect(
      isNextKitApiSuccess({
        success: true,
        requestId: 'req-1',
        data: { ok: true }
      })
    ).toBe(true);
    expect(isNextKitApiSuccess({ success: false })).toBe(false);
  });

  it('validates login payloads', () => {
    expect(
      loginSchema.safeParse({
        email: 'a@b.com',
        password: 'secret1'
      }).success
    ).toBe(true);

    const validator = new LoginValidator();
    const failed = validator.validate(null);
    expect(failed?.success).toBe(false);
  });

  it('prompts when reflect-metadata is missing', () => {
    const reflect = (
      globalThis as typeof globalThis & {
        Reflect?: { getMetadata?: unknown };
      }
    ).Reflect;
    const original = reflect?.getMetadata;
    if (reflect) {
      delete reflect.getMetadata;
    }

    expect(() => assertReflectMetadata()).toThrow(/reflect-metadata/);

    if (reflect && original !== undefined) {
      reflect.getMetadata = original;
    }
  });
});

describe('@qlover/next-kit/server', () => {
  it('hashes passwords with PasswordEncrypt', () => {
    const encryptor = new PasswordEncrypt();
    expect(encryptor.encrypt('secret')).toMatch(/^[a-f0-9]{32}$/);
  });

  it('detects disabled CORS when origins empty', () => {
    expect(
      isApiCorsEnabled({
        apiCorsAllowedOrigins: [],
        apiCorsAllowedMethods: ['GET']
      })
    ).toBe(false);
  });

  it('requires serverContext on ApiServer by default', () => {
    const logger = createLogger('test', {
      logPrefixTemplate: '[{level}]',
      logLevel: 'error'
    });
    const ioc = Object.assign(
      () => {
        throw new Error('unused');
      },
      { implemention: undefined }
    );

    expect(
      () =>
        new ApiServer({
          name: 'test',
          logger,
          ioc: ioc as never
        })
    ).toThrow(/serverContext/);
  });
});
