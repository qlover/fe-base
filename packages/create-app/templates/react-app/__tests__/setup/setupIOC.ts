import { BootstrapClient } from '@/core/bootstraps/BootstrapClient';
import { testIoc, useTestIOC } from '../__mocks__/useTestIOC';
import { useLocaleRoutes } from '@config/common';

const testHost = 'http://localhost.test.com:3000'

// beforeAll(async () => {
//   console.log('>>> beforeAll BootstrapClient.main');
//   await BootstrapClient.main({
//     root: globalThis,
//     bootHref: useLocaleRoutes? testHost + '/en/test-mock' : testHost + '/test-mock',
//     IOC: testIoc
//   });
// });

// Mock useIOC
vi.mock('@/uikit/hooks/useIOC', () => {
  return {
    useIOC: useTestIOC
  };
});
vi.mock('../hooks/useIOC', () => {
  return {
    useIOC: useTestIOC
  };
});
