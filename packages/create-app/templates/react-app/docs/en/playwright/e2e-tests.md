# E2E Testing with Playwright

This directory contains end-to-end (E2E) tests for the React application using [Playwright](https://playwright.dev/).

## 📁 Directory Structure

```
e2e/
├── fixtures/           # Custom test fixtures
│   └── base.fixture.ts
├── pages/             # Page Object Models
│   ├── BasePage.ts
│   ├── HomePage.ts
│   └── LoginPage.ts
├── tests/             # Test files
│   ├── home.spec.ts
│   ├── navigation.spec.ts
│   ├── auth.spec.ts
│   ├── i18n.spec.ts
│   ├── accessibility.spec.ts
│   └── performance.spec.ts
└── utils/             # Test utilities
    └── test-helpers.ts
```

## 🚀 Getting Started

### Installation

First, install Playwright and its dependencies:

```bash
# Install Playwright
npm install -D @playwright/test playwright

# Install browsers (this may take a few minutes)
npx playwright install
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run tests for specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# View test report
npm run test:e2e:report
```

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test e2e/tests/home.spec.ts

# Run tests matching a pattern
npx playwright test e2e/tests/auth

# Run a specific test by name
npx playwright test -g "should load and display home page"
```

## 📝 Test Categories

### 1. Home Page Tests (`home.spec.ts`)

- Page loading and rendering
- Navigation menu functionality
- Responsive design testing
- Locale handling

### 2. Navigation Tests (`navigation.spec.ts`)

- Inter-page navigation
- 404 page handling
- Browser back/forward navigation
- State persistence during navigation

### 3. Authentication Tests (`auth.spec.ts`)

- Login form validation
- Form submission
- Navigation to register page
- Keyboard navigation support

### 4. Internationalization Tests (`i18n.spec.ts`)

- Locale switching
- Translation coverage
- Locale persistence
- Invalid locale handling

### 5. Accessibility Tests (`accessibility.spec.ts`)

- Document structure
- Heading hierarchy
- Alt text for images
- Form labels
- Keyboard navigation
- ARIA roles

### 6. Performance Tests (`performance.spec.ts`)

- Page load time
- First Contentful Paint
- Bundle size
- Lazy loading
- Memory leak detection

## 🏗️ Writing Tests

### Using Page Object Model

```typescript
import { test, expect } from '../fixtures/base.fixture';
import { HomePage } from '../pages/HomePage';

test('example test', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate('zh');
  await expect(homePage.mainContent).toBeVisible();
});
```

### Using Test Helpers

```typescript
import { waitForAppReady, navigateToLocalePath } from '../utils/test-helpers';

test('example with helpers', async ({ page }) => {
  await navigateToLocalePath(page, '/about', 'en');
  await waitForAppReady(page);
  // ... rest of test
});
```

### Custom Fixtures

```typescript
// In fixtures/base.fixture.ts
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Setup authenticated state
    await page.goto('/login');
    // ... perform login
    await use(page);
  }
});
```

## 🔧 Configuration

Test configuration is located in `playwright.config.ts` at the project root.

Key settings:

- **Base URL**: `http://localhost:3200` (automatically starts dev server)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Reporters**: HTML, JSON, List
- **Retry**: 2 times on CI, 0 times locally
- **Screenshots**: On failure
- **Videos**: Retained on failure
- **Traces**: On first retry

## 📊 Test Reports

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

Or open the report file directly:

```bash
open playwright-report/index.html
```

## 🐛 Debugging Tests

### Debug Mode

```bash
npm run test:e2e:debug
```

This opens the Playwright Inspector where you can:

- Step through tests
- See browser actions
- Inspect selectors
- View console logs

### VS Code Extension

Install the [Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) extension for:

- Running tests from the editor
- Setting breakpoints
- Viewing test results inline

### Trace Viewer

If a test fails, traces are automatically recorded. View them with:

```bash
npx playwright show-trace test-results/path-to-trace.zip
```

## 📸 Screenshots

Screenshots are automatically captured on test failure. Manual screenshots can be taken using:

```typescript
await page.screenshot({ path: 'e2e/screenshots/my-screenshot.png' });
```

Or using the helper:

```typescript
import { takeScreenshot } from '../utils/test-helpers';

await takeScreenshot(page, 'my-screenshot');
```

## 🌍 Environment Variables

- `PLAYWRIGHT_BASE_URL`: Override the base URL (default: `http://localhost:3200`)
- `CI`: Set to enable CI-specific settings (retries, parallel execution)

Example:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

## 🔄 Continuous Integration

### GitHub Actions

A sample GitHub Actions workflow is provided in `.github/workflows/playwright.yml`.

The workflow:

1. Installs dependencies
2. Installs Playwright browsers
3. Runs tests
4. Uploads test reports as artifacts

## 📚 Best Practices

1. **Use Page Object Models** for reusable page interactions
2. **Use meaningful test names** that describe what is being tested
3. **Avoid hard-coded waits** - use Playwright's auto-waiting
4. **Test user journeys** not implementation details
5. **Keep tests isolated** - each test should be independent
6. **Use data-testid** attributes for stable selectors
7. **Test accessibility** alongside functionality
8. **Monitor performance** with performance tests

## 🔗 Useful Links

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Playwright Selectors](https://playwright.dev/docs/selectors)
- [Playwright Assertions](https://playwright.dev/docs/test-assertions)

## 🆘 Troubleshooting

### Tests timing out

- Increase timeout in `playwright.config.ts`
- Check if the dev server is running
- Ensure no network issues

### Selector not found

- Use Playwright Inspector to debug selectors
- Check if element is in a frame or shadow DOM
- Verify the element exists in the DOM

### Flaky tests

- Avoid hardcoded waits - use `waitFor*` methods
- Ensure proper cleanup between tests
- Check for race conditions
- Use `test.describe.serial` for dependent tests

### Browser installation issues

```bash
# Reinstall browsers
npx playwright install --force

# Install browser dependencies (Linux)
npx playwright install-deps
```

## 💡 Tips

1. Use `--ui` mode for developing tests interactively
2. Use `--debug` mode to step through failing tests
3. Use `--headed` mode to see what the browser is doing
4. Use `--trace on` to record traces for all tests
5. Use `--project` to run tests on specific browsers
6. Use grep patterns to run specific tests: `-g "pattern"`
