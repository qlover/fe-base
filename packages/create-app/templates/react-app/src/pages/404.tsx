import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';

export default function NotFound({ route }: { route?: string }) {
  const { t } = useBaseRoutePage();
  return (
    <div className="flex flex-col justify-center min-h-screen py-6 bg-background sm:py-12">
      <div className="relative py-3 mx-auto sm:max-w-xl">
        <h1 className="text-text text-2xl font-bold text-center">
          404 -{route ? `${t('404.notComponent')}: ${route}` : t('404.notPage')}
        </h1>
      </div>
    </div>
  );
}
