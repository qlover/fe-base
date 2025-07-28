# 主题系统

## 概述

主题系统采用 CSS 变量实现，结合 Tailwind CSS 和 Ant Design 组件库，提供了灵活且强大的主题定制能力。主要特点：

- **CSS 变量驱动**：使用 CSS 变量实现主题切换
- **Tailwind 集成**：与 Tailwind CSS 完美配合
- **多主题支持**：内置 light、dark、pink 三种主题
- **Ant Design 集成**：自定义 Ant Design 组件样式
- **响应式设计**：支持系统主题跟随
- **状态管理**：与 Store 系统集成
- **类型安全**：完整的 TypeScript 类型支持

## 技术栈集成

### 1. Tailwind CSS 配置

项目使用 Tailwind CSS 进行样式管理，通过 PostCSS 插件集成：

```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
};

// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}']
};
```

### 2. 样式层级管理

```css
/* styles/css/tailwind.css */
@layer theme, base, antd, components, utilities;

@import 'tailwindcss';
@import './themes/index.css';
```

### 3. CSS 变量与 Tailwind 结合

主题变量设计时考虑了与 Tailwind 的协同：

```css
/* 定义主题变量 */
:root {
  --color-bg-base: 255 255 255; /* 支持 Tailwind 的 rgb 值格式 */
  --text-primary: 15 23 42; /* slate-900 */
  --color-brand: 37 99 235; /* blue-600 */
}

/* 在 Tailwind 中使用主题变量 */
.custom-element {
  @apply bg-[rgb(var(--color-bg-base))]    /* 背景色 */
    text-[rgb(var(--text-primary))]    /* 文字颜色 */
    border-[rgb(var(--color-border))]  /* 边框颜色 */;
}
```

## 主题配置

### 1. 基础配置

在 `config/theme.ts` 中定义主题配置：

```typescript
export const themeConfig: ThemeConfig = {
  domAttribute: 'data-theme', // 主题属性名
  defaultTheme: 'system', // 默认主题
  target: 'html', // 主题属性目标元素
  supportedThemes: [
    // 支持的主题列表
    'light',
    'dark',
    'pink'
  ],
  storageKey: 'fe_theme', // 主题存储键名
  init: true, // 自动初始化
  prioritizeStore: true // 优先使用存储的主题
};
```

### 2. 主题变量定义

每个主题都定义了一套完整的 CSS 变量：

```css
/* 默认主题 (_default.css) */
:root {
  /* 基础背景色 */
  --color-bg-base: 255 255 255;
  --color-bg-secondary: 241 245 249;
  --color-bg-elevated: 248 250 252;

  /* 文字颜色 */
  --text-primary: 15 23 42;
  --text-secondary: 71 85 105;
  --text-tertiary: 100 116 139;

  /* 边框颜色 */
  --color-border: 226 232 240;

  /* 品牌色 */
  --color-brand: 37 99 235;
  --color-brand-hover: 59 130 246;
}

/* 暗色主题 (dark.css) */
[data-theme='dark'] {
  /* 基础背景色 */
  --color-bg-base: 15 23 42;
  --color-bg-secondary: 30 41 59;
  --color-bg-elevated: 51 65 85;

  /* 文字颜色 */
  --text-primary: 255 255 255;
  --text-secondary: 148 163 184;
  --text-tertiary: 100 116 139;
}

/* 粉色主题 (pink.css) */
[data-theme='pink'] {
  /* 基础背景色 */
  --color-bg-base: 255 241 242;
  --color-bg-secondary: 255 228 230;
  --color-bg-elevated: 254 205 211;

  /* 文字颜色 */
  --text-primary: 190 18 60;
  --text-secondary: 225 29 72;
  --text-tertiary: 244 63 94;
}
```

## Ant Design 主题定制

### 1. 组件变量

为 Ant Design 组件定制的 CSS 变量：

```css
.fe-theme {
  /* 主色调 */
  --fe-color-primary: #60a5fa;
  --fe-color-primary-hover: #3b82f6;
  --fe-color-primary-active: #2563eb;

  /* 状态色 */
  --fe-color-success: #52c41a;
  --fe-color-warning: #faad14;
  --fe-color-error: #ff4d4f;
  --fe-color-info: var(--fe-color-primary);

  /* 文本颜色 */
  --fe-color-text: rgba(15 23 42 / 0.85);
  --fe-color-text-secondary: rgba(15 23 42 / 0.45);
  --fe-color-text-tertiary: rgba(15 23 42 / 0.35);

  /* 组件样式 */
  --fe-border-radius: 6px;
  --fe-line-width: 1px;
  --fe-motion-duration-mid: 0.2s;
}
```

### 2. 组件级别定制

针对特定组件的样式定制：

