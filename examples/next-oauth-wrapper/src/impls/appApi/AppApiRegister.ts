import {
  Base64Serializer,
  RequestPlugin,
  ResponsePlugin
} from '@qlover/fe-corekit';
import { DialogErrorPlugin } from '@/impls/DialogErrorPlugin';
import { RequestEncryptPlugin } from '@/impls/RequestEncryptPlugin';
import { StringEncryptor } from '@shared/StringEncryptor';
import { I } from '@config/ioc-identifiter';
import type { SeedSrcConfigInterface } from '@interfaces/SeedConfigInterface';
import { AppApiPlugin } from './AppApiPlugin';
import { AppApiRequester } from './AppApiRequester';
import type { AppApiConfig } from './AppApiRequester';
import type {
  IOCContainerInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge';
import type { SerializerIneterface } from '@qlover/fe-corekit';

export class AppApiRegister implements IOCRegisterInterface<IOCContainerInterface> {
  constructor(protected serializer: SerializerIneterface) {}

  /**
   * @override
   */
  public register(ioc: IOCContainerInterface): void {
    const appUserApi = ioc.get<AppApiRequester>(AppApiRequester);
    const appConfig = ioc.get<SeedSrcConfigInterface>(I.AppConfig);

    // 数据加密优先于 RequestPlugin(会序列化数据)
    appUserApi.use(
      new RequestEncryptPlugin(
        new StringEncryptor(
          appConfig.stringEncryptorKey,
          new Base64Serializer()
        )
      )
    );
    appUserApi.use(
      new RequestPlugin({
        requestDataSerializer: this.requestDataSerializer.bind(this)
      })
    );
    appUserApi.use(new ResponsePlugin());
    appUserApi.use(new AppApiPlugin(ioc.get(I.Logger)));
    appUserApi.use(ioc.get(DialogErrorPlugin));
  }

  protected requestDataSerializer(
    data: unknown,
    config: AppApiConfig
  ): unknown {
    if (data instanceof FormData) {
      return data;
    }

    if (config.responseType === 'json') {
      return this.serializer.serialize(data);
    }

    return data;
  }
}
