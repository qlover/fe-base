import { PAGE_500_TITLE } from '@config/Identifier/common/common';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';

export default function NotFound500() {
  const { t } = useBaseRoutePage();
  return (
    <div
      data-testid="NotFound500"
      className="text-base bg-primary flex flex-col justify-center min-h-screen py-6 sm:py-12"
    >
      <div className="relative py-3 mx-auto sm:max-w-xl">
        <h1 className="text-text text-2xl font-bold text-center">
          {t(PAGE_500_TITLE)}
        </h1>
      </div>
    </div>
  );
}
