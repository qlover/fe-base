import { Button } from 'antd';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import * as ErrorIdentifierList from '@config/ErrorIdentifier';

export default function ErrorIdentifier() {
  const { t } = useBaseRoutePage();

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-base))] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <section className="py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[rgb(var(--color-text-primary))]">
              {t('errorIdentifier')}
            </h1>
            <p className="text-xl text-[rgb(var(--color-text-secondary))] mb-8">
              Identifier From: '@config/ErrorIdentifier'
            </p>
          </div>
        </section>

        {/* Error Identifier List */}
        <div className="grid gap-4">
          {Object.entries(ErrorIdentifierList).map(([key, value]) => (
            <div
              key={key}
              className="bg-[rgb(var(--color-bg-secondary))] shadow sm:rounded-lg p-6 border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg-elevated))] transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <span className="font-medium text-[rgb(var(--color-text-primary))] mb-2 sm:mb-0">
                  {key}
                </span>
                <span className="text-sm text-[rgb(var(--color-text-secondary))] bg-[rgb(var(--color-bg-base))] px-3 py-1 rounded-md">
                  {t(value)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <section className="py-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-[rgb(var(--color-text-primary))]">
            {t('Need Help?')}
          </h2>
          <p className="text-lg text-[rgb(var(--color-text-secondary))] mb-6">
            {t('errorIdentifier_help_text')}
          </p>
          <Button type="primary" size="large">
            {t('Contact Support')}
          </Button>
        </section>
      </div>
    </div>
  );
}
