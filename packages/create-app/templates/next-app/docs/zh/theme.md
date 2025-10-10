# 主题系统开发指南

## 目录

1. [主题系统概述](#主题系统概述)
2. [主题变量和样式系统](#主题变量和样式系统)
3. [组件主题实现](#组件主题实现)
4. [主题切换和状态管理](#主题切换和状态管理)
5. [最佳实践和示例](#最佳实践和示例)

## 主题系统概述

### 1. 主题架构

项目采用分层的主题系统设计：

```
样式层                      组件层
┌──────────────┐          ┌──────────────┐
│   CSS 变量   │          │  主题提供者  │
├──────────────┤          ├──────────────┤
│  主题样式    │    ◄─────┤  主题消费者  │
├──────────────┤          ├──────────────┤
│  组件样式    │          │  主题切换器  │
└──────────────┘          └──────────────┘
```

### 2. 主题类型

```typescript
// config/theme.ts
export const themeConfig = {
  // 支持的主题
  supportedThemes: ['light', 'dark', 'pink'] as const,
  defaultTheme: 'system',

  // DOM 属性
  domAttribute: 'data-theme',

  // 存储键
  storageKey: 'theme'
};

// 主题类型定义
export type ThemeMode = (typeof themeConfig.supportedThemes)[number];
```

## 主题变量和样式系统

### 1. 基础变量定义

```css
/* styles/css/antd-themes/_common/_default.css */
html,
.fe-theme {
  /* 主色调相关变量 */
  --fe-color-primary: #60a5fa;
  --fe-color-primary-hover: #3b82f6;
  --fe-color-primary-active: #2563eb;
  --fe-color-primary-bg: rgba(96, 165, 250, 0.1);

  /* 状态色 */
  --fe-color-success: #52c41a;
  --fe-color-warning: #faad14;
  --fe-color-error: #ff4d4f;
  --fe-color-info: var(--fe-color-primary);

  /* 基础变量 */
  --fe-color-bg-container: rgb(255 255 255);
  --fe-color-bg-elevated: rgb(248 250 252);
  --fe-color-text-heading: rgb(15 23 42);
  --fe-color-text: rgba(15 23 42 / 0.85);
  --fe-color-text-secondary: rgba(15 23 42 / 0.45);
  --fe-color-border: rgb(226 232 240);
}
```

### 2. 暗色主题变量

```css
/* styles/css/antd-themes/_common/dark.css */
[data-theme='dark'],
[data-theme='dark'] .fe-theme {
  /* 主色调 - 紫色主题 */
  --fe-color-primary: #9333ea;
  --fe-color-primary-hover: #a855f7;
  --fe-color-primary-active: #7e22ce;

  /* 基础变量覆盖 */
  --fe-color-bg-container: rgb(30 41 59);
  --fe-color-bg-elevated: rgb(51 65 85);
  --fe-color-text-heading: rgb(241 245 249);
  --fe-color-text: rgba(255, 255, 255, 0.85);
  --fe-color-border: rgb(51 65 85);
}
```

### 3. 粉色主题变量

```css
/* styles/css/antd-themes/_common/pink.css */
[data-theme='pink'],
[data-theme='pink'] .fe-theme {
  /* 主色调 - 玫瑰色主题 */
  --fe-color-primary: #f472b6;
  --fe-color-primary-hover: #ec4899;
  --fe-color-primary-active: #db2777;

  /* 基础变量覆盖 */
  --ant-color-bg-container: rgb(255 241 242);
  --ant-color-bg-elevated: rgb(254 205 211);
  --fe-color-text-heading: rgb(159 18 57);
  --fe-color-text: rgba(190 18 60 / 0.85);
}
```

## Ant Design 主题系统

### 1. 基础主题变量

```css
/* styles/css/antd-themes/_common/_default.css */
html,
.fe-theme {
  /* Antd 主色调相关变量 - 浅蓝色主题 */
  --fe-color-primary: #60a5fa; /* blue-400 */
  --fe-color-primary-hover: #3b82f6; /* blue-500 */
  --fe-color-primary-active: #2563eb; /* blue-600 */
  --fe-color-primary-bg: rgba(96, 165, 250, 0.1);

  /* 状态色 */
  --fe-color-success: #52c41a;
  --fe-color-warning: #faad14;
  --fe-color-error: #ff4d4f;
  --fe-color-info: var(--fe-color-primary);

  /* Antd 基础变量 */
  --fe-color-bg-container: rgb(255 255 255);
  --fe-color-bg-elevated: rgb(248 250 252);
  --fe-color-text-heading: rgb(15 23 42);
  --fe-color-text: rgba(15 23 42 / 0.85);
  --fe-color-border: rgb(226 232 240);

  /* Antd 组件通用变量 */
  --fe-line-width: 1px;
  --fe-border-radius: 6px;
  --fe-motion-duration-mid: 0.2s;
}
```

### 2. 暗色主题组件变量

```css
/* styles/css/antd-themes/_common/dark.css */
[data-theme='dark'] {
  /* Input 组件变量 */
  .ant-input-css-var {
    --fe-input-hover-border-color: #4096ff;
    --fe-input-active-border-color: #1677ff;
    --fe-input-hover-bg: rgb(51 65 85);
    --fe-input-active-bg: rgb(51 65 85);
  }

  /* Button 组件变量 */
  .ant-btn-css-var {
    /* 紫色主题 */
    --fe-button-primary-color: #fff;
    --fe-button-primary-bg: #8b5cf6;
    --fe-button-primary-hover-bg: #7c3aed;
    --fe-button-primary-active-bg: #6d28d9;

    /* 默认按钮 */
    --fe-button-default-color: rgba(255, 255, 255, 0.85);
    --fe-button-default-bg: rgb(30 41 59);
    --fe-button-default-border-color: rgb(51 65 85);
  }

  /* Select 组件变量 */
  .ant-select-css-var {
    --fe-select-dropdown-bg: rgb(30 41 59);
    --fe-select-item-selected-bg: rgba(147, 51, 234, 0.1);
  }
}
```

### 3. 粉色主题组件变量

```css
/* styles/css/antd-themes/_common/pink.css */
[data-theme='pink'] {
  /* 主色调 */
  --fe-color-primary: #f472b6; /* pink-400 */
  --fe-color-primary-hover: #ec4899; /* pink-500 */
  --fe-color-primary-active: #db2777; /* pink-600 */

  /* 状态色 */
  --fe-color-error: #fb7185; /* rose-400 */
  --fe-color-warning-bg: #fff7e6;
  --fe-color-warning-border: #ffd591;

  /* 基础变量 */
  --ant-color-bg-container: rgb(255 241 242);
  --ant-color-bg-elevated: rgb(254 205 211);
  --fe-color-text-heading: rgb(159 18 57);
}
```

### 4. Ant Design 组件覆盖

```typescript
// 1. 配置主题令牌
const theme = {
  token: {
    colorPrimary: '#60a5fa',
    borderRadius: 6,
    colorBgContainer: '#ffffff',
    colorText: 'rgba(15, 23, 42, 0.85)',
    colorBorder: 'rgb(226, 232, 240)'
  },
  components: {
    Button: {
      colorPrimary: '#60a5fa',
      algorithm: true  // 启用算法
    },
    Input: {
      colorBgContainer: '#ffffff',
      activeBorderColor: '#60a5fa'
    }
  }
};

// 2. 使用主题提供者
export function AntdProvider({ children }: PropsWithChildren) {
  return (
    <ConfigProvider theme={theme}>
      {children}
    </ConfigProvider>
  );
}
```

## 组件主题实现

### 1. 菜单组件主题

```css
/* styles/css/antd-themes/menu/_default.css */
.fe-theme {
  &.ant-menu-css-var {
    /* 基础尺寸 */
    --fe-menu-item-height: 40px;
    --fe-menu-item-padding-inline: 16px;
    --fe-menu-radius-item: 8px;

    /* 文字颜色 */
    --fe-menu-color-item-text: rgb(var(--text-primary));
    --fe-menu-color-item-text-hover: rgb(var(--text-primary));
    --fe-menu-color-group-title: rgb(var(--text-secondary));

    /* 选中和激活状态 */
    --fe-menu-color-item-text-selected: rgb(var(--color-brand));
    --fe-menu-color-item-bg-selected: rgba(var(--color-brand), 0.1);

    /* 背景颜色 */
    --fe-menu-color-item-bg: rgb(var(--color-bg-base));
    --fe-menu-color-item-bg-hover: rgba(var(--text-primary), 0.06);
  }
}
```

### 2. 表格组件主题

```css
/* styles/css/antd-themes/table/_default.css */
.fe-theme {
  &.ant-table-css-var {
    /* 表格样式变量 */
    --fe-table-header-bg: var(--fe-color-bg-elevated);
    --fe-table-row-hover-bg: var(--fe-color-primary-bg);
    --fe-table-border-color: var(--fe-color-border);
  }
}
```

### 3. 组件主题使用

```typescript
// 1. 在组件中使用主题变量
function ThemedButton({ children }: PropsWithChildren) {
  return (
    <button
      className="
        bg-primary
        hover:bg-primary-hover
        active:bg-primary-active
        text-white
        px-4
        py-2
        rounded
      "
    >
      {children}
    </button>
  );
}

// 2. 主题感知组件
function ThemedCard({ children }: PropsWithChildren) {
  return (
    <div className="
      bg-bg-container
      dark:bg-bg-elevated
      text-text
      dark:text-text-light
      border
      border-border
      rounded-lg
      p-4
    ">
      {children}
    </div>
  );
}
```

## 主题切换和状态管理

### 1. 主题提供者

```typescript
// 1. 主题配置提供者
export function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute={themeConfig.domAttribute}
      defaultTheme={themeConfig.defaultTheme}
      themes={themeConfig.supportedThemes}
      enableSystem
    >
      <AntdThemeProvider theme={themeConfig.antdTheme}>
        {children}
      </AntdThemeProvider>
    </NextThemesProvider>
  );
}

// 2. 主题切换器
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Select
      value={theme}
      onChange={setTheme}
      options={[
        { value: 'light', label: t('theme.light') },
        { value: 'dark', label: t('theme.dark') },
        { value: 'pink', label: t('theme.pink') },
        { value: 'system', label: t('theme.system') }
      ]}
    />
  );
}
```

### 2. 主题状态管理

```typescript
// 1. 主题 Store
@injectable()
export class ThemeStore extends StoreInterface<ThemeState> {
  constructor() {
    super(() => ({
      mode: themeConfig.defaultTheme,
      systemTheme: 'light'
    }));
  }

  setTheme(mode: ThemeMode) {
    this.emit({ ...this.state, mode });
    localStorage.setItem(themeConfig.storageKey, mode);
  }

  // 监听系统主题变化
  watchSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      this.emit({
        ...this.state,
        systemTheme: e.matches ? 'dark' : 'light'
      });
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }
}

// 2. 在组件中使用
function ThemeAwareComponent() {
  const themeStore = useIOC(ThemeStore);
  const theme = useStore(themeStore, state => state.mode);
  const systemTheme = useStore(themeStore, state => state.systemTheme);

  const actualTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div className={`theme-${actualTheme}`}>
      {/* 组件内容 */}
    </div>
  );
}
```

## 最佳实践和示例

### 1. 主题变量命名规范

```css
/* ✅ 好的命名规范 */
--fe-color-primary
--fe-color-text
--fe-spacing-lg
--fe-radius-sm

/* ❌ 不好的命名规范 */
--primary
--text
--large-spacing
--small-radius
```

### 2. 主题样式组织

```
styles/
  css/
    antd-themes/           # Ant Design 主题
      _common/            # 通用变量
        _default.css     # 默认主题
        dark.css        # 暗色主题
        pink.css        # 粉色主题
      menu/              # 菜单组件主题
      table/             # 表格组件主题
    themes/              # 自定义主题
      default.css
      dark.css
      pink.css
```

### 3. 响应式主题

```typescript
// 1. 使用 Tailwind 的响应式主题
function ResponsiveCard() {
  return (
    <div className="
      bg-white
      dark:bg-gray-800
      md:p-6
      lg:p-8
      rounded-lg
      shadow-sm
      dark:shadow-gray-700
    ">
      {/* 卡片内容 */}
    </div>
  );
}

// 2. 使用媒体查询
const styles = css`
  @media (prefers-color-scheme: dark) {
    :root {
      --fe-color-bg: #1a1a1a;
      --fe-color-text: #ffffff;
    }
  }

  @media (prefers-color-scheme: light) {
    :root {
      --fe-color-bg: #ffffff;
      --fe-color-text: #1a1a1a;
    }
  }
`;
```

### 4. 主题切换动画

```css
/* 添加主题切换动画 */
:root {
  --transition-duration: 200ms;
}

* {
  transition:
    background-color var(--transition-duration) ease,
    color var(--transition-duration) ease,
    border-color var(--transition-duration) ease;
}

/* 禁用特定元素的过渡效果 */
.no-theme-transition {
  transition: none !important;
}
```

## 总结

项目的主题系统遵循以下原则：

1. **变量系统**：
   - 统一的变量命名规范
   - 层次化的变量组织
   - 完整的类型定义

2. **组件支持**：
   - 组件级别的主题变量
   - 响应式的主题支持
   - 平滑的主题切换

3. **可扩展性**：
   - 支持自定义主题
   - 插件化的主题系统
   - 组件级别的主题扩展

4. **最佳实践**：
   - 清晰的文件组织
   - 响应式设计
   - 性能优化
