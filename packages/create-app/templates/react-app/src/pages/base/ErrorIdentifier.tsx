import { Button } from 'antd';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import * as ErrorIdentifierList from '@config/Identifier/Error';
import * as i18nKeys from '@config/Identifier/I18n';

export default function ErrorIdentifier() {
  const { t } = useBaseRoutePage();

  return (
    <div className="min-h-screen bg-primary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <section className="py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-text">
              {t(i18nKeys.PAGE_ERROR_IDENTIFIER_MAIN_TITLE)}
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              {t(i18nKeys.PAGE_ERROR_IDENTIFIER_SOURCE_DESCRIPTION)}
            </p>
          </div>
        </section>

        {/* Error Identifier List */}
        <div className="grid gap-4">
          {Object.entries(ErrorIdentifierList).map(([key, value]) => (
            <div
              key={key}
              className="bg-secondary shadow sm:rounded-lg p-6 border border-border hover:bg-elevated transition-colors duration-200"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <span className="font-medium text-text mb-2 sm:mb-0">
                  {key}
                </span>
                <span className="text-sm text-text-secondary bg-primary px-3 py-1 rounded-md">
                  {t(value)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Section */}
        <section className="py-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-text">
            {t(i18nKeys.PAGE_ERROR_IDENTIFIER_HELP_TITLE)}
          </h2>
          <p className="text-lg text-text-secondary mb-6">
            {t(i18nKeys.PAGE_ERROR_IDENTIFIER_HELP_DESCRIPTION)}
          </p>
          <Button type="primary" size="large">
            {t(i18nKeys.PAGE_ERROR_IDENTIFIER_CONTACT_SUPPORT)}
          </Button>
        </section>
      </div>
    </div>
  );
}
