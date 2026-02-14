import type {
  EnvConfigInterface,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

/**
 * IOC register options
 */
export type IocRegisterOptions = {
  /**
   * The app config
   */
  appConfig: EnvConfigInterface;
};

export interface IOCInterface<
  IdentifierMap,
  IOCContainer extends IOCContainerInterface
> {
  create(
    options: IocRegisterOptions
  ): IOCFunctionInterface<IdentifierMap, IOCContainer>;

  /**
   * 该方法主要用于在应用启动前注册所有依赖
   *
   * 因为ssr渲染的原因可能需要在一些特定的环境下注册一些依赖
   *
   * @param options - 注册选项
   */
  register(options?: IocRegisterOptions): void;
}
