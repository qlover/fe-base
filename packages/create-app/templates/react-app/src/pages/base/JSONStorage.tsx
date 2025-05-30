import { IOC } from '@/core/IOC';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import template from 'lodash/template';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { useSliceStore } from '@qlover/slice-store-react';
import { Button, Input } from 'antd';

export default function JSONStorage() {
  const jsonStorageController = IOC(JSONStorageController);
  const controllerState = useSliceStore(jsonStorageController);
  const { t } = useBaseRoutePage();

  return (
    <div className="min-h-screen bg-primary py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="bg-secondary shadow-lg rounded-lg px-8 py-6">
          <h1 className="text-3xl font-bold text-center text-text mb-8">
            {t('title')}
          </h1>

          <div className="space-y-6">
            {/* 无过期时间的测试 */}
            <div className="p-6 bg-elevated rounded-lg">
              <h2 className="text-xl font-semibold text-text mb-4">
                {t('title2')}
              </h2>
              <div className="text-text-secondary mb-4">
                {template(t('format.title'))({
                  key: 'testKey1',
                  min: 100,
                  max: 9000
                })}
              </div>

              <div className="flex flex-col items-center space-y-4">
                <Button
                  type="primary"
                  onClick={jsonStorageController.changeRandomTestKey1}
                >
                  {t('setRandomValue')}
                </Button>

                <div className="p-4 bg-secondary rounded-lg w-full text-center">
                  <span className="text-text-secondary">
                    {t('currentValue')}:{' '}
                  </span>
                  <span className="font-semibold text-text">
                    {controllerState.testKey1}
                  </span>
                </div>
              </div>
            </div>

            {/* 带过期时间的测试 */}
            <div className="p-6 bg-elevated rounded-lg">
              <h2 className="text-xl font-semibold text-text mb-4">
                {t('title3')}
              </h2>
              <div className="text-text-secondary mb-4">
                {template(t('format.title'))({
                  key: 'testKey2',
                  min: 100,
                  max: 9000
                })}
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    value={controllerState.expireTime}
                    onChange={(e) =>
                      jsonStorageController.changeExpireTime(
                        Number(e.target.value)
                      )
                    }
                    className="w-32"
                    min="1000"
                    step="1000"
                  />
                  <span className="text-text-secondary">{t('ms')}</span>
                </div>

                <Button
                  type="primary"
                  onClick={jsonStorageController.onChangeRandomTestKey2}
                >
                  {t('setExpireTime')}
                </Button>

                <div className="p-4 bg-secondary rounded-lg w-full text-center">
                  <span className="text-text-secondary">
                    {t('currentValue')}:{' '}
                  </span>
                  <span className="font-semibold text-text">
                    {controllerState.testKey2}
                  </span>
                </div>
              </div>
            </div>

            {/* 请求超时时间设置 */}
            <div className="p-6 bg-elevated rounded-lg">
              <h2 className="text-xl font-semibold text-text mb-4">
                {t('title4')}
              </h2>
              <div className="flex items-center space-x-4">
                <Input
                  type="number"
                  value={controllerState.requestTimeout}
                  onChange={(e) =>
                    jsonStorageController.changeRequestTimeout(
                      Number(e.target.value)
                    )
                  }
                  className="w-32"
                  min="1000"
                  step="1000"
                />
                <span className="text-text-secondary">{t('ms')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
