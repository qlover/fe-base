import { RequestCommonPlugin } from '@qlover/corekit-bridge';
import { FetchURLPlugin } from '@qlover/fe-corekit';
import { DialogErrorPlugin } from '@/base/cases/DialogErrorPlugin';
import { RequestEncryptPlugin } from '@/base/cases/RequestEncryptPlugin';
import { StringEncryptor } from '@/base/cases/StringEncryptor';
import { AppApiPlugin } from './AppApiPlugin';
import { AppUserApi } from './AppUserApi';
import type { UserApiConfig } from './AppUserType';
import type {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '@qlover/corekit-bridge';
import type { ExecutorContext, SerializerIneterface } from '@qlover/fe-corekit';

export class AppUserApiBootstrap implements BootstrapExecutorPlugin {
  readonly pluginName = 'AppUserApiBootstrap';

  constructor(protected serializer: SerializerIneterface) {}

  onBefore({ parameters: { ioc } }: BootstrapContext): void | Promise<void> {
    const appUserApi = ioc.get<AppUserApi>(AppUserApi);

    appUserApi.usePlugin(new FetchURLPlugin());
    appUserApi.usePlugin(new RequestEncryptPlugin(ioc.get(StringEncryptor)));
    appUserApi.usePlugin(
      new RequestCommonPlugin({
        requestDataSerializer: this.requestDataSerializer.bind(this)
      })
    );
    appUserApi.usePlugin(new AppApiPlugin());
    appUserApi.usePlugin(ioc.get(DialogErrorPlugin));
  }

  protected requestDataSerializer(
    data: unknown,
    context: ExecutorContext<UserApiConfig>
  ): unknown {
    if (data instanceof FormData) {
      return data;
    }

    if (context.parameters?.responseType === 'json') {
      return this.serializer.serialize(data);
    }

    return data;
  }
}
