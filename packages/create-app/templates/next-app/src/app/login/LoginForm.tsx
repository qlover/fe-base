'use client';
import '@ant-design/v5-patch-for-react-19';

import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import * as i18nKeys from '@config/Identifier/page.login';
import { identity as t } from 'lodash';
import LocaleLink from '@/uikit/components/LocaleLink';
import { useState } from 'react';
import { UserService } from '@/base/services/UserService';
import { IOC } from '@/core/IOC';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const userService = IOC(UserService);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginFormData) => {
    try {
      setLoading(true);
      await userService.login({
        email: values.email,
        password: values.password
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      data-testid="login-form"
      name="login"
      onFinish={handleLogin}
      layout="vertical"
      className="space-y-4"
    >
      <Form.Item
        name="email"
        rules={[{ required: true, message: t(i18nKeys.LOGIN_EMAIL_REQUIRED) }]}
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
        <LocaleLink
          href="#"
          className="text-brand hover:text-brand-hover"
          title={t(i18nKeys.LOGIN_FORGOT_PASSWORD_TITLE)}
        >
          {t(i18nKeys.LOGIN_FORGOT_PASSWORD)}
        </LocaleLink>
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
          title={t(i18nKeys.LOGIN_CREATE_ACCOUNT_TITLE) as string}
        >
          {t(i18nKeys.LOGIN_CREATE_ACCOUNT)}
        </LocaleLink>
      </div>
    </Form>
  );
}
