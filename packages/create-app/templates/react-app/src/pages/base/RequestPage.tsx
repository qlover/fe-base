import { useMemo } from 'react';
import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import { Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useIOC } from '@/uikit/hooks/useIOC';
import { useI18nInterface } from '@/uikit/hooks/useI18nInterface';
import { request18n } from '@config/i18n/request18n';

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
  const pageBridge = useIOC(IOCIdentifier.RequestPageBridgeInterface);
  const pageState = useStore(pageBridge);
  const jsonStoragePageBridge = useIOC(IOCIdentifier.JSONStoragePageInterface);
  const jsonStoragePageState = useStore(jsonStoragePageBridge);
  const tt = useI18nInterface(request18n);

  return (
    <div className="min-h-screen bg-primary py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Request Timeout Information */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary">
          <h2 className="text-lg font-medium text-text mb-2">{tt.timeout}</h2>
          <div className="text-sm text-text-secondary font-mono bg-base p-2 rounded">
            {jsonStoragePageState.requestTimeout}
          </div>
        </div>

        {/* Hello Request Card */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {tt.helloTitle}
          </h2>

          <p className="text-sm text-text-secondary mb-4">
            {tt.helloDescription}
          </p>
          <Button
            type="primary"
            onClick={pageBridge.onHello}
            loading={pageState.helloState.loading}
          >
            {pageState.helloState.loading ? tt.loading : tt.helloButton}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">{tt.helloResult}:</p>
              <JSONValue value={pageState.helloState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-text">{tt.helloError}:</p>
              <JSONValue value={pageState.helloState.error} />
            </div>
          </div>
        </div>

        {/* IP Information Card */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {tt.ipInfoTitle}
          </h2>

          <p className="text-sm text-text-secondary mb-4">
            {tt.ipInfoDescription}
          </p>
          <Button
            type="primary"
            onClick={pageBridge.onIpInfo}
            loading={pageState.ipInfoState.loading}
          >
            {pageState.ipInfoState.loading ? tt.loading : tt.ipInfo}
          </Button>

          <div className="mt-4">
            <p className="text-sm font-medium text-text">{tt.ipInfoResult}:</p>
            <JSONValue value={pageState.ipInfoState.result} />
          </div>
        </div>

        {/* Random User Card */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {tt.randomUserTitle}
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            {tt.randomUserDescription}
          </p>
          <Button
            type="primary"
            onClick={pageBridge.onRandomUser}
            loading={pageState.randomUserState.loading}
          >
            {pageState.randomUserState.loading ? tt.loading : tt.randomUser}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">
                {tt.randomUserResult}:
              </p>
              <JSONValue value={pageState.randomUserState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-text">
                {tt.randomUserError}:
              </p>
              <JSONValue value={pageState.randomUserState.error} />
            </div>
          </div>
        </div>

        {/* Api catch result */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {tt.apiCatchTitle}
          </h2>
          <Button
            type={pageState.apiCatchResultState.loading ? 'primary' : 'primary'}
            danger={pageState.apiCatchResultState.loading}
            onClick={pageBridge.onTriggerApiCatchResult}
            loading={pageState.apiCatchResultState.loading}
          >
            {pageState.apiCatchResultState.loading
              ? tt.stopAbort
              : tt.triggerApiCatch}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">{tt.abortResult}:</p>
              <JSONValue value={pageState.apiCatchResultState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-text">{tt.abortError}:</p>
              <JSONValue value={pageState.apiCatchResultState.error} />
            </div>
          </div>
        </div>

        {/* Abort Request Card */}
        <div className="bg-secondary shadow sm:rounded-lg p-6 border border-primary hover:bg-elevated transition-colors duration-200">
          <h2 className="text-lg font-medium text-text mb-4">
            {tt.abortTitle}
          </h2>
          <Button
            type={pageState.abortState.loading ? 'primary' : 'primary'}
            danger={pageState.abortState.loading}
            onClick={pageBridge.onTriggerAbortRequest}
          >
            {pageState.abortState.loading && <LoadingOutlined />}
            {pageState.abortState.loading ? tt.stopAbort : tt.triggerAbort}
          </Button>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-sm font-medium text-text">{tt.abortResult}:</p>
              <JSONValue value={pageState.abortState.result} />
            </div>

            <div>
              <p className="text-sm font-medium text-text">{tt.abortError}:</p>
              <JSONValue value={pageState.abortState.error} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
