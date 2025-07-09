import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { PAGE_500_TITLE } from '@config/Identifier/common';

export default function NotFound500() {
  const { t } = useBaseRoutePage();
  return (
    <div className="flex flex-col justify-center min-h-screen py-6 bg-background sm:py-12">
      <div className="relative py-3 mx-auto sm:max-w-xl">
        <h1 className="text-text text-2xl font-bold text-center">
          500 - {t(PAGE_500_TITLE)}
        </h1>
      </div>
    </div>
  );
}
