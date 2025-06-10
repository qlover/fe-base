import { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { IOC } from '@/core/IOC';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { RouteService } from '@/base/services/RouteService';
import { UserService } from '@/base/services/UserService';
import { useStore } from '@/uikit/hooks/useStore';
import * as i18nKeys from '@config/Identifier/I18n';
import LocaleLink from '@/uikit/components/LocaleLink';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const { t } = useBaseRoutePage();
  const userService = IOC(UserService);
  const AppConfig = IOC('AppConfig');
  useStore(userService);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginFormData) => {
    try {
      setLoading(true);
      await userService.login({
        username: values.email,
        password: values.password
      });
      IOC(RouteService).replaceToHome();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen text-xs1 bg-primary">
      {/* Left side - Brand section */}
      <div className="hidden lg:flex lg:w-1/2 bg-secondary p-12 flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand rounded-lg"></div>
          <span className="text-2xl font-semibold text-text">
            {AppConfig.appName}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-text mb-4">
          {t(i18nKeys.LOGIN_WELCOME)}
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          {t(i18nKeys.LOGIN_SUBTITLE)}
        </p>
        <div className="space-y-4">
          <FeatureItem icon="🎯" text={t(i18nKeys.LOGIN_FEATURE_AI_PATHS)} />
          <FeatureItem
            icon="🎯"
            text={t(i18nKeys.LOGIN_FEATURE_SMART_RECOMMENDATIONS)}
          />
          <FeatureItem
            icon="📊"
            text={t(i18nKeys.LOGIN_FEATURE_PROGRESS_TRACKING)}
          />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h2 className="text-2xl font-semibold mb-2 text-text">
            {t(i18nKeys.LOGIN_TITLE)}
          </h2>
          <p className="text-text-secondary mb-8">
            {t(i18nKeys.LOGIN_SUBTITLE)}
          </p>

          <Form
            name="login"
            initialValues={{
              email: AppConfig.loginUser,
              password: AppConfig.loginPassword
            }}
            onFinish={handleLogin}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: t(i18nKeys.LOGIN_EMAIL_REQUIRED) }
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-text-tertiary" />}
                placeholder={t(i18nKeys.LOGIN_EMAIL)}
                title={t(i18nKeys.LOGIN_EMAIL_TITLE)}
                className="h-12 text-base bg-secondary border-border"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: t(i18nKeys.LOGIN_PASSWORD_REQUIRED) }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t(i18nKeys.LOGIN_PASSWORD)}
                title={t(i18nKeys.LOGIN_PASSWORD_TITLE)}
                className="h-12 text-base"
              />
            </Form.Item>

            <div className="flex justify-end">
              <a
                href="#"
                className="text-brand hover:text-brand-hover"
                title={t(i18nKeys.LOGIN_FORGOT_PASSWORD_TITLE)}
              >
                {t(i18nKeys.LOGIN_FORGOT_PASSWORD)}
              </a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                title={t(i18nKeys.LOGIN_BUTTON_TITLE)}
                className="w-full h-12 text-base"
              >
                {t(i18nKeys.LOGIN_BUTTON)}
              </Button>
            </Form.Item>

            <div className="text-center text-text-tertiary my-4">
              {t(i18nKeys.LOGIN_CONTINUE_WITH)}
            </div>

            <Button
              icon={<GoogleOutlined />}
              className="w-full h-12 text-base"
              title={t(i18nKeys.LOGIN_WITH_GOOGLE_TITLE)}
            >
              {t(i18nKeys.LOGIN_WITH_GOOGLE)}
            </Button>

            <div className="text-center mt-6">
              <span className="text-text-tertiary">
                {t(i18nKeys.LOGIN_NO_ACCOUNT)}{' '}
              </span>
              <LocaleLink
                href="/register"
                className="text-brand hover:text-brand-hover"
                title={t(i18nKeys.LOGIN_CREATE_ACCOUNT_TITLE)}
              >
                {t(i18nKeys.LOGIN_CREATE_ACCOUNT)}
              </LocaleLink>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

// Helper component for feature items
function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 text-text">
      <div className="w-8 h-8 bg-elevated rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}
