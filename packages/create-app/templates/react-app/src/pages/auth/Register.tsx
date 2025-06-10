import { useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { IOC } from '@/core/IOC';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { RouteService } from '@/base/services/RouteService';
import { UserService } from '@/base/services/UserService';
import { useStore } from '@/uikit/hooks/useStore';
import * as i18nKeys from '@config/Identifier/I18n';
import type { RegisterFormData } from '@/base/port/LoginInterface';

export default function Register() {
  const { t } = useBaseRoutePage();
  const userService = IOC(UserService);
  const AppConfig = IOC('AppConfig');
  useStore(userService);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRegister = async (values: RegisterFormData) => {
    try {
      setLoading(true);
      await userService.register(values);
      IOC(RouteService).replaceToHome();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    IOC(RouteService).gotoLogin();
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
          {t(i18nKeys.REGISTER_TITLE)}
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          {t(i18nKeys.REGISTER_SUBTITLE)}
        </p>
        <div className="space-y-4">
          <FeatureItem
            icon="🎯"
            text={t(i18nKeys.REGISTER_FEATURE_PERSONALIZED)}
          />
          <FeatureItem icon="👨‍🏫" text={t(i18nKeys.REGISTER_FEATURE_SUPPORT)} />
          <FeatureItem
            icon="👥"
            text={t(i18nKeys.REGISTER_FEATURE_COMMUNITY)}
          />
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h2 className="text-2xl font-semibold mb-2 text-text">
            {t(i18nKeys.REGISTER_TITLE)}
          </h2>
          <p className="text-text-secondary mb-8">
            {t(i18nKeys.REGISTER_SUBTITLE)}
          </p>

          <Form
            form={form}
            name="register"
            onFinish={handleRegister}
            layout="vertical"
            className="space-y-4"
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: t(i18nKeys.REGISTER_USERNAME_REQUIRED)
                }
              ]}
            >
              <Input
                prefix={<UserOutlined className="text-text-tertiary" />}
                placeholder={t(i18nKeys.REGISTER_USERNAME)}
                className="h-12 text-base bg-secondary border-border"
              />
            </Form.Item>

            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: t(i18nKeys.REGISTER_EMAIL_REQUIRED)
                },
                {
                  type: 'email',
                  message: t(i18nKeys.REGISTER_EMAIL_REQUIRED)
                }
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-text-tertiary" />}
                placeholder={t(i18nKeys.REGISTER_EMAIL)}
                className="h-12 text-base bg-secondary border-border"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: t(i18nKeys.REGISTER_PASSWORD_REQUIRED)
                }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t(i18nKeys.REGISTER_PASSWORD)}
                className="h-12 text-base"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                {
                  required: true,
                  message: t(i18nKeys.REGISTER_CONFIRM_PASSWORD_REQUIRED)
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      t(i18nKeys.REGISTER_PASSWORD_MISMATCH)
                    );
                  }
                })
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t(i18nKeys.REGISTER_CONFIRM_PASSWORD)}
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
                      : Promise.reject(
                          new Error(t(i18nKeys.REGISTER_TERMS_REQUIRED))
                        )
                }
              ]}
            >
              <Checkbox>
                <span className="text-text-secondary">
                  {t(i18nKeys.REGISTER_TERMS_PREFIX)}{' '}
                  <a
                    href="#"
                    className="text-brand hover:text-brand-hover"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t(i18nKeys.REGISTER_TERMS_LINK)}
                  </a>{' '}
                  {t(i18nKeys.REGISTER_TERMS_AND)}{' '}
                  <a
                    href="#"
                    className="text-brand hover:text-brand-hover"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t(i18nKeys.REGISTER_PRIVACY_LINK)}
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
                {t(i18nKeys.REGISTER_BUTTON)}
              </Button>
            </Form.Item>

            <div className="text-center mt-6">
              <span className="text-text-tertiary">
                {t(i18nKeys.REGISTER_HAVE_ACCOUNT)}{' '}
              </span>
              <a
                href="#"
                className="text-brand hover:text-brand-hover"
                onClick={handleLoginClick}
              >
                {t(i18nKeys.REGISTER_LOGIN_LINK)}
              </a>
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
