# Theme System

## Overview

The theme system is implemented using CSS variables, combined with Tailwind CSS and Ant Design component library, providing flexible and powerful theme customization capabilities. Main features:

- **CSS Variable Driven**: Implement theme switching using CSS variables
- **Tailwind Integration**: Perfect integration with Tailwind CSS
- **Multi-theme Support**: Built-in light, dark, and pink themes
- **Ant Design Integration**: Custom Ant Design component styles
- **Responsive Design**: Support system theme following
- **State Management**: Integration with Store system
- **Type Safety**: Complete TypeScript type support

## Technology Stack Integration

### 1. Tailwind CSS Configuration

The project uses Tailwind CSS for style management, integrated through PostCSS plugins:

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

### 2. Style Layer Management

```css
/* styles/css/tailwind.css */
@layer theme, base, antd, components, utilities;

@import 'tailwindcss';
@import './themes/index.css';
```

### 3. CSS Variables and Tailwind Integration

Theme variables are designed considering collaboration with Tailwind:

```css
/* Define theme variables */
:root {
  --color-bg-base: 255 255 255; /* Support Tailwind's rgb value format */
  --text-primary: 15 23 42; /* slate-900 */
  --color-brand: 37 99 235; /* blue-600 */
}

/* Use theme variables in Tailwind */
.custom-element {
  @apply bg-[rgb(var(--color-bg-base))]    /* Background color */
    text-[rgb(var(--text-primary))]    /* Text color */
    border-[rgb(var(--color-border))]  /* Border color */;
}
```

## Theme Configuration

### 1. Basic Configuration

Define theme configuration in `config/theme.ts`:

```typescript
export const themeConfig: ThemeConfig = {
  domAttribute: 'data-theme', // Theme attribute name
  defaultTheme: 'system', // Default theme
  target: 'html', // Theme attribute target element
  supportedThemes: [
    // Supported theme list
    'light',
    'dark',
    'pink'
  ],
  storageKey: 'fe_theme', // Theme storage key
  init: true, // Auto initialization
  prioritizeStore: true // Prioritize stored theme
};
```

### 2. Theme Variable Definition

Each theme defines a complete set of CSS variables:

```css
/* Default theme (_default.css) */
:root {
  /* Base background colors */
  --color-bg-base: 255 255 255;
  --color-bg-secondary: 241 245 249;
  --color-bg-elevated: 248 250 252;

  /* Text colors */
  --text-primary: 15 23 42;
  --text-secondary: 71 85 105;
  --text-tertiary: 100 116 139;

  /* Border colors */
  --color-border: 226 232 240;

  /* Brand colors */
  --color-brand: 37 99 235;
  --color-brand-hover: 59 130 246;
}

/* Dark theme (dark.css) */
[data-theme='dark'] {
  /* Base background colors */
  --color-bg-base: 15 23 42;
  --color-bg-secondary: 30 41 59;
  --color-bg-elevated: 51 65 85;

  /* Text colors */
  --text-primary: 255 255 255;
  --text-secondary: 148 163 184;
  --text-tertiary: 100 116 139;
}

/* Pink theme (pink.css) */
[data-theme='pink'] {
  /* Base background colors */
  --color-bg-base: 255 241 242;
  --color-bg-secondary: 255 228 230;
  --color-bg-elevated: 254 205 211;

  /* Text colors */
  --text-primary: 190 18 60;
  --text-secondary: 225 29 72;
  --text-tertiary: 244 63 94;
}
```

## Ant Design Theme Customization

### 1. Component Variables

CSS variables customized for Ant Design components:

```css
.fe-theme {
  /* Primary colors */
  --fe-color-primary: #60a5fa;
  --fe-color-primary-hover: #3b82f6;
  --fe-color-primary-active: #2563eb;

  /* Status colors */
  --fe-color-success: #52c41a;
  --fe-color-warning: #faad14;
  --fe-color-error: #ff4d4f;
  --fe-color-info: var(--fe-color-primary);

  /* Text colors */
  --fe-color-text: rgba(15 23 42 / 0.85);
  --fe-color-text-secondary: rgba(15 23 42 / 0.45);
  --fe-color-text-tertiary: rgba(15 23 42 / 0.35);

  /* Component styles */
  --fe-border-radius: 6px;
  --fe-line-width: 1px;
  --fe-motion-duration-mid: 0.2s;
}
```

