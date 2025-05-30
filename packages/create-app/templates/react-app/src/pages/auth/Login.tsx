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
    <div className="bg-theme-color-foreground">
      <div className="flex min-h-screen text-xs1">
        {/* Left side - Brand section */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-800 p-12 flex-col">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-500 rounded-lg"></div>
            <span className="text-2xl font-semibold text-white">
              {AppConfig.appName}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome back to the future of learning
          </h1>
          <p className="text-slate-400 text-lg mb-8">
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
            <h2 className="text-2xl font-semibold mb-2">
              {t('Sign in to your account')}
            </h2>
            <p className="text-slate-600 mb-8">
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
                rules={[
                  { required: true, message: 'Please input your email!' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder={t('email')}
                  className="h-12 text-base"
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
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  {t('Forgot your password?')}
                </a>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="w-full h-12 text-base bg-blue-600 hover:bg-blue-500"
                >
                  {t('Sign In')}
                </Button>
              </Form.Item>

              <div className="text-center text-slate-600 my-4">
                or continue with
              </div>

              <Button
                icon={<GoogleOutlined />}
                className="w-full h-12 text-base border-2 hover:border-blue-500"
              >
                Sign in with Google
              </Button>

              <div className="text-center mt-6">
                <span className="text-slate-600">Don't have an account? </span>
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Create one here
                </a>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for feature items
function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 text-white">
      <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <span>{text}</span>
    </div>
  );
}
