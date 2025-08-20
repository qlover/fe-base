import { IOC } from '@/core/IOC';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import { useMemo } from 'react';
import { useStore } from '@/uikit/hooks/useStore';
import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import * as i18nKeys from '@config/Identifier/page.request';
import { IOCIdentifier } from '@config/IOCIdentifier';

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

export default function RequestPage() {
  const pageBridge = IOC(IOCIdentifier.RequestPageBridgeInterface);
  const pageState = useStore(pageBridge);
  const jsonStoragePageBridge = IOC(IOCIdentifier.JSONStoragePageInterface);
  const jsonStoragePageState = useStore(jsonStoragePageBridge);
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
            {jsonStoragePageState.requestTimeout}
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
            onClick={pageBridge.onHello}
            loading={pageState.helloState.loading}
          >
            {pageState.helloState.loading
              ? t(i18nKeys.REQUEST_LOADING)
              : t(i18nKeys.PAGE_REQUEST_HELLO_BUTTON)}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_HELLO_RESULT)}:
              </p>
              <JSONValue value={pageState.helloState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_HELLO_ERROR)}:
              </p>
              <JSONValue value={pageState.helloState.error} />
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
            onClick={pageBridge.onIpInfo}
            loading={pageState.ipInfoState.loading}
          >
            {pageState.ipInfoState.loading
              ? t(i18nKeys.REQUEST_LOADING)
              : t(i18nKeys.REQUEST_IP_INFO)}
          </Button>

          <div className="mt-4">
            <p className="text-sm font-medium text-text">
              {t(i18nKeys.REQUEST_IP_INFO_RESULT)}:
            </p>
            <JSONValue value={pageState.ipInfoState.result} />
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
            onClick={pageBridge.onRandomUser}
            loading={pageState.randomUserState.loading}
          >
            {pageState.randomUserState.loading
              ? t(i18nKeys.REQUEST_LOADING)
              : t(i18nKeys.REQUEST_RANDOM_USER)}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_RANDOM_USER_RESULT)}:
              </p>
              <JSONValue value={pageState.randomUserState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_RANDOM_USER_ERROR)}:
              </p>
              <JSONValue value={pageState.randomUserState.error} />
            </div>
          </div>
        </div>

        {/* Api catch result */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {t(i18nKeys.PAGE_REQUEST_API_CATCH_TITLE)}
          </h2>
          <Button
            type={pageState.apiCatchResultState.loading ? 'primary' : 'primary'}
            danger={pageState.apiCatchResultState.loading}
            onClick={pageBridge.onTriggerApiCatchResult}
            loading={pageState.apiCatchResultState.loading}
          >
            {pageState.apiCatchResultState.loading
              ? t(i18nKeys.PAGE_REQUEST_STOP_API_CATCH)
              : t(i18nKeys.PAGE_REQUEST_TRIGGER_API_CATCH)}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_ABORT_RESULT)}:
              </p>
              <JSONValue value={pageState.apiCatchResultState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_ABORT_ERROR)}:
              </p>
              <JSONValue value={pageState.apiCatchResultState.error} />
            </div>
          </div>
        </div>

        {/* Abort Request Card */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {t(i18nKeys.PAGE_REQUEST_ABORT_TITLE)}
          </h2>
          <Button
            type={pageState.abortState.loading ? 'primary' : 'primary'}
            danger={pageState.abortState.loading}
            onClick={pageBridge.onTriggerAbortRequest}
          >
            {pageState.abortState.loading && <LoadingOutlined />}
            {pageState.abortState.loading
              ? t(i18nKeys.PAGE_REQUEST_STOP_ABORT)
              : t(i18nKeys.PAGE_REQUEST_TRIGGER_ABORT)}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_ABORT_RESULT)}:
              </p>
              <JSONValue value={pageState.abortState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-text">
                {t(i18nKeys.REQUEST_ABORT_ERROR)}:
              </p>
              <JSONValue value={pageState.abortState.error} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