```css
/* Button 组件 */
.ant-btn {
  --fe-button-primary-color: #fff;
  --fe-button-primary-bg: #60a5fa;
  --fe-button-primary-hover-bg: #3b82f6;
  --fe-button-padding-inline: 15px;
  --fe-button-font-size: 14px;
}

/* Input 组件 */
.ant-input {
  --fe-input-padding-block: 4px;
  --fe-input-hover-border-color: #4096ff;
  --fe-input-active-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
}

/* Select 组件 */
.ant-select {
  --fe-select-option-selected-bg: var(--fe-color-primary-bg);
  --fe-select-hover-border-color: var(--fe-color-primary);
}
```

## 主题切换实现

### 1. 主题切换组件

```tsx
export default function ThemeSwitcher() {
  const themeService = IOC(ThemeService);
  const { theme } = useStore(themeService);
  const themes = themeService.getSupportedThemes();

  const themeOptions = useMemo(() => {
    return themes.map((themeName) => ({
      value: themeName,
      label: (
        <div className={clsx('flex items-center gap-2')}>
          <ThemeIcon theme={themeName} />
          <span>{t(`HEADER_THEME_${themeName.toUpperCase()}`)}</span>
        </div>
      )
    }));
  }, [themes, t]);

  return (
    <Select
      value={theme}
      onChange={(value) => themeService.changeTheme(value)}
      options={themeOptions}
    />
  );
}
```

### 2. 主题服务集成

```tsx
function App() {
  return (
    <AntdThemeProvider
      staticApi={IOC('DialogHandler')}
      theme={{
        cssVar: {
          key: 'fe-theme',
          prefix: 'fe'
        }
      }}
    >
      <RouterProvider router={routerBase} />
    </AntdThemeProvider>
  );
}
```

## 使用方式

### 1. Tailwind 工具类与主题变量

```tsx
function CustomCard() {
  return (
    <div
      className="
      /* 背景和边框 */
      bg-[rgb(var(--color-bg-base))]
      border-[1px]
      border-[rgb(var(--color-border))]
      rounded-lg
      
      /* 间距和阴影 */
      p-4
      shadow-md
      
      /* 文字样式 */
      text-[rgb(var(--text-primary))]
      
      /* 交互状态 */
      hover:bg-[rgb(var(--color-bg-secondary))]
      transition-colors
    "
    >
      <h3 className="text-lg font-medium mb-2">卡片标题</h3>
      <p className="text-[rgb(var(--text-secondary))]">卡片内容</p>
    </div>
  );
}
```

### 2. 响应式设计

```tsx
function ResponsiveLayout() {
  return (
    <div
      className="
      /* 响应式布局 */
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      gap-4
      
      /* 主题相关样式 */
      bg-[rgb(var(--color-bg-secondary))]
      p-4
      sm:p-6
      lg:p-8
    "
    >
      {/* 内容 */}
    </div>
  );
}
```

### 3. 组件样式复用

```tsx
// 定义通用按钮样式
const buttonStyles = {
  base: `
    px-4 
    py-2 
    rounded-md 
    transition-colors
    disabled:opacity-50
  `,
  primary: `
    bg-[rgb(var(--color-brand))]
    text-white
    hover:bg-[rgb(var(--color-brand-hover))]
  `,
  secondary: `
    bg-[rgb(var(--color-bg-secondary))]
    text-[rgb(var(--text-primary))]
    hover:bg-[rgb(var(--color-bg-elevated))]
  `
};

function Button({ variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`
        ${buttonStyles.base}
        ${buttonStyles[variant]}
        ${className}
      `}
      {...props}
    />
  );
}
```

### 2. 切换主题

```tsx
function ThemeToggle() {
  const themeService = IOC(ThemeService);

  const toggleTheme = () => {
    const currentTheme = themeService.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    themeService.changeTheme(newTheme);
  };

  return <button onClick={toggleTheme}>切换主题</button>;
}
```

## 最佳实践

1. **变量命名**
   - 使用语义化的变量名
   - 遵循命名空间规范
   - 保持变量名一致性

2. **主题组织**
   - 按功能分类变量
   - 使用 CSS 层级管理
   - 避免重复定义

3. **性能优化**
   - 合理使用 CSS 变量
   - 避免运行时计算
   - 使用 CSS 预处理

4. **可维护性**
   - 统一的变量管理
   - 清晰的主题结构
   - 完善的类型定义

5. **Tailwind 使用建议**
   - 使用主题变量而不是硬编码颜色
   - 合理组织工具类顺序
   - 抽取常用样式组合
   - 使用 @apply 处理复杂样式

6. **性能优化**
   - 使用 PurgeCSS 清理未使用的样式
   - 合理使用动态类名
   - 避免过度使用自定义属性

## 常见问题

### 1. 主题切换不生效

检查以下几点：

- 确保主题配置正确
- 检查 CSS 变量是否正确加载
- 验证主题切换服务是否正常

### 2. 组件样式异常

可能的解决方案：

- 检查组件变量覆盖
- 确认 CSS 优先级
- 查看主题变量继承关系

### 3. 自定义主题

开发建议：

- 遵循现有主题结构
- 完整定义所有必要变量
- 注意与组件库的兼容性
