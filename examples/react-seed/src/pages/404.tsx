import { PAGE_404_TITLE } from '@config/i18n-identifier/common';
import { useTranslation } from '@/hooks/useTranslation';
import type { RouterRenderProps } from '@/components/RouterRenderComponent';

export default function NotFound(_props: RouterRenderProps) {
  const { t } = useTranslation();

  return (
    <div
      data-testid="NotFound"
      className="text-base bg-primary flex flex-col justify-center min-h-screen py-6 sm:py-12"
    >
      <div className="relative py-3 mx-auto sm:max-w-xl">
        <h1 className="text-text text-2xl font-bold text-center">
          {t(PAGE_404_TITLE)}
        </h1>
      </div>
    </div>
  );
}
