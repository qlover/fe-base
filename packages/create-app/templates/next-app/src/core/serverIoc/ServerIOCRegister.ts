import {
  ConsoleHandler,
  Logger,
  TimestampFormatter,
  type IOCContainerInterface,
  type IOCManagerInterface,
  type IOCRegisterInterface
} from '@qlover/corekit-bridge';
import type { IocRegisterOptions } from '@/base/port/IOCInterface';
import { SupabaseBridge } from '@/server/sqlBridges/SupabaseBridge';
import { IOCIdentifier as I } from '@config/IOCIdentifier';

export class ServerIOCRegister
  implements IOCRegisterInterface<IOCContainerInterface, IocRegisterOptions>
{
  constructor(protected options: IocRegisterOptions) {}

  /**
   * Register globals
   *
   * 一般用于注册全局
   *
   * @param ioc - IOC container
   */
  protected registerGlobals(ioc: IOCContainerInterface): void {
    const { appConfig } = this.options;
    ioc.bind(I.AppConfig, appConfig);
    ioc.bind(
      I.Logger,
      new Logger({
        handlers: new ConsoleHandler(
          new TimestampFormatter({
            localeOptions: {
              year: '2-digit',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }
          })
        ),
        silent: false,
        level: appConfig.env === 'development' ? 'debug' : 'info'
      })
    );
  }

  protected registerImplement(ioc: IOCContainerInterface): void {
    ioc.bind(I.DBBridgeInterface, ioc.get(SupabaseBridge));
  }

  protected registerCommon(_ioc: IOCContainerInterface): void {}

  /**
   * @override
   */
  register(
    ioc: IOCContainerInterface,
    _manager: IOCManagerInterface<IOCContainerInterface>
  ): void {
    this.registerGlobals(ioc);
    this.registerCommon(ioc);
    this.registerImplement(ioc);
  }
}
