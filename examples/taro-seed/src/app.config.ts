import { APP_ROUTES_PAGES } from './config/route';

export default defineAppConfig({
  pages: APP_ROUTES_PAGES,
  /** 启用组件按需注入，减少启动时间和内存占用（基础库 2.11.1+） */
  lazyCodeLoading: 'requiredComponents',
  darkmode: true,
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'WeChat',
    navigationBarTextStyle: 'black'
  }
});
