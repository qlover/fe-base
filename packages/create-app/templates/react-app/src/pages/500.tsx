import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';

export default function NotFound500() {
  const { t } = useBaseRoutePage();
  return (
    <div className="flex flex-col justify-center min-h-screen py-6 bg-background sm:py-12">
      <div className="relative py-3 mx-auto sm:max-w-xl">
        <h1 className="text-primary text-2xl font-bold text-center">
          500 - {t('500.title')}
        </h1>
      </div>
    </div>
  );
}
