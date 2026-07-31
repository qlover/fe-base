import { NavigateBridge as KitNavigateBridge } from '@qlover/next-kit/client';
import type { useRouter } from '@/i18n/routing';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type { LoggerInterface } from '@qlover/logger';

type AppRouterInstance = ReturnType<typeof useRouter>;

@injectable()
export class NavigateBridge extends KitNavigateBridge<AppRouterInstance> {
  constructor(@inject(I.Logger) logger: LoggerInterface) {
    super(logger);
  }
}
