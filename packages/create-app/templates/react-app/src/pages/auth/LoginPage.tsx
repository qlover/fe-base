import { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import LocaleLink from '@/uikit/components/LocaleLink';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useIOC } from '@/uikit/hooks/useIOC';
import { login18n } from '@config/i18n/login18n';
import { useI18nInterface } from '@/uikit/hooks/useI18nInterface';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const tt = useI18nInterface(login18n);
  const userService = useIOC(IOCIdentifier.UserServiceInterface);
  const AppConfig = useIOC(IOCIdentifier.AppConfig);
  const routeService = useIOC(IOCIdentifier.RouteServiceInterface);
  const logger = useIOC(IOCIdentifier.Logger);

  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginFormData) => {
    try {
      setLoading(true);
      await userService.login({
        username: values.email,
        password: values.password
      });
      routeService.replaceToHome();
    } catch (error) {
      logger.error(error);
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
        <h1 className="text-4xl font-bold text-text mb-4">{tt.welcome}</h1>
        <p className="text-text-secondary text-lg mb-8">{tt.subtitle}</p>
        <div className="space-y-4">
          <FeatureItem icon="🎯" text={tt.featureAiPaths} />
          <FeatureItem icon="🎯" text={tt.featureSmartRecommendations} />
          <FeatureItem icon="📊" text={tt.featureProgressTracking} />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h2 className="text-2xl font-semibold mb-2 text-text">{tt.title2}</h2>
          <p className="text-text-secondary mb-8">{tt.subtitle}</p>

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
              rules={[{ required: true, message: tt.emailRequired }]}
            >
              <Input
                prefix={<UserOutlined className="text-text-tertiary" />}
                placeholder={tt.email}
                title={tt.emailTitle}
                className="h-12 text-base bg-secondary border-border"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: tt.passwordRequired }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={tt.password}
                title={tt.passwordTitle}
                className="h-12 text-base"
              />
            </Form.Item>

            <div className="flex justify-end">
              <a
                href="#"
                className="text-brand hover:text-brand-hover"
                title={tt.forgotPasswordTitle}
              >
                {tt.forgotPassword}
              </a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                title={tt.buttonTitle}
                className="w-full h-12 text-base"
              >
                {tt.button}
              </Button>
            </Form.Item>

            <div className="text-center text-text-tertiary my-4">
              {tt.continueWith}
            </div>

            <Button
              icon={<GoogleOutlined />}
              className="w-full h-12 text-base"
              title={tt.withGoogleTitle}
            >
              {tt.withGoogle}
            </Button>

            <div className="text-center mt-6">
              <span className="text-text-tertiary">{tt.noAccount} </span>
              <LocaleLink
                href="/register"
                className="text-brand hover:text-brand-hover"
                title={tt.createAccountTitle}
              >
                {tt.createAccount}
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
