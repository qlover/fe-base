# 如何新增加页面

以 HomePage 为例, 描述如何创建一个功能完善的页面

1. 创建 config/i18n-identifier/page.home.ts 文件描述页面所需要使用到 i18n 标识符,减少国际化时增加心智负担, 文件的内容遵循特殊的格式,然后启动运行项目或build, ts2locales 插件会自动生成国际化文件

```ts
/**
 * @description Home page title
 * @localZh 首页
 * @localEn Home
 */
export const PAGE_HOME_TITLE = 'page_home:title';

/**
 * @description Home page description
 * @localZh 一个现代前端实用库集合，提供各种实用工具和组件
 * @localEn A modern frontend utility library collection providing various practical tools and components
 */
export const PAGE_HOME_DESCRIPTION = 'page_home:description';
```

2. 创建 config/i18n-mapping/page.home.ts 目录下面同样新增页面需要使用到的i18n对象映射, 它用来快捷描述UI所欲要的文字

```ts
import * as i18nKeys from '../i18n-identifier/page.home';

export const pageHomeI18n = {
  // basic meta properties
  title: i18nKeys.PAGE_HOME_TITLE,
  description: i18nKeys.PAGE_HOME_DESCRIPTION,
  content: i18nKeys.PAGE_HOME_DESCRIPTION,
  keywords: i18nKeys.PAGE_HOME_KEYWORDS
} as const;
```

3. 在 config/router.ts 中增加页面到路由表中, 其中 element 属性映射到真实的 src/pages/base/HomePage.tsx 页面组件

4. 创建 src/pages/base/HomePage.tsx 文件, 这个文件需要 `export default` 一个默认函数组件, 这是为了简化 glob 匹配用来懒加载组件的逻辑

5. 组件内可以使用 `useI18nMapping(pageHomeI18n)` 获取一个文本对象,这个对象是已经翻译过后到文字对象

6. 页面样式优先使用 tailwind 和 src/themes 中的样式组合, 当然如何可能,你也可以创建页面的 .css/.module.css 样式
