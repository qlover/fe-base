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
   * The pathname of the current page
   */
  pathname: string;

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
}
