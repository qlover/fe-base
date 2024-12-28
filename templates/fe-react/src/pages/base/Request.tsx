import { JSON, jsonStorageController, requestController } from '@/container';
import { useControllerState } from '@/hooks';

export default function Request() {
  const requestControllerState = useControllerState(requestController);
  const jsonStorageControllerState = useControllerState(jsonStorageController);

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col sm:py-12">
      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        请求超时时间: {jsonStorageControllerState.requestTimeout}
      </div>

      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={requestController.onHello}
        >
          {requestControllerState.helloState.loading ? 'Loading...' : 'Hello'}
        </button>
        <div className="mt-4">
          Hello result is:{' '}
          {JSON.stringify(requestControllerState.helloState.result)}
        </div>
        <div className="mt-4">
          Hello error is:{' '}
          {JSON.stringify(requestControllerState.helloState.error)}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={requestController.onIpInfo}
        >
          {requestControllerState.ipInfoState.loading ? 'Loading...' : 'IpInfo'}
        </button>
        <div className="mt-4">
          IpInfo result is:{' '}
          {JSON.stringify(requestControllerState.ipInfoState.result)}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={requestController.onRandomUser}
        >
          {requestControllerState.randomUserState.loading
            ? 'Loading...'
            : 'RandomUser'}
        </button>
        <div className="mt-4">
          RandomUser result is:{' '}
          {JSON.stringify(requestControllerState.randomUserState.result)}
        </div>
        <div className="mt-4">
          RandomUser error is:{' '}
          {JSON.stringify(requestControllerState.randomUserState.error)}
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg px-8 py-6">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
          onClick={requestController.onTriggerAbortRequest}
        >
          {requestControllerState.abortState.loading
            ? 'StopAbortRequest'
            : 'TriggerAbortRequest'}
          <span className="text-xs">
            {requestControllerState.abortState.loading ? 'Loading...' : ''}
          </span>
        </button>

        <div className="mt-4">
          AbortRequest result is:{' '}
          {JSON.stringify(requestControllerState.abortState.result)}
        </div>
        <div className="mt-4">
          AbortRequest error is:{' '}
          {JSON.stringify(requestControllerState.abortState.error)}
        </div>
      </div>
    </div>
  );
}
