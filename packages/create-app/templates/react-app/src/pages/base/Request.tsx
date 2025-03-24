import { useControllerState } from '@qlover/fe-prod/react';
import { IOC } from '@/core/IOC';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { RequestController } from '@/uikit/controllers/RequestController';
import { useMemo } from 'react';

function JSONValue({ value }: { value: unknown }) {
  const output = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return 'Invalid JSON';
    }
  }, [value]);
  return (
    <pre className="mt-1 text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded overflow-x-auto">
      {output}
    </pre>
  );
}

export default function Request() {
  const requestController = IOC(RequestController);
  const requestControllerState = useControllerState(requestController);
  const jsonStorageControllerState = useControllerState(
    IOC(JSONStorageController)
  );
  const { t } = useBaseRoutePage();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Request Timeout Information */}
        <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {t('requestTimeout')}
          </h2>
          <div className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
            {jsonStorageControllerState.requestTimeout}
          </div>
        </div>

        {/* Hello Request Card */}
        <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            AI API: Hello
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            函数式 api, 使用了 FetchURLPlugin, RequestCommonPlugin,
            ApiMockPlugin, RequestLogger 插件
          </p>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={requestController.onHello}
          >
            {requestControllerState.helloState.loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t('loading')}
              </>
            ) : (
              'Hello'
            )}
          </button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {t('helloResult')}:
              </p>
              <JSONValue value={requestControllerState.helloState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                {t('helloError')}:
              </p>
              <JSONValue value={requestControllerState.helloState.error} />
            </div>
          </div>
        </div>

        {/* IP Information Card */}
        <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            FeApi: IP Information
          </h2>

          <p className="text-sm text-gray-600 mb-4">
            RequestScheduler 类式 api, 使用了 FetchURLPlugin,
            RequestCommonPlugin, RequestLogger, ApiPickDataPlugin 插件, 其中
            ApiPickDataPlugin 插件可以将返回类型统一扁平到 data 字段
          </p>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={requestController.onIpInfo}
          >
            {requestControllerState.ipInfoState.loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t('loading')}
              </>
            ) : (
              t('ipInfo')
            )}
          </button>

          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">
              {t('ipInfoResult')}:
            </p>
            <JSONValue value={requestControllerState.ipInfoState.result} />
          </div>
        </div>

        {/* Random User Card */}
        <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            UserApi:Random User
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            RequestTransaction 类式 api, 使用了 FetchURLPlugin,
            RequestCommonPlugin, ApiMockPlugin, FetchAbortPlugin,
            RequestLogger,ApiCatchPlugin 插件, 其中 FetchAbortPlugin 可以
            中止请求, ApiCatchPlugin 可以将捕获的错误统一到 apiCatchResult 字段
          </p>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={requestController.onRandomUser}
          >
            {requestControllerState.randomUserState.loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t('loading')}
              </>
            ) : (
              t('randomUser')
            )}
          </button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {t('randomUserResult')}:
              </p>
              <JSONValue
                value={requestControllerState.randomUserState.result}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                {t('randomUserError')}:
              </p>
              <JSONValue value={requestControllerState.randomUserState.error} />
            </div>
          </div>
        </div>

        {/* Abort Request Card */}
        <div className="bg-white shadow sm:rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            UserApi: Abort Request
          </h2>
          <button
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
              requestControllerState.abortState.loading
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={requestController.onTriggerAbortRequest}
          >
            {requestControllerState.abortState.loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t('stopAbortRequest')}
              </>
            ) : (
              t('triggerAbortRequest')
            )}
          </button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {t('abortRequestResult')}:
              </p>
              <JSONValue value={requestControllerState.abortState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700">
                {t('abortRequestError')}:
              </p>
              <JSONValue value={requestControllerState.abortState.error} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
