import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';

export default function About() {
  const { t } = useBaseRoutePage();
  return (
    <div className="min-h-screen bg-primary py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <h1 className="text-2xl font-bold text-center text-text">
          {t('title')}
        </h1>
      </div>
    </div>
  );
}
