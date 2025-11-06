import { useState } from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { RegisterFormData } from '@/base/services/UserService';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useIOC } from '@/uikit/hooks/useIOC';
import { useI18nInterface } from '@/uikit/hooks/useI18nInterface';
import { register18n } from '@config/i18n/register18n';

export default function RegisterPage() {
  const tt = useI18nInterface(register18n);
  const AppConfig = useIOC(IOCIdentifier.AppConfig);
  const userService = useIOC(IOCIdentifier.UserServiceInterface);
  const routeService = useIOC(IOCIdentifier.RouteServiceInterface);
  const logger = useIOC(IOCIdentifier.Logger);

  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleRegister = async (values: RegisterFormData) => {
    try {
      setLoading(true);
      await userService.register(values);
      routeService.replaceToHome();
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    routeService.gotoLogin();
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
        <h1 className="text-4xl font-bold text-text mb-4">{tt.title2}</h1>
        <p className="text-text-secondary text-lg mb-8">{tt.subtitle}</p>
        <div className="space-y-4">
          <FeatureItem icon="🎯" text={tt.featurePersonalized} />
          <FeatureItem icon="👨‍🏫" text={tt.featureSupport} />
          <FeatureItem icon="👥" text={tt.featureCommunity} />
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h2 className="text-2xl font-semibold mb-2 text-text">{tt.title2}</h2>
          <p className="text-text-secondary mb-8">{tt.subtitle}</p>

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
                  message: tt.usernameRequired
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
                  message: tt.emailRequired
                },
                {
                  type: 'email',
                  message: tt.emailRequired
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
                  message: tt.passwordRequired
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
                  message: tt.confirmPasswordRequired
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(tt.passwordMismatch);
                  }
                })
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={tt.confirmPassword}
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
                      : Promise.reject(new Error(tt.termsRequired))
                }
              ]}
            >
              <Checkbox>
                <span className="text-text-secondary">
                  {tt.termsPrefix}{' '}
                  <a
                    href="#"
                    className="text-brand hover:text-brand-hover"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tt.termsLink}
                  </a>{' '}
                  {tt.termsAnd}{' '}
                  <a
                    href="#"
                    className="text-brand hover:text-brand-hover"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tt.privacyLink}
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
              <span className="text-text-tertiary">{tt.haveAccount} </span>
              <a
                href="#"
                className="text-brand hover:text-brand-hover"
                onClick={handleLoginClick}
              >
                {tt.loginLink}
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
