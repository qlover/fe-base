'use client';

import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { Form, Input, Button } from 'antd';
import { useState } from 'react';
import { I } from '@config/IOCIdentifier';
import { LocaleLink } from '@/uikit/components/LocaleLink';
import { useIOC } from '@/uikit/hook/useIOC';
import type { LoginI18nInterface } from '@config/i18n/loginI18n';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm(props: { tt: LoginI18nInterface }) {
  const { tt } = props;
  const userService = useIOC(I.UserServiceInterface);
  const routerService = useIOC(I.RouterServiceInterface);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginFormData) => {
    try {
      setLoading(true);
      await userService.login(values);
      routerService.gotoHome();
    } catch (error) {
      console.error('Login error:', error);
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
    >
      <Form.Item
        name="email"
        rules={[{ required: true, message: tt.emailRequired }]}
      >
        <Input
          prefix={<UserOutlined className="text-text-tertiary" />}
          placeholder={tt.email}
          title={tt.emailTitle}
          className="h-12 text-base bg-secondary border-c-border"
          autoComplete="off"
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
          autoComplete="new-password"
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
