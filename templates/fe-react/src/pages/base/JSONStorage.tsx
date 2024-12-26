import { jsonStorageController } from '@/container';
import { useController, useControllerState } from '@/hooks/useController';

export default function JSONStorage() {
  const controllerState = useControllerState(
    useController(jsonStorageController)
  );

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="bg-white shadow-lg rounded-lg px-8 py-6">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            JSONStorage Demo
          </h1>

          <div className="space-y-6">
            {/* 无过期时间的测试 */}
            <div className="p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                永久存储测试
              </h2>
              <div className="text-gray-600 mb-4">
                测试 key: testKey1, 随机值范围: 100~9000
              </div>

              <div className="flex flex-col items-center space-y-4">
                <button
                  onClick={jsonStorageController.changeRandomTestKey1}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  设置随机值
                </button>

                <div className="p-4 bg-white rounded-lg w-full text-center">
                  <span className="text-gray-600">当前值: </span>
                  <span className="font-semibold text-gray-800">
                    {controllerState.testKey1}
                  </span>
                </div>
              </div>
            </div>

            {/* 带过期时间的测试 */}
            <div className="p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                过期时间测试
              </h2>
              <div className="text-gray-600 mb-4">
                测试 key: testKey2, 随机值范围: 100~9000
              </div>

              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={controllerState.expireTime}
                    onChange={(e) =>
                      jsonStorageController.changeExpireTime(
                        Number(e.target.value)
                      )
                    }
                    className="px-4 py-2 border rounded-lg w-32"
                    min="1000"
                    step="1000"
                  />
                  <span className="text-gray-600">毫秒</span>
                </div>

                <button
                  onClick={jsonStorageController.onChangeRandomTestKey2}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                >
                  设置随机值(带过期时间)
                </button>

                <div className="p-4 bg-white rounded-lg w-full text-center">
                  <span className="text-gray-600">当前值: </span>
                  <span className="font-semibold text-gray-800">
                    {controllerState.testKey2}
                  </span>
                </div>
              </div>
            </div>

            {/* 请求超时时间设置 */}
            <div className="p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                请求超时时间设置
              </h2>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  value={controllerState.requestTimeout}
                  onChange={(e) =>
                    jsonStorageController.changeRequestTimeout(
                      Number(e.target.value)
                    )
                  }
                  className="px-4 py-2 border rounded-lg w-32"
                  min="1000"
                  step="1000"
                />
                <span className="text-gray-600">毫秒</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}