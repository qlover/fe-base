import FeatureItem from './FeatureItem';
import LoginForm from './LoginForm';
import { useI18nInterface } from '@/uikit/hook/useI18nInterface';
import { loginI18n } from '@config/i18ns/loginI18n';

export default function LoginPage() {
  const tt = useI18nInterface(loginI18n);

  return (
    <div
      data-testid="LoginPage"
      className="flex text-xs1 bg-primary min-h-screen"
    >
      {/* Left side - Brand section */}
      <div className="hidden lg:flex bg-secondary lg:w-1/2 p-12 flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-brand rounded-lg"></div>
          <span className="text-2xl font-semibold text-text">
            {'AppConfig.appName'}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-text mb-4">{tt.welcome}</h1>
        <p className="text-text-secondary text-lg mb-8">{tt.subtitle}</p>
        <div className="space-y-4">
          <FeatureItem icon="🎯" text={tt.feature_ai_paths} />
          <FeatureItem icon="🎯" text={tt.feature_smart_recommendations} />
          <FeatureItem icon="📊" text={tt.feature_progress_tracking} />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 flex items-center justify-center">
        <div className="w-full max-w-[420px]">
          <h2 className="text-2xl font-semibold mb-2 text-text">{tt.title}</h2>
          <p className="text-text-secondary mb-8">{tt.subtitle}</p>

          <LoginForm tt={tt} />
        </div>
      </div>
    </div>
  );
}
