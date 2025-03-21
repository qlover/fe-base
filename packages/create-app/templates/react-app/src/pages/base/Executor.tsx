import { useControllerState } from '@fe-prod/react';
import { IOC } from '@/core/IOC';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { ExecutorController } from '@/uikit/controllers/ExecutorController';

export default function Executor() {
  const executorController = IOC(ExecutorController);
  const jSONStorageController = IOC(JSONStorageController);
  const requestTimeout = useControllerState(
    jSONStorageController,
    jSONStorageController.selector.requestTimeout
  );

  const helloState = useControllerState(
    executorController,
    executorController.selector.helloState
  );

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
          {t('requestTimeout')}: {requestTimeout}
        </div>
        <div className="space-y-6">
          <div className="p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('executorTestPlugin')}
            </h2>

            <div className="text-gray-800">
              {helloState.loading ? (
                <div>Loading...</div>
              ) : (
                <button
                  className="bg-blue-500 px-4 py-2 rounded-md"
                  onClick={executorController.onTestPlugins}
                >
                  {t('testPlugin')}
                </button>
              )}

              {helloState.error instanceof Error ? (
                <div>{helloState.error.message}</div>
              ) : (
                <div>{IOC('JSON').stringify(helloState.result?.data)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
