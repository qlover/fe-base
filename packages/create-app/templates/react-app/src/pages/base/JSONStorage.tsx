import { IOC } from '@/core/IOC';
import { useBaseRoutePage } from '@/uikit/contexts/BaseRouteContext';
import template from 'lodash/template';
import { JSONStorageController } from '@/uikit/controllers/JSONStorageController';
import { useStore } from '@/uikit/hooks/useStore';
import { Button, Input } from 'antd';
import * as i18nKeys from '@config/Identifier/I18n';

export default function JSONStorage() {
  const jsonStorageController = IOC(JSONStorageController);
  const controllerState = useStore(jsonStorageController);
  const { t } = useBaseRoutePage();

  return (
    <div className="min-h-screen bg-primary py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="bg-secondary shadow-lg rounded-lg px-8 py-6">
          <h1 className="text-3xl font-bold text-center text-text mb-8">
            {t(i18nKeys.PAGE_JSONSTORAGE_MAIN_TITLE)}
          </h1>

          <div className="space-y-6">
            {/* 无过期时间的测试 */}
            <div className="p-6 bg-elevated rounded-lg">
              <h2 className="text-xl font-semibold text-text mb-4">
                {t(i18nKeys.PAGE_JSONSTORAGE_PERMANENT_TITLE)}
              </h2>
              <div className="text-text-secondary mb-4">
                {template(t(i18nKeys.PAGE_JSONSTORAGE_FORMAT_TITLE))({
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
                  {t(i18nKeys.PAGE_JSONSTORAGE_SET_RANDOM)}
                </Button>

                <div className="p-4 bg-secondary rounded-lg w-full text-center">
                  <span className="text-text-secondary">
                    {t(i18nKeys.PAGE_JSONSTORAGE_CURRENT_VALUE)}:{' '}
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
                {t(i18nKeys.PAGE_JSONSTORAGE_EXPIRE_TITLE)}
              </h2>
              <div className="text-text-secondary mb-4">
                {template(t(i18nKeys.PAGE_JSONSTORAGE_FORMAT_TITLE))({
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
                  <span className="text-text-secondary">
                    {t(i18nKeys.PAGE_JSONSTORAGE_MS)}
                  </span>
                </div>

                <Button
                  type="primary"
                  onClick={jsonStorageController.onChangeRandomTestKey2}
                >
                  {t(i18nKeys.PAGE_JSONSTORAGE_SET_EXPIRE)}
                </Button>

                <div className="p-4 bg-secondary rounded-lg w-full text-center">
                  <span className="text-text-secondary">
                    {t(i18nKeys.PAGE_JSONSTORAGE_CURRENT_VALUE)}:{' '}
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
                {t(i18nKeys.PAGE_JSONSTORAGE_TIMEOUT_TITLE)}
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
                <span className="text-text-secondary">
                  {t(i18nKeys.PAGE_JSONSTORAGE_MS)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
