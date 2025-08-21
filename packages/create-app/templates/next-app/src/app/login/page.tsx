import * as i18nKeys from '@config/Identifier/page.login';
import FeatureItem from './FeatureItem';
import LoginForm from './LoginForm';
import { identity as t } from 'lodash';

export default function LoginPage() {
  return (
    <div className="flex text-xs1 bg-primary min-h-screen">
      {/* Left side - Brand section */}
      <div className="hidden lg:flex bg-secondary lg:w-1/2 p-12 flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand rounded-lg"></div>
          <span className="text-2xl font-semibold text-text">
            {'AppConfig.appName'}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-text mb-4">
          {t(i18nKeys.LOGIN_WELCOME)}
        </h1>
        <p className="text-text-secondary text-lg mb-8">
          {t(i18nKeys.LOGIN_SUBTITLE)}
        </p>
        <div className="space-y-4">
          <FeatureItem icon="🎯" text={t(i18nKeys.LOGIN_FEATURE_AI_PATHS)} />
          <FeatureItem
            icon="🎯"
            text={t(i18nKeys.LOGIN_FEATURE_SMART_RECOMMENDATIONS)}
          />
          <FeatureItem
            icon="📊"
            text={t(i18nKeys.LOGIN_FEATURE_PROGRESS_TRACKING)}
          />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h2 className="text-2xl font-semibold mb-2 text-text">
            {t(i18nKeys.LOGIN_TITLE)}
          </h2>
          <p className="text-text-secondary mb-8">
            {t(i18nKeys.LOGIN_SUBTITLE)}
          </p>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
