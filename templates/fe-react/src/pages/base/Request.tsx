import { jsonStorageController, requestController } from '../../container';
import { useController, useControllerState } from '../../hooks/useController';

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
    </div>
  );
}
