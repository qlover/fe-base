export const IOCIdentifier = Object.freeze({
  JSONSerializer: 'JSONSerializer',
  JSON: 'JSON',
  LoggerInterface: 'LoggerInterface',
  Logger: 'Logger',
  AppConfig: 'AppConfig',
  DialogHandler: 'DialogHandler',
  LocalStorage: 'LocalStorage',
  LocalStorageEncrypt: 'LocalStorageEncrypt',
  CookieStorage: 'CookieStorage',

  /**
   * 环境配置
   */
  EnvConfigInterface: 'EnvConfigInterface',
  /**
   * 交互中心
   */
  InteractionHubInterface: 'InteractionHubInterface',
  /**
   * Antd 静态 API
   */
  AntdStaticApiInterface: 'AntdStaticApiInterface',

  /**
   * 请求捕获器
   *
   * 被 `RequestCatcherInterface<RequestAdapterResponse>` 实现
   */
  RequestCatcherInterface: 'RequestCatcherInterface',
  I18nServiceInterface: 'I18nServiceInterface',
  ProcesserExecutorInterface: 'ProcesserExecutorInterface',
  RouteServiceInterface: 'RouteServiceInterface',
  UserServiceInterface: 'UserServiceInterface',
  I18nKeyErrorPlugin: 'I18nKeyErrorPlugin',
  FeApiToken: 'FeApiToken',
  FeApiCommonPlugin: 'FeApiCommonPlugin',
  ApiMockPlugin: 'ApiMockPlugin',
  ApiCatchPlugin: 'ApiCatchPlugin'
});
