import { useState } from 'react';
import { Form, Input, Button } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { IOC } from '@/core/IOC';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { RouterController } from '@/uikit/controllers/RouterController';
import { UserController } from '@/uikit/controllers/UserController';
import AppConfig from '@/core/AppConfig';
import { useSliceStore } from '@qlover/slice-store-react';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const { t } = useBaseRoutePage();
  const userController = IOC(UserController);
  useSliceStore(userController);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values: LoginFormData) => {
    try {
      setLoading(true);
      await userController.login({
        username: values.email,
        password: values.password
      });
      IOC(RouterController).replaceToHome();
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
          Welcome back to the future of learning
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          Unlock personalized AI-powered learning experiences designed to
          accelerate your knowledge journey.
        </p>
        <div className="space-y-4">
          <FeatureItem
            icon="🎯"
            text="AI-powered personalized learning paths"
          />
          <FeatureItem icon="🎯" text="Smart content recommendations" />
          <FeatureItem icon="📊" text="Real-time progress tracking" />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h2 className="text-2xl font-semibold mb-2 text-text">
            {t('Sign in to your account')}
          </h2>
          <p className="text-text-secondary mb-8">
            Enter your credentials to access your dashboard
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
              rules={[{ required: true, message: 'Please input your email!' }]}
            >
              <Input
                prefix={<UserOutlined className="text-text-tertiary" />}
                placeholder={t('email')}
                className="h-12 text-base bg-secondary border-border"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Please input your password!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('password')}
                className="h-12 text-base"
              />
            </Form.Item>

            <div className="flex justify-end">
              <a href="#" className="text-brand hover:text-brand-hover">
                {t('Forgot your password?')}
              </a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 text-base"
              >
                {t('Sign In')}
              </Button>
            </Form.Item>

            <div className="text-center text-text-tertiary my-4">
              or continue with
            </div>

            <Button icon={<GoogleOutlined />} className="w-full h-12 text-base">
              Sign in with Google
            </Button>

            <div className="text-center mt-6">
              <span className="text-text-tertiary">
                Don't have an account?{' '}
              </span>
              <a href="#" className="text-brand hover:text-brand-hover">
                Create one here
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
