import { useState } from 'react';
import { useController } from '@lib/fe-react-controller';
import { IOC } from '@/core';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { RouterController } from '@/uikit/controllers/RouterController';
import { UserController } from '@/uikit/controllers/UserController';
import AppConfig from '@config/AppConfig';

export default function Login() {
  const { t } = useBaseRoutePage();
  const controller = useController(IOC(UserController));
  const [email, setEmail] = useState(AppConfig.loginUser);
  const [password, setPassword] = useState(AppConfig.loginPassword);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      await controller.login({ username: email, password });
      // Redirect or show success message
      IOC(RouterController).replaceToHome();
    } catch (error) {
      // Handle login error
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="bg-white shadow-lg rounded-lg px-8 py-6">
          <h1 className="text-base font-bold text-center text-gray-800 mb-8">
            {t('login')}
          </h1>
          <div className="space-y-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('email')}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('password')}
              className="w-full px-4 py-2 border rounded-lg"
            />
            <button
              onClick={handleLogin}
              className="w-full px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Loading...' : t('login')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
