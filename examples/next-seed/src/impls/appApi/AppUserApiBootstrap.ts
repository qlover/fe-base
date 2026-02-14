import { RequestPlugin, ResponsePlugin } from '@qlover/fe-corekit';
import { DialogErrorPlugin } from '@/impls/DialogErrorPlugin';
import { RequestEncryptPlugin } from '@/impls/RequestEncryptPlugin';
import { StringEncryptor } from '@/impls/StringEncryptor';
import { I } from '@shared/config/ioc-identifiter';
import { AppApiPlugin } from './AppApiPlugin';
import { AppApiRequester } from '../AppApiRequester';
import type { AppApiConfig } from '../AppApiRequester';
import type {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '@qlover/corekit-bridge';
import type { SerializerIneterface } from '@qlover/fe-corekit';

export class AppUserApiBootstrap implements BootstrapExecutorPlugin {
  public readonly pluginName = 'AppUserApiBootstrap';

  constructor(protected serializer: SerializerIneterface) {}

  /**
   * @override
   */
  public onBefore({ parameters: { ioc } }: BootstrapContext): void {
    const appUserApi = ioc.get<AppApiRequester>(AppApiRequester);

    // 数据加密优先于 RequestPlugin(会序列化数据)
    appUserApi.use(new RequestEncryptPlugin(ioc.get(StringEncryptor)));
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
