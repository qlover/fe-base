'use client';

import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { Form, Input, Button } from 'antd';
import { useState } from 'react';
import { LoginValidator } from '@/server/validators/LoginValidator';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { useIOC } from '@/uikit/hook/useIOC';
import { useWarnTranslations } from '@/uikit/hook/useWarnTranslations';
import type { LoginI18nInterface } from '@config/i18n/loginI18n';
import { I } from '@config/IOCIdentifier';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm(props: { tt: LoginI18nInterface }) {
  const { tt } = props;
  const t = useWarnTranslations();
  const userService = useIOC(I.UserServiceInterface);
  const logger = useIOC(I.Logger);
  const appConfig = useIOC(I.AppConfig);
  const routerService = useIOC(I.RouterServiceInterface);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginFormData) => {
    try {
      setLoading(true);
      await userService.login(values);
      routerService.replaceHome();
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      data-testid="LoginForm"
      name="login"
      onFinish={handleLogin}
      layout="vertical"
      className="space-y-4"
      validateTrigger="onSubmit"
      initialValues={{
        email: appConfig.testLoginEmail,
        password: appConfig.testLoginPassword
      }}
    >
      <Form.Item
        name="email"
        rules={[{ required: true, type: 'email', message: tt.emailRequired }]}
      >
        <Input
          prefix={<UserOutlined className="text-text-tertiary" />}
          placeholder={tt.email}
          title={tt.emailTitle}
          className="h-12 text-base bg-secondary border-c-border"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          { required: true, message: tt.passwordRequired },
          {
            validator(_, value) {
              const validator = new LoginValidator();
              const result = validator.validatePassword(value);
              if (result != null) {
                return Promise.reject(t(result.message));
              }
              return Promise.resolve();
            }
          }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={tt.password}
          title={tt.passwordTitle}
          className="h-12 text-base"
        />
      </Form.Item>

      <div className="flex justify-end">
        <LocaleLink href="#" title={tt.forgotPasswordTitle}>
          {tt.forgotPassword}
        </LocaleLink>
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
        <LocaleLink href="/register" title={tt.createAccountTitle}>
          {tt.createAccount}
        </LocaleLink>
      </div>
    </Form>
  );
}
