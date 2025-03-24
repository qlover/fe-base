import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import * as ErrorIdentifierList from '@config/ErrorIdentifier';

export default function ErrorIdentifier() {
  const { t } = useBaseRoutePage();

  return (
    <div className="min-h-screen bg-gray-100/90 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              {t('errorIdentifier')}
            </h1>
            <p className="text-blue-100 mt-1">
              Identifier From: '@config/ErrorIdentifier'
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {Object.entries(ErrorIdentifierList).map(([key, value]) => (
              <div
                key={key}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center hover:bg-gray-50"
              >
                <span className="font-medium text-gray-700 mr-3 min-w-[200px]">
                  {key}
                </span>
                <span className="mt-1 sm:mt-0 text-gray-600 bg-gray-100 px-3 py-1 rounded-md">
                  {t(value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
