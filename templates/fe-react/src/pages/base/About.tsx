import { useBaseRoutePage } from './PageProvider';

export default function About() {
  const { t } = useBaseRoutePage();
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <h1 className="text-2xl font-bold text-center">{t('title')}</h1>
      </div>
    </div>
  );
}
