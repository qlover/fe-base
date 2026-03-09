import { Text, Button } from '@tarojs/components';
import './index.css';
import { LoginForm } from '@/components/LoginForm';
import { Page } from '@/components/Page';
import {
  PAGE_HOME_GREETING,
  PAGE_HOME_WELCOME
} from '@/config/i18n-identifier/pages.home';
import { pageHomeI18n } from '@/config/i18n-mapping/page.home';
import { I } from '@/config/ioc-identifier';
import { useI18nMapping } from '@/hooks/useI18nMapping';
import { useIOC } from '@/hooks/useIOC';
import { useStore } from '@/hooks/useStore';
import { useTranslation } from '@/hooks/useTranslation';

export default function Index() {
  const authStore = useIOC(I.AuthStore);
  const userService = useIOC(I.UserService);
  const tt = useI18nMapping(pageHomeI18n);
  const { t } = useTranslation();

  const user = useStore(authStore, (s) => s.result);
  const showLoginForm = useStore(authStore, (s) => s.openLoginForm);
  const code = useStore(authStore, (s) => s.code);
  const isAuthenticated = userService.isAuthenticated();
  const displayName = user?.nickname ?? user?.phoneNumber ?? '';

  const handleOpenLogin = () => authStore.setOpenLoginForm(true);
  const handleLogout = async () => {
    await userService.logout();
  };

  return (
    <Page className="index flex flex-col items-center justify-center min-h-screen p-4 bg-primary gap-4">
      <Text className="text-2xl font-semibold text-primary-text">
        {tt.title}
      </Text>

      {isAuthenticated ? (
        <>
          <Text className="text-lg font-semibold text-primary-text">
            {t(PAGE_HOME_GREETING, { name: displayName })}
          </Text>
          {user?.phoneNumber && (
            <Text className="text-sm text-primary-text/80">
              {user.phoneNumber}
            </Text>
          )}
          <Button
            type="default"
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 mt-2"
          >
            退出登录
          </Button>
        </>
      ) : (
        <>
          <Text className="text-lg font-semibold text-primary-text">
            {t(PAGE_HOME_WELCOME)}
            {code ? <Text>code is: {code}</Text> : null}
          </Text>
          <Button
            type="primary"
            onClick={handleOpenLogin}
            className="rounded-lg border-none"
          >
            登录
          </Button>
        </>
      )}

      {showLoginForm && <LoginForm />}
    </Page>
  );
}
