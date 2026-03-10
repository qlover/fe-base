import { useRouter } from '@/contexts/RouterContext';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import type { BrainUserStateInterface } from '@brain-toolkit/brain-user';
import { pageHomeI18n } from '@config/i18n-mapping/page.home';
import { I } from '@config/ioc-identifier';
import { AsyncStoreStatus } from '@qlover/corekit-bridge/store-state';
import { useIOC } from '~hooks/useIOC';
import { useStore } from '~hooks/useStore';
import { logger } from '~impls/globals';

const loginedSelector = (s: BrainUserStateInterface) =>
  !!s.result && !!s.credential && s.status === AsyncStoreStatus.SUCCESS;
export default function HomePage() {
  const tt = useI18nMapping(pageHomeI18n);
  const { navigate } = useRouter();
  const userService = useIOC(I.UserService);
  const userState = useStore(userService.getStore());
  const logined = useStore(userService.getStore(), loginedSelector);

  logger.info('userState', userService, userState);

  return (
    <div
      data-testid="HomePage"
      className="fe:flex fe:min-h-full fe:flex-col fe:p-4 fe:w-full">
      <div className="fe:mb-6">
        <h1 className="fe:text-primary-text fe:text-xl fe:font-semibold fe:tracking-tight">
          {tt.title}
        </h1>
        <p className="fe:text-secondary-text fe:mt-1 fe:text-sm">
          {tt.description}
        </p>
      </div>

      <div className="fe:rounded-lg fe:border fe:border-primary-border fe:bg-primary/50 fe:p-4 fe:mb-6">
        <p className="fe:text-primary-text fe:text-sm">
          {tt.welcome}
          {userState.result ? (
            <span className="fe:font-medium fe:text-brand fe:ml-1">
              {userState.result.email}
            </span>
          ) : null}
        </p>
      </div>

      {!logined && (
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="fe:bg-brand hover:fe:bg-brand-hover focus:fe:ring-brand fe:w-full fe:rounded-lg fe:px-3 fe:py-2.5 fe:text-sm fe:font-medium fe:text-white fe:transition-colors focus:fe:outline-none focus:fe:ring-2 focus:fe:ring-offset-0">
          {tt.linkLogin}
        </button>
      )}
    </div>
  );
}
