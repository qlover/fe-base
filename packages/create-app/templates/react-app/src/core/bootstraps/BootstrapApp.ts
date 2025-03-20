import { BootstrapExecutorPlugin } from '@lib/bootstrap';
import { IOCIdentifier } from '../IOC';
import { IOC } from '../IOC';
import { FeApi } from '@/base/apis/feApi/FeApi';
import { FetchAbortPlugin, FetchURLPlugin } from '@qlover/fe-utils';
import { ApiMockPlugin } from '@/base/cases/apisPlugins/ApiMockPlugin';
import { RequestLogger } from '@/uikit/utils/RequestLogger';
import { ApiCatchPlugin } from '@/base/cases/apisPlugins/ApiCatchPlugin';
import { UserApi } from '@/base/apis/userApi/UserApi';

export class BootstrapApp implements BootstrapExecutorPlugin {
  readonly pluginName = 'BootstrapApp';

  onBefore(): void {
    this.useFeApiPlugins();
    this.useUserApiPlugins();
  }

  useFeApiPlugins(): void {
    IOC.get(FeApi)
      .usePlugin(new FetchURLPlugin())
      .usePlugin(IOC.get(IOCIdentifier.FeApiCommonPlugin))
      .usePlugin(IOC.get(ApiMockPlugin))
      .usePlugin(IOC.get(RequestLogger))
      .usePlugin(IOC.get(FetchAbortPlugin))
      .usePlugin(IOC.get(ApiCatchPlugin));
  }

  useUserApiPlugins(): void {
    IOC.get(UserApi)
      .usePlugin(new FetchURLPlugin())
      .usePlugin(IOC.get(IOCIdentifier.FeApiCommonPlugin))
      .usePlugin(IOC.get(ApiMockPlugin))
      .usePlugin(IOC.get(RequestLogger))
      .usePlugin(IOC.get(FetchAbortPlugin))
      .usePlugin(IOC.get(ApiCatchPlugin));
  }
}
