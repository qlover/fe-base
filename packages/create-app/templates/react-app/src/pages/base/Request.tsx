import { IOC } from '@/core';
import { useControllerState } from '@lib/fe-react-controller';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { RequestController } from '@/uikit/controllers/RequestController';

export default function Request() {
  const requestController = IOC(RequestController);
  const requestControllerState = useControllerState(requestController);
  const jsonStorageControllerState = useControllerState(
    IOC(JSONStorageController)
  );
  const { t } = useBaseRoutePage();

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col sm:py-12">
      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        {t('requestTimeout')}: {jsonStorageControllerState.requestTimeout}
      </div>

      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={requestController.onHello}
        >
          {requestControllerState.helloState.loading ? 'Loading...' : 'Hello'}
        </button>
        <div className="mt-4">
          {t('helloResult')}:{' '}
          {JSON.stringify(requestControllerState.helloState.result)}
        </div>
        <div className="mt-4">
          {t('helloError')}:{' '}
          {JSON.stringify(requestControllerState.helloState.error)}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={requestController.onIpInfo}
        >
          {requestControllerState.ipInfoState.loading
            ? t('loading')
            : t('ipInfo')}
        </button>
        <div className="mt-4">
          {t('ipInfoResult')}:{' '}
          {JSON.stringify(requestControllerState.ipInfoState.result)}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={requestController.onRandomUser}
        >
          {requestControllerState.randomUserState.loading
            ? t('loading')
            : t('randomUser')}
        </button>
        <div className="mt-4">
          {t('randomUserResult')}:{' '}
          {JSON.stringify(requestControllerState.randomUserState.result)}
        </div>
        <div className="mt-4">
          {t('randomUserError')}:{' '}
          {JSON.stringify(requestControllerState.randomUserState.error)}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={requestController.onTriggerAbortRequest}
        >
          {requestControllerState.abortState.loading
            ? t('stopAbortRequest')
            : t('triggerAbortRequest')}
          <span className="text-xs">
            {requestControllerState.abortState.loading ? t('loading') : ''}
          </span>
        </button>

        <div className="mt-4">
          {t('abortRequestResult')}:{' '}
          {JSON.stringify(requestControllerState.abortState.result)}
        </div>
        <div className="mt-4">
          {t('abortRequestError')}:{' '}
          {JSON.stringify(requestControllerState.abortState.error)}
        </div>
      </div>
    </div>
  );
}
