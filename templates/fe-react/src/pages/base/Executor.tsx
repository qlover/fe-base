import { executorController, jsonStorageController } from '@/container';
import { useControllerState } from '@/hooks';
import { useBaseRoutePage } from './PageProvider';
export default function Executor() {
  const jsonStorageControllerState = useControllerState(jsonStorageController);
  const { t } = useBaseRoutePage();

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="bg-white shadow-lg rounded-lg px-8 py-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            {t('executorDemo')}
          </h1>
        </div>

        <div className="bg-white shadow-lg rounded-lg px-8 py-6">
          {t('requestTimeout')}: {jsonStorageControllerState.requestTimeout}
        </div>
        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('executorTestPlugin')}
            </h2>

            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              onClick={executorController.onTestPlugins}
            >
              {t('testPlugin')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
