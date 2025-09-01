import { type ExecutorContext } from '@qlover/fe-corekit';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SERVER_AUTH_ERROR } from '@config/Identifier';
import { I } from '@config/IOCIdentifier';
import type { BootstrapServerContextValue } from '@/core/bootstraps/BootstrapServer';
import type { AppConfig } from './AppConfig';
import type {
  BootstrapContextValue,
  BootstrapExecutorPlugin
} from '@qlover/corekit-bridge';

export class ServerAuthPlugin implements BootstrapExecutorPlugin {
  pluginName = 'ServerAuthPlugin';

  constructor(protected whitelist: string[] = []) {}

  async onBefore(
    context: ExecutorContext<BootstrapContextValue>
  ): Promise<void> {
    const { parameters } = context;
    const { ioc } = parameters;

    const cookieStore = await cookies();
    const appConfig = ioc.get<AppConfig>(I.AppConfig);

    const token = cookieStore.get(appConfig.userTokenKey);

    if (!token) {
      throw new Error(SERVER_AUTH_ERROR);
    }
  }

  onError(context: ExecutorContext<BootstrapServerContextValue>): void {
    const { parameters, error } = context;
    const { locale } = parameters;
    if (error instanceof Error) {
      const messageId = error.message;
      if (messageId === SERVER_AUTH_ERROR) {
        console.log('jj error', error);
        redirect(`/${locale}/login`);
      }
    }
  }
}
