import { IOC } from '@/core/IOC';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { RequestController } from '@/uikit/controllers/RequestController';
import { useMemo } from 'react';
import { useStore } from '@/uikit/hooks/useStore';
import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import * as i18nKeys from '@config/Identifier/I18n';

function JSONValue({ value }: { value: unknown }) {
  const output = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return 'Invalid JSON';
    }
  }, [value]);
  return (
    <pre className="mt-1 text-sm text-text-secondary font-mono bg-secondary p-2 rounded overflow-x-auto">
      {output}
    </pre>
  );
}

export default function Request() {
  const requestController = IOC(RequestController);
  const requestControllerState = useStore(requestController);
  const jsonStorageControllerState = useStore(IOC(JSONStorageController));
  const { t } = useBaseRoutePage();

  return (
    <div className="min-h-screen bg-primary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Request Timeout Information */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary">
          <h2 className="text-lg font-medium text-text mb-2">
            {t(i18nKeys.PAGE_REQUEST_TIMEOUT)}
          </h2>
          <div className="text-sm text-text-secondary font-mono bg-base p-2 rounded">
            {jsonStorageControllerState.requestTimeout}
          </div>
        </div>

        {/* Hello Request Card */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {t(i18nKeys.PAGE_REQUEST_HELLO_TITLE)}
          </h2>

          <p className="text-sm text-text-secondary mb-4">
            {t(i18nKeys.PAGE_REQUEST_HELLO_DESCRIPTION)}
          </p>
          <Button
            type="primary"
            onClick={requestController.onHello}
            loading={requestControllerState.helloState.loading}
          >
            {requestControllerState.helloState.loading
              ? t(i18nKeys.REQUEST_LOADING)
              : t(i18nKeys.PAGE_REQUEST_HELLO_BUTTON)}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_HELLO_RESULT)}:
              </p>
              <JSONValue value={requestControllerState.helloState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_HELLO_ERROR)}:
              </p>
              <JSONValue value={requestControllerState.helloState.error} />
            </div>
          </div>
        </div>

        {/* IP Information Card */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {t(i18nKeys.PAGE_REQUEST_IP_INFO_TITLE)}
          </h2>

          <p className="text-sm text-text-secondary mb-4">
            {t(i18nKeys.PAGE_REQUEST_IP_INFO_DESCRIPTION)}
          </p>
          <Button
            type="primary"
            onClick={requestController.onIpInfo}
            loading={requestControllerState.ipInfoState.loading}
          >
            {requestControllerState.ipInfoState.loading
              ? t(i18nKeys.REQUEST_LOADING)
              : t(i18nKeys.REQUEST_IP_INFO)}
          </Button>

          <div className="mt-4">
            <p className="text-sm font-medium text-text">
              {t(i18nKeys.REQUEST_IP_INFO_RESULT)}:
            </p>
            <JSONValue value={requestControllerState.ipInfoState.result} />
          </div>
        </div>

        {/* Random User Card */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {t(i18nKeys.PAGE_REQUEST_RANDOM_USER_TITLE)}
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            {t(i18nKeys.PAGE_REQUEST_RANDOM_USER_DESCRIPTION)}
          </p>
          <Button
            type="primary"
            onClick={requestController.onRandomUser}
            loading={requestControllerState.randomUserState.loading}
          >
            {requestControllerState.randomUserState.loading
              ? t(i18nKeys.REQUEST_LOADING)
              : t(i18nKeys.REQUEST_RANDOM_USER)}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_RANDOM_USER_RESULT)}:
              </p>
              <JSONValue
                value={requestControllerState.randomUserState.result}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_RANDOM_USER_ERROR)}:
              </p>
              <JSONValue value={requestControllerState.randomUserState.error} />
            </div>
          </div>
        </div>

        {/* Api catch result */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {t(i18nKeys.PAGE_REQUEST_API_CATCH_TITLE)}
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
              ? t(i18nKeys.PAGE_REQUEST_STOP_API_CATCH)
              : t(i18nKeys.PAGE_REQUEST_TRIGGER_API_CATCH)}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_ABORT_RESULT)}:
              </p>
              <JSONValue
                value={requestControllerState.apiCatchResultState.result}
              />
            </div>

            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_ABORT_ERROR)}:
              </p>
              <JSONValue
                value={requestControllerState.apiCatchResultState.error}
              />
            </div>
          </div>
        </div>

        {/* Abort Request Card */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {t(i18nKeys.PAGE_REQUEST_ABORT_TITLE)}
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
              ? t(i18nKeys.PAGE_REQUEST_STOP_ABORT)
              : t(i18nKeys.PAGE_REQUEST_TRIGGER_ABORT)}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_ABORT_RESULT)}:
              </p>
              <JSONValue value={requestControllerState.abortState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_ABORT_ERROR)}:
              </p>
              <JSONValue value={requestControllerState.abortState.error} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
