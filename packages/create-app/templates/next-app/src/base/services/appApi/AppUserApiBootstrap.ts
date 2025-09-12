import { RequestCommonPlugin } from '@qlover/corekit-bridge';
import { FetchURLPlugin } from '@qlover/fe-corekit';
import { DialogErrorPlugin } from '@/base/cases/DialogErrorPlugin';
import { AppApiPlugin } from './AppApiPlugin';
import { AppUserApi } from './AppUserApi';
import type {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '@qlover/corekit-bridge';
import type {
  ExecutorContext,
  RequestAdapterConfig,
  SerializerIneterface
} from '@qlover/fe-corekit';

export class AppUserApiBootstrap implements BootstrapExecutorPlugin {
  readonly pluginName = 'AppUserApiBootstrap';

  constructor(protected serializer: SerializerIneterface) {}

  onBefore({ parameters: { ioc } }: BootstrapContext): void | Promise<void> {
    const appUserApi = ioc.get<AppUserApi>(AppUserApi);

    appUserApi.usePlugin(new FetchURLPlugin());
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
    context: ExecutorContext<RequestAdapterConfig>
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
