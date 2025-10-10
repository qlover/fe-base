# Theme System Development Guide

## Table of Contents

1. [Theme System Overview](#theme-system-overview)
2. [Theme Variables and Style System](#theme-variables-and-style-system)
3. [Component Theme Implementation](#component-theme-implementation)
4. [Theme Switching and State Management](#theme-switching-and-state-management)
5. [Best Practices and Examples](#best-practices-and-examples)

## Theme System Overview

### 1. Theme Architecture

The project adopts a layered theme system design:

```
Style Layer               Component Layer
┌──────────────┐          ┌──────────────┐
│ CSS Variables│          │Theme Provider│
├──────────────┤          ├──────────────┤
│Theme Styles  │    ◄─────┤Theme Consumer│
├──────────────┤          ├──────────────┤
│Component Style│          │Theme Switcher│
└──────────────┘          └──────────────┘
```

### 2. Theme Types

```typescript
// config/theme.ts
export const themeConfig = {
  // Supported themes
  supportedThemes: ['light', 'dark', 'pink'] as const,
  defaultTheme: 'system',

  // DOM attribute
  domAttribute: 'data-theme',

  // Storage key
  storageKey: 'theme'
};

// Theme type definition
export type ThemeMode = (typeof themeConfig.supportedThemes)[number];
```

## Theme Variables and Style System

### 1. Base Variable Definitions

```css
/* styles/css/antd-themes/_common/_default.css */
html,
.fe-theme {
  /* Primary color related variables */
  --fe-color-primary: #60a5fa;
  --fe-color-primary-hover: #3b82f6;
  --fe-color-primary-active: #2563eb;
  --fe-color-primary-bg: rgba(96, 165, 250, 0.1);

  /* Status colors */
  --fe-color-success: #52c41a;
  --fe-color-warning: #faad14;
  --fe-color-error: #ff4d4f;
  --fe-color-info: var(--fe-color-primary);

  /* Base variables */
  --fe-color-bg-container: rgb(255 255 255);
  --fe-color-bg-elevated: rgb(248 250 252);
  --fe-color-text-heading: rgb(15 23 42);
  --fe-color-text: rgba(15 23 42 / 0.85);
  --fe-color-text-secondary: rgba(15 23 42 / 0.45);
  --fe-color-border: rgb(226 232 240);
}
```

### 2. Dark Theme Variables

```css
/* styles/css/antd-themes/_common/dark.css */
[data-theme='dark'],
[data-theme='dark'] .fe-theme {
  /* Primary color - Purple theme */
  --fe-color-primary: #9333ea;
  --fe-color-primary-hover: #a855f7;
  --fe-color-primary-active: #7e22ce;

  /* Base variable overrides */
  --fe-color-bg-container: rgb(30 41 59);
  --fe-color-bg-elevated: rgb(51 65 85);
  --fe-color-text-heading: rgb(241 245 249);
  --fe-color-text: rgba(255, 255, 255, 0.85);
  --fe-color-border: rgb(51 65 85);
}
```

### 3. Pink Theme Variables

```css
/* styles/css/antd-themes/_common/pink.css */
[data-theme='pink'],
[data-theme='pink'] .fe-theme {
  /* Primary color - Rose theme */
  --fe-color-primary: #f472b6;
  --fe-color-primary-hover: #ec4899;
  --fe-color-primary-active: #db2777;

  /* Base variable overrides */
  --ant-color-bg-container: rgb(255 241 242);
  --ant-color-bg-elevated: rgb(254 205 211);
  --fe-color-text-heading: rgb(159 18 57);
  --fe-color-text: rgba(190 18 60 / 0.85);
}
```

## Ant Design Theme System

### 1. Base Theme Variables

```css
/* styles/css/antd-themes/_common/_default.css */
html,
.fe-theme {
  /* Antd primary color related variables - Light blue theme */
  --fe-color-primary: #60a5fa; /* blue-400 */
  --fe-color-primary-hover: #3b82f6; /* blue-500 */
  --fe-color-primary-active: #2563eb; /* blue-600 */
  --fe-color-primary-bg: rgba(96, 165, 250, 0.1);

  /* Status colors */
  --fe-color-success: #52c41a;
  --fe-color-warning: #faad14;
  --fe-color-error: #ff4d4f;
  --fe-color-info: var(--fe-color-primary);

  /* Antd base variables */
  --fe-color-bg-container: rgb(255 255 255);
  --fe-color-bg-elevated: rgb(248 250 252);
  --fe-color-text-heading: rgb(15 23 42);
  --fe-color-text: rgba(15 23 42 / 0.85);
  --fe-color-border: rgb(226 232 240);

  /* Antd common component variables */
  --fe-line-width: 1px;
  --fe-border-radius: 6px;
  --fe-motion-duration-mid: 0.2s;
}
```

### 2. Dark Theme Component Variables

```css
/* styles/css/antd-themes/_common/dark.css */
[data-theme='dark'] {
  /* Input component variables */
  .ant-input-css-var {
    --fe-input-hover-border-color: #4096ff;
    --fe-input-active-border-color: #1677ff;
    --fe-input-hover-bg: rgb(51 65 85);
    --fe-input-active-bg: rgb(51 65 85);
  }

  /* Button component variables */
  .ant-btn-css-var {
    /* Purple theme */
    --fe-button-primary-color: #fff;
    --fe-button-primary-bg: #8b5cf6;
    --fe-button-primary-hover-bg: #7c3aed;
    --fe-button-primary-active-bg: #6d28d9;

    /* Default button */
    --fe-button-default-color: rgba(255, 255, 255, 0.85);
    --fe-button-default-bg: rgb(30 41 59);
    --fe-button-default-border-color: rgb(51 65 85);
  }

  /* Select component variables */
  .ant-select-css-var {
    --fe-select-dropdown-bg: rgb(30 41 59);
    --fe-select-item-selected-bg: rgba(147, 51, 234, 0.1);
  }
}
```

### 3. Pink Theme Component Variables

```css
/* styles/css/antd-themes/_common/pink.css */
[data-theme='pink'] {
  /* Primary color */
  --fe-color-primary: #f472b6; /* pink-400 */
  --fe-color-primary-hover: #ec4899; /* pink-500 */
  --fe-color-primary-active: #db2777; /* pink-600 */

  /* Status colors */
  --fe-color-error: #fb7185; /* rose-400 */
  --fe-color-warning-bg: #fff7e6;
  --fe-color-warning-border: #ffd591;

  /* Base variables */
  --ant-color-bg-container: rgb(255 241 242);
  --ant-color-bg-elevated: rgb(254 205 211);
  --fe-color-text-heading: rgb(159 18 57);
}
```

### 4. Ant Design Component Override

```typescript
// 1. Configure theme tokens
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
      algorithm: true  // Enable algorithm
    },
    Input: {
      colorBgContainer: '#ffffff',
      activeBorderColor: '#60a5fa'
    }
  }
};

// 2. Use theme provider
export function AntdProvider({ children }: PropsWithChildren) {
  return (
    <ConfigProvider theme={theme}>
      {children}
    </ConfigProvider>
  );
}
```

## Component Theme Implementation

### 1. Menu Component Theme

```css
/* styles/css/antd-themes/menu/_default.css */
.fe-theme {
  &.ant-menu-css-var {
    /* Base dimensions */
    --fe-menu-item-height: 40px;
    --fe-menu-item-padding-inline: 16px;
    --fe-menu-radius-item: 8px;

    /* Text colors */
    --fe-menu-color-item-text: rgb(var(--text-primary));
    --fe-menu-color-item-text-hover: rgb(var(--text-primary));
    --fe-menu-color-group-title: rgb(var(--text-secondary));

    /* Selected and active states */
    --fe-menu-color-item-text-selected: rgb(var(--color-brand));
    --fe-menu-color-item-bg-selected: rgba(var(--color-brand), 0.1);

    /* Background colors */
    --fe-menu-color-item-bg: rgb(var(--color-bg-base));
    --fe-menu-color-item-bg-hover: rgba(var(--text-primary), 0.06);
  }
}
```

### 2. Table Component Theme

```css
/* styles/css/antd-themes/table/_default.css */
.fe-theme {
  &.ant-table-css-var {
    /* Table style variables */
    --fe-table-header-bg: var(--fe-color-bg-elevated);
    --fe-table-row-hover-bg: var(--fe-color-primary-bg);
    --fe-table-border-color: var(--fe-color-border);
  }
}
```

### 3. Component Theme Usage

```typescript
// 1. Use theme variables in components
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

// 2. Theme-aware component
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

## Theme Switching and State Management

### 1. Theme Provider

```typescript
// 1. Theme configuration provider
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

// 2. Theme switcher
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

### 2. Theme State Management

```typescript
// 1. Theme Store
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

  // Watch system theme changes
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

// 2. Use in components
function ThemeAwareComponent() {
  const themeStore = useIOC(ThemeStore);
  const theme = useStore(themeStore, state => state.mode);
  const systemTheme = useStore(themeStore, state => state.systemTheme);

  const actualTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div className={`theme-${actualTheme}`}>
      {/* Component content */}
    </div>
  );
}
```

## Best Practices and Examples

### 1. Theme Variable Naming Conventions

```css
/* ✅ Good naming conventions */
--fe-color-primary
--fe-color-text
--fe-spacing-lg
--fe-radius-sm

/* ❌ Bad naming conventions */
--primary
--text
--large-spacing
--small-radius
```

### 2. Theme Style Organization

```
styles/
  css/
    antd-themes/           # Ant Design themes
      _common/            # Common variables
        _default.css     # Default theme
        dark.css        # Dark theme
        pink.css        # Pink theme
      menu/              # Menu component theme
      table/             # Table component theme
    themes/              # Custom themes
      default.css
      dark.css
      pink.css
```

### 3. Responsive Theme

```typescript
// 1. Use Tailwind's responsive theme
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
      {/* Card content */}
    </div>
  );
}

// 2. Use media queries
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

### 4. Theme Transition Animation

```css
/* Add theme transition animation */
:root {
  --transition-duration: 200ms;
}

* {
  transition:
    background-color var(--transition-duration) ease,
    color var(--transition-duration) ease,
    border-color var(--transition-duration) ease;
}

/* Disable transition for specific elements */
.no-theme-transition {
  transition: none !important;
}
```

## Summary

The project's theme system follows these principles:

1. **Variable System**:
   - Unified variable naming conventions
   - Hierarchical variable organization
   - Complete type definitions

2. **Component Support**:
   - Component-level theme variables
   - Responsive theme support
   - Smooth theme switching

3. **Extensibility**:
   - Support for custom themes
   - Plugin-based theme system
   - Component-level theme extensions

4. **Best Practices**:
   - Clear file organization
   - Responsive design
   - Performance optimization
