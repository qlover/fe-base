# Playwright E2E Testing Guide

## Overview

This project includes comprehensive end-to-end (E2E) testing using [Playwright](https://playwright.dev/), a modern testing framework that enables reliable testing across all modern browsers.

## Features

- ✅ Multi-browser testing (Chromium, Firefox, WebKit)
- ✅ Mobile browser simulation
- ✅ Page Object Model (POM) architecture
- ✅ Comprehensive test coverage
- ✅ Automatic screenshots and videos on failure
- ✅ CI/CD integration with GitHub Actions
- ✅ Accessibility testing
- ✅ Performance testing
- ✅ i18n testing

## Quick Start

### Installation

```bash
# Fix npm permissions if needed
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"

# Install Playwright
npm install -D @playwright/test playwright

# Install browsers
npx playwright install
```

### Run Tests

```bash
# Run all tests
npm run test:e2e

# Interactive UI mode (recommended)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# View report
npm run test:e2e:report
```

## Test Structure

```
e2e/
├── fixtures/           # Custom test fixtures
├── pages/             # Page Object Models
├── tests/             # Test specifications
│   ├── home.spec.ts
│   ├── navigation.spec.ts
│   ├── auth.spec.ts
│   ├── i18n.spec.ts
│   ├── accessibility.spec.ts
│   └── performance.spec.ts
└── utils/             # Test helpers
```

## Test Categories

### Functional Tests

- **Home Page Tests**: Page rendering, navigation menu, responsive design
- **Navigation Tests**: Routing, 404 handling, browser navigation
- **Authentication Tests**: Login/register forms, validation

### Quality Tests

- **i18n Tests**: Locale switching, translation coverage
- **Accessibility Tests**: ARIA roles, keyboard navigation, screen reader support
- **Performance Tests**: Load times, bundle size, memory leaks

## Writing Tests

### Basic Test Example

```typescript
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Using Page Objects

```typescript
import { HomePage } from '../pages/HomePage';

test('home page test', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate('zh');
  await expect(homePage.mainContent).toBeVisible();
});
```

## Configuration

Configuration file: `playwright.config.ts`

Key settings:

- Base URL: `http://localhost:3200`
- Browsers: Chromium, Firefox, WebKit, Mobile
- Auto-start dev server
- Screenshot/video on failure
- Trace on retry

## CI/CD Integration

GitHub Actions workflow: `.github/workflows/playwright.yml`

Features:

- Runs on push/PR
- Tests across multiple browsers
- Uploads test reports as artifacts
- Parallel execution

## Best Practices

1. Use semantic selectors (`getByRole`, `getByLabel`)
2. Leverage auto-waiting instead of fixed delays
3. Keep tests independent and isolated
4. Use Page Object Models for reusability
5. Test user journeys, not implementation
6. Include accessibility in every test
7. Monitor performance metrics

## Debugging

### UI Mode (Recommended)

```bash
npm run test:e2e:ui
```

Features:

- Time travel debugging
- DOM snapshots
- Network logs
- Trace viewer

### Debug Mode

```bash
npm run test:e2e:debug
```

Use Playwright Inspector to:

- Step through tests
- Inspect selectors
- Edit locators

### Trace Viewer

```bash
npx playwright show-trace test-results/path/to/trace.zip
```

## VS Code Integration

Install the [Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension for:

- Running tests from editor
- Setting breakpoints
- Viewing results inline
- Recording tests

## Troubleshooting

### Tests Timeout

- Increase timeout in config
- Check dev server is running
- Verify network connectivity

### Element Not Found

- Use Playwright Inspector to debug selectors
- Check if element is in frame/shadow DOM
- Verify element exists in DOM

### Flaky Tests

- Use auto-waiting instead of fixed delays
- Ensure proper cleanup between tests
- Check for race conditions

## Resources

### Project Documentation

- [Playwright Documentation Hub](./playwright/README.md) - Central hub for all Playwright docs
- [Quick Start Guide](./playwright/quickstart.md) - Get started quickly
- [Detailed Testing Guide](./playwright/testing-guide.md) - Complete reference
- [Setup Complete Guide](./playwright/setup-complete.md) - Configuration and troubleshooting
- [Installation Summary](./playwright/installation-summary.md) - Installation details
- [E2E Tests Documentation](./playwright/e2e-tests.md) - E2E test code documentation

### External Resources

- [Playwright Official Docs](https://playwright.dev/)
- [API Reference](https://playwright.dev/docs/api/class-playwright)

## Next Steps

1. Review `e2e/example.spec.ts`
2. Run tests with `npm run test:e2e:ui`
3. Write custom tests for your features
4. Integrate into CI/CD pipeline
5. Monitor test results and coverage
