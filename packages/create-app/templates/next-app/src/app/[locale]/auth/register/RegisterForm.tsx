'use client';

import { LockOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useStore } from '@brain-toolkit/react-kit';
import { Button, Checkbox, Form, Input } from 'antd';
import { useState } from 'react';
import { useIOC } from '@/uikit/hook/useIOC';
import type { RegisterI18nInterface } from '@config/i18n';
import { I } from '@config/IOCIdentifier';

export function RegisterForm(props: { tt: RegisterI18nInterface }) {
  const { tt } = props;
  const userService = useIOC(I.UserServiceInterface);
  const logger = useIOC(I.Logger);
  const routerService = useIOC(I.RouterServiceInterface);
  const [loading, setLoading] = useState(false);
  const result = useStore(userService.getUIStore(), (state) => state.result);

  const handleRegister = async (values: {
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      setLoading(true);
      await userService.register({
        username: values.username,
        email: values.email,
        password: values.password
      });
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    routerService.gotoLogin();
  };

  return (
    <Form
      data-testid="RegisterForm"
      name="register"
      onFinish={handleRegister}
      layout="vertical"
      className="space-y-4"
      validateTrigger="onSubmit"
      disabled={!!result}
      initialValues={{
        username: 'myused@sina.com',
        email: 'myused@sina.com',
        password: 'q1234566',
        confirmPassword: 'q1234566',
        agreeToTerms: true
      }}
    >
      {result && result.email_confirmed_at == null ? (
        <div className="text-xl text-red-500">{tt.email_verify}</div>
      ) : null}

      <Form.Item
        name="username"
        rules={[
          {
            required: true,
            message: tt.username_required
          }
        ]}
      >
        <Input
          prefix={<UserOutlined className="text-text-tertiary" />}
          placeholder={tt.username}
          className="h-12 text-base bg-secondary border-border"
        />
      </Form.Item>

      <Form.Item
        name="email"
        rules={[
          {
            required: true,
            type: 'email',
            message: tt.email_required
          }
        ]}
      >
        <Input
          prefix={<MailOutlined className="text-text-tertiary" />}
          placeholder={tt.email}
          className="h-12 text-base bg-secondary border-border"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: tt.password_required
          }
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={tt.password}
          className="h-12 text-base"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          {
            required: true,
            message: tt.confirm_password_required
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(tt.password_mismatch);
            }
          })
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={tt.confirm_password}
          className="h-12 text-base"
        />
      </Form.Item>

      <Form.Item
        name="agreeToTerms"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value
                ? Promise.resolve()
                : Promise.reject(new Error(tt.terms_required))
          }
        ]}
      >
        <Checkbox>
          <span className="text-text-secondary">
            {tt.terms_prefix}{' '}
            <a
              href="#"
              className="text-brand hover:text-brand-hover"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tt.terms_link}
            </a>{' '}
            {tt.terms_and}{' '}
            <a
              href="#"
              className="text-brand hover:text-brand-hover"
              target="_blank"
              rel="noopener noreferrer"
            >
              {tt.privacy_link}
            </a>
          </span>
        </Checkbox>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="w-full h-12 text-base"
        >
          {tt.button}
        </Button>
      </Form.Item>

      <div className="text-center mt-6">
        <span className="text-text-tertiary">{tt.have_account} </span>
        <a
          href="#"
          className="text-brand hover:text-brand-hover"
          onClick={handleLoginClick}
        >
          {tt.login_link}
        </a>
      </div>
    </Form>
  );
}
