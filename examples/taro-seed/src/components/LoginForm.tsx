import { Button, View, Text } from '@tarojs/components';
import { I } from '@/config/ioc-identifier';
import { useIOC } from '@/hooks/useIOC';
import { useStore } from '@/hooks/useStore';
import type { BaseEventOrig, ButtonProps } from '@tarojs/components';

export function LoginForm() {
  const logger = useIOC(I.Logger);
  const authStore = useIOC(I.AuthStore);
  const userService = useIOC(I.UserService);
  const loading = useStore(authStore.getStore(), (s) => s.loading);
  const error = useStore(authStore.getStore(), (s) => s.error);

  const handleGetPhoneNumber = (
    e: BaseEventOrig<ButtonProps.onGetPhoneNumberEventDetail>
  ) => {
    logger.debug('handleGetPhoneNumber', e);

    const detail = e.detail;
    if (detail.errMsg && !detail.code) {
      // 用户拒绝或取消
      if (!/cancel|deny|fail/i.test(detail.errMsg)) {
        logger.warn('getPhoneNumber:', detail.errMsg);
      }
      return;
    }

    if (!detail.code) {
      logger.warn('getPhoneNumber: no code');
      return;
    }

    userService.loginWithCode(detail.code);

    authStore.setOpenLoginForm(false);
  };

  const handleClose = () => {
    authStore.setOpenLoginForm(false);
  };

  return (
    <View className="flex flex-col gap-3 p-4 rounded-lg shadow">
      <Text className="text-base text-primary-text">
        使用微信手机号快捷登录
      </Text>
      <Button
        openType="getPhoneNumber"
        onGetPhoneNumber={handleGetPhoneNumber}
        disabled={loading}
        className="rounded-lg bg-primary text-primary-text border-none"
      >
        {loading ? '登录中…' : '手机号快捷登录'}
      </Button>
      {error != null && (
        <Text className="text-sm text-red-500">
          {error instanceof Error ? error.message : String(error)}
        </Text>
      )}
      <Button
        type="default"
        onClick={handleClose}
        className="rounded-lg border border-primary-border"
      >
        关闭
      </Button>
    </View>
  );
}
