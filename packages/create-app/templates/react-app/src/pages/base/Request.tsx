import { IOC } from '@/core/IOC';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { RequestController } from '@/uikit/controllers/RequestController';
import { useMemo } from 'react';
import { useSliceStore } from '@qlover/slice-store-react';
import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

function JSONValue({ value }: { value: unknown }) {
  const output = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return 'Invalid JSON';
    }
  }, [value]);
  return (
    <pre className="mt-1 text-sm text-[rgb(var(--color-text-secondary))] font-mono bg-[rgb(var(--color-bg-secondary))] p-2 rounded overflow-x-auto">
      {output}
    </pre>
  );
}

export default function Request() {
  const requestController = IOC(RequestController);
  const requestControllerState = useSliceStore(requestController);
  const jsonStorageControllerState = useSliceStore(IOC(JSONStorageController));
  const { t } = useBaseRoutePage();

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-base))] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Request Timeout Information */}
        <div className="bg-[rgb(var(--color-bg-secondary))] shadow sm:rounded-lg p-6 border border-[rgb(var(--color-border))]">
          <h2 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-2">
            {t('requestTimeout')}
          </h2>
          <div className="text-sm text-[rgb(var(--color-text-secondary))] font-mono bg-[rgb(var(--color-bg-base))] p-2 rounded">
            {jsonStorageControllerState.requestTimeout}
          </div>
        </div>

        {/* Hello Request Card */}
        <div className="bg-[rgb(var(--color-bg-secondary))] shadow sm:rounded-lg p-6 border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg-elevated))] transition-colors duration-200">
          <h2 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">
            AI API: Hello
          </h2>

          <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
            函数式 api, 使用了 FetchURLPlugin, RequestCommonPlugin,
            ApiMockPlugin, RequestLogger 插件
          </p>
          <Button
            type="primary"
            onClick={requestController.onHello}
            loading={requestControllerState.helloState.loading}
          >
            {requestControllerState.helloState.loading ? t('loading') : 'Hello'}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                {t('helloResult')}:
              </p>
              <JSONValue value={requestControllerState.helloState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                {t('helloError')}:
              </p>
              <JSONValue value={requestControllerState.helloState.error} />
            </div>
          </div>
        </div>

        {/* IP Information Card */}
        <div className="bg-[rgb(var(--color-bg-secondary))] shadow sm:rounded-lg p-6 border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg-elevated))] transition-colors duration-200">
          <h2 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">
            FeApi: IP Information
          </h2>

          <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
            RequestScheduler 类式 api, 使用了 FetchURLPlugin,
            RequestCommonPlugin, RequestLogger, ApiPickDataPlugin 插件, 其中
            ApiPickDataPlugin 插件可以将返回类型统一扁平到 data 字段
          </p>
          <Button
            type="primary"
            onClick={requestController.onIpInfo}
            loading={requestControllerState.ipInfoState.loading}
          >
            {requestControllerState.ipInfoState.loading
              ? t('loading')
              : t('ipInfo')}
          </Button>

          <div className="mt-4">
            <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
              {t('ipInfoResult')}:
            </p>
            <JSONValue value={requestControllerState.ipInfoState.result} />
          </div>
        </div>

        {/* Random User Card */}
        <div className="bg-[rgb(var(--color-bg-secondary))] shadow sm:rounded-lg p-6 border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg-elevated))] transition-colors duration-200">
          <h2 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">
            UserApi:Random User
          </h2>
          <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
            RequestTransaction 类式 api, 使用了 FetchURLPlugin,
            RequestCommonPlugin, ApiMockPlugin, FetchAbortPlugin,
            RequestLogger,ApiCatchPlugin 插件, 其中 FetchAbortPlugin 可以
            中止请求, ApiCatchPlugin 可以将捕获的错误统一到 apiCatchResult 字段
          </p>
          <Button
            type="primary"
            onClick={requestController.onRandomUser}
            loading={requestControllerState.randomUserState.loading}
          >
            {requestControllerState.randomUserState.loading
              ? t('loading')
              : t('randomUser')}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                {t('randomUserResult')}:
              </p>
              <JSONValue
                value={requestControllerState.randomUserState.result}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                {t('randomUserError')}:
              </p>
              <JSONValue value={requestControllerState.randomUserState.error} />
            </div>
          </div>
        </div>

        {/* Api catch result */}
        <div className="bg-[rgb(var(--color-bg-secondary))] shadow sm:rounded-lg p-6 border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg-elevated))] transition-colors duration-200">
          <h2 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">
            UserApi: Api Catch Result
          </h2>
          <Button
            type={
              requestControllerState.apiCatchResultState.loading
                ? 'primary'
                : 'primary'
            }
            danger={requestControllerState.apiCatchResultState.loading}
            onClick={requestController.onTriggerApiCatchResult}
            loading={requestControllerState.apiCatchResultState.loading}
          >
            {requestControllerState.apiCatchResultState.loading
              ? t('stopApiCatchResult')
              : t('triggerApiCatchResult')}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                {t('abortRequestResult')}:
              </p>
              <JSONValue
                value={requestControllerState.apiCatchResultState.result}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                {t('abortRequestError')}:
              </p>
              <JSONValue
                value={requestControllerState.apiCatchResultState.error}
              />
            </div>
          </div>
        </div>

        {/* Abort Request Card */}
        <div className="bg-[rgb(var(--color-bg-secondary))] shadow sm:rounded-lg p-6 border border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-bg-elevated))] transition-colors duration-200">
          <h2 className="text-lg font-medium text-[rgb(var(--color-text-primary))] mb-4">
            UserApi: Abort Request
          </h2>
          <Button
            type={
              requestControllerState.abortState.loading ? 'primary' : 'primary'
            }
            danger={requestControllerState.abortState.loading}
            onClick={requestController.onTriggerAbortRequest}
          >
            {requestControllerState.abortState.loading && <LoadingOutlined />}
            {requestControllerState.abortState.loading
              ? t('stopAbortRequest')
              : t('triggerAbortRequest')}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
                {t('abortRequestResult')}:
              </p>
              <JSONValue value={requestControllerState.abortState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-[rgb(var(--color-text-primary))]">
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
