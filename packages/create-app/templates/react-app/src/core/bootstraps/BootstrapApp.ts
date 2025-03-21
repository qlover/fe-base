import type { BootstrapExecutorPlugin } from '@fe-prod/core/bootstrap';
import { IOCIdentifier } from '../IOC';
import { IOC } from '../IOC';
import { FeApi } from '@/base/apis/feApi/FeApi';
import { FetchAbortPlugin, FetchURLPlugin } from '@qlover/fe-corekit';
import { ApiMockPlugin } from '@/base/cases/apisPlugins/ApiMockPlugin';
import { RequestLogger } from '@/uikit/utils/RequestLogger';
import { ApiCatchPlugin } from '@/base/cases/apisPlugins/ApiCatchPlugin';
import { UserApi } from '@/base/apis/userApi/UserApi';
import { ApiPickDataPlugin } from '@/base/cases/apisPlugins/ApiPickDataPlugin';

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
      .usePlugin(IOC.get(RequestLogger))
      .usePlugin(IOC.get(ApiPickDataPlugin));
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