### 2. Component-level Customization

Style customization for specific components:

```css
/* Button component */
.ant-btn {
  --fe-button-primary-color: #fff;
  --fe-button-primary-bg: #60a5fa;
  --fe-button-primary-hover-bg: #3b82f6;
  --fe-button-padding-inline: 15px;
  --fe-button-font-size: 14px;
}

/* Input component */
.ant-input {
  --fe-input-padding-block: 4px;
  --fe-input-hover-border-color: #4096ff;
  --fe-input-active-shadow: 0 0 0 2px rgba(5, 145, 255, 0.1);
}

/* Select component */
.ant-select {
  --fe-select-option-selected-bg: var(--fe-color-primary-bg);
  --fe-select-hover-border-color: var(--fe-color-primary);
}
```

## Theme Switching Implementation

### 1. Theme Switcher Component

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

### 2. Theme Service Integration

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

## Usage

### 1. Tailwind Utility Classes and Theme Variables

```tsx
function CustomCard() {
  return (
    <div
      className="
      /* Background and border */
      bg-[rgb(var(--color-bg-base))]
      border-[1px]
      border-[rgb(var(--color-border))]
      rounded-lg
      
      /* Spacing and shadow */
      p-4
      shadow-md
      
      /* Text styles */
      text-[rgb(var(--text-primary))]
      
      /* Interactive states */
      hover:bg-[rgb(var(--color-bg-secondary))]
      transition-colors
    "
    >
      <h3 className="text-lg font-medium mb-2">Card Title</h3>
      <p className="text-[rgb(var(--text-secondary))]">Card Content</p>
    </div>
  );
}
```

### 2. Responsive Design

```tsx
function ResponsiveLayout() {
  return (
    <div
      className="
      /* Responsive layout */
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      gap-4
      
      /* Theme-related styles */
      bg-[rgb(var(--color-bg-secondary))]
      p-4
      sm:p-6
      lg:p-8
    "
    >
      {/* Content */}
    </div>
  );
}
```

### 3. Component Style Reuse

```tsx
// Define common button styles
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

### 2. Theme Switching

```tsx
function ThemeToggle() {
  const themeService = IOC(ThemeService);

  const toggleTheme = () => {
    const currentTheme = themeService.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    themeService.changeTheme(newTheme);
  };

  return <button onClick={toggleTheme}>Toggle Theme</button>;
}
```

## Best Practices

1. **Variable Naming**
   - Use semantic variable names
   - Follow namespace conventions
   - Maintain variable name consistency

2. **Theme Organization**
   - Categorize variables by functionality
   - Use CSS layer management
   - Avoid duplicate definitions

3. **Performance Optimization**
   - Use CSS variables judiciously
   - Avoid runtime calculations
   - Use CSS preprocessing

4. **Maintainability**
   - Unified variable management
   - Clear theme structure
   - Complete type definitions

5. **Tailwind Usage Suggestions**
   - Use theme variables instead of hardcoded colors
   - Organize utility classes logically
   - Extract common style combinations
   - Use @apply for complex styles

6. **Performance Optimization**
   - Use PurgeCSS to clean unused styles
   - Use dynamic class names reasonably
   - Avoid overuse of custom properties

## Common Issues

### 1. Theme Switching Not Working

Check the following:

- Ensure theme configuration is correct
- Check if CSS variables are properly loaded
- Verify theme switching service is working

### 2. Component Style Issues

Possible solutions:

- Check component variable overrides
- Confirm CSS specificity
- Review theme variable inheritance

### 3. Custom Themes

Development suggestions:

- Follow existing theme structure
- Define all necessary variables completely
- Consider compatibility with component library
