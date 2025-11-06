import template from 'lodash/template';
import { useStore } from '@brain-toolkit/react-kit/hooks/useStore';
import { Button, Input } from 'antd';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { useIOC } from '@/uikit/hooks/useIOC';
import { jsonStorage18n } from '@config/i18n/jsonStorage18n';
import { useI18nInterface } from '@/uikit/hooks/useI18nInterface';

export default function JSONStoragePage() {
  const pageBridge = useIOC(IOCIdentifier.JSONStoragePageInterface);
  const pageState = useStore(pageBridge);
  const tt = useI18nInterface(jsonStorage18n);

  return (
    <div className="min-h-screen bg-primary py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="bg-secondary shadow-lg rounded-lg px-8 py-6">
          <h1 className="text-3xl font-bold text-center text-text mb-8">
            {tt.mainTitle}
          </h1>

          <div className="space-y-6">
            {/* 无过期时间的测试 */}
            <div className="p-6 bg-elevated rounded-lg">
              <h2 className="text-xl font-semibold text-text mb-4">
                {tt.permanentTitle}
              </h2>
              <div className="text-text-secondary mb-4">
                {template(tt.formatTitle)({
                  key: 'testKey1',
                  min: 100,
                  max: 9000
                })}
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Button
                  type="primary"
                  onClick={pageBridge.changeRandomTestKey1}
                >
                  {tt.setRandom}
                </Button>

                <div className="p-4 bg-secondary rounded-lg w-full text-center">
                  <span className="text-text-secondary">
                    {tt.currentValue}:{' '}
                  </span>
                  <span className="font-semibold text-text">
                    {JSON.stringify(pageState.testKey1)}
                  </span>
                </div>
              </div>
            </div>

            {/* 带过期时间的测试 */}
            <div className="p-6 bg-elevated rounded-lg">
              <h2 className="text-xl font-semibold text-text mb-4">
                {tt.expireTitle}
              </h2>
              <div className="text-text-secondary mb-4">
                {template(tt.formatTitle)({
                  key: 'testKey2',
                  min: 100,
                  max: 9000
                })}
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    value={pageState.expireTime}
                    onChange={(e) =>
                      pageBridge.changeExpireTime(Number(e.target.value))
                    }
                    className="w-32"
                    min="1000"
                    step="1000"
                  />
                  <span className="text-text-secondary">{tt.ms}</span>
                </div>

                <Button
                  type="primary"
                  onClick={pageBridge.onChangeRandomTestKey2}
                >
                  {tt.setExpire}
                </Button>

                <div className="p-4 bg-secondary rounded-lg w-full text-center">
                  <span className="text-text-secondary">
                    {tt.currentValue}:{' '}
                  </span>
                  <span className="font-semibold text-text">
                    {pageState.testKey2}
                  </span>
                </div>
              </div>
            </div>

            {/* 请求超时时间设置 */}
            <div className="p-6 bg-elevated rounded-lg">
              <h2 className="text-xl font-semibold text-text mb-4">
                {tt.timeoutTitle}
              </h2>
              <div className="flex items-center space-x-4">
                <Input
                  type="number"
                  value={pageState.requestTimeout}
                  onChange={(e) =>
                    pageBridge.changeRequestTimeout(Number(e.target.value))
                  }
                  className="w-32"
                  min="1000"
                  step="1000"
                />
                <span className="text-text-secondary">{tt.ms}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
