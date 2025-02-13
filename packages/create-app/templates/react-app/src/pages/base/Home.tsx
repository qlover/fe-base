import LocaleLink from '@/components/LocaleLink';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';

export default function Home() {
  const { t } = useBaseRoutePage();

  return (
    <div className="min-h-screen bg-gray-100/90 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="bg-white shadow-lg rounded-lg px-8 py-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            {t('welcome')}
          </h1>

          <div className="space-y-6">
            <div className="text-center text-gray-600 mb-8">
              {t('description')}
            </div>

            <div className="grid gap-4">
              <LocaleLink
                href="/about"
                className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
              >
                <h2 className="text-xl font-semibold text-blue-700 mb-2">
                  {t('about')}
                </h2>
                <p className="text-gray-600">{t('about_description')}</p>
              </LocaleLink>

              <LocaleLink
                href="/jsonstorage"
                className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
              >
                <h2 className="text-xl font-semibold text-green-700 mb-2">
                  {t('jsonstorage')}
                </h2>
                <p className="text-gray-600">{t('jsonstorage_description')}</p>
              </LocaleLink>

              <LocaleLink
                href="/request"
                className="block p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
              >
                <h2 className="text-xl font-semibold text-red-700 mb-2">
                  {t('request')}
                </h2>
                <p className="text-gray-600">{t('request_description')}</p>
              </LocaleLink>
            </div>

            <div className="mt-8 text-center">
              <LocaleLink
                href="https://github.com/qlover/fe-base"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-gray-600 hover:text-gray-800"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    clipRule="evenodd"
                  />
                </svg>
                Visit GitHub
              </LocaleLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
