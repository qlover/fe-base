# Playwright E2E Testing - Quick Start Guide

## 🎯 快速开始

### 1. 安装依赖

首先，修复 npm 权限问题（如果存在）：

```bash
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"
```

然后安装 Playwright：

```bash
npm install -D @playwright/test playwright
```

安装浏览器驱动：

```bash
npx playwright install
```

### 2. 运行第一个测试

```bash
# 运行示例测试
npm run test:e2e -- e2e/example.spec.ts

# 或者使用 UI 模式（推荐用于开发）
npm run test:e2e:ui
```

### 3. 查看测试报告

```bash
npm run test:e2e:report
```

## 📋 可用的测试脚本

| 命令                        | 说明                           |
| --------------------------- | ------------------------------ |
| `npm run test:e2e`          | 运行所有 E2E 测试              |
| `npm run test:e2e:ui`       | 在 UI 模式下运行（交互式）     |
| `npm run test:e2e:headed`   | 在有头模式下运行（可见浏览器） |
| `npm run test:e2e:debug`    | 在调试模式下运行               |
| `npm run test:e2e:chromium` | 仅在 Chrome 上运行             |
| `npm run test:e2e:firefox`  | 仅在 Firefox 上运行            |
| `npm run test:e2e:webkit`   | 仅在 Safari/WebKit 上运行      |
| `npm run test:e2e:report`   | 查看测试报告                   |

## 📚 测试文件说明

### 已创建的测试套件

1. **`example.spec.ts`** - 验证 Playwright 设置的示例测试
2. **`home.spec.ts`** - 首页功能测试
3. **`navigation.spec.ts`** - 导航和路由测试
4. **`auth.spec.ts`** - 认证流程测试
5. **`i18n.spec.ts`** - 国际化测试
6. **`accessibility.spec.ts`** - 可访问性测试
7. **`performance.spec.ts`** - 性能测试

### Page Object Models

已创建的页面对象模型（位于 `e2e/pages/`）：

- `BasePage.ts` - 基础页面类
- `HomePage.ts` - 首页
- `LoginPage.ts` - 登录页面

## 🔧 常用操作

### 运行特定测试文件

```bash
npx playwright test e2e/tests/home.spec.ts
```

### 运行特定测试用例

```bash
npx playwright test -g "should load and display home page"
```

### 仅运行失败的测试

```bash
npx playwright test --last-failed
```

### 更新快照

```bash
npx playwright test --update-snapshots
```

### 生成代码

```bash
npx playwright codegen http://localhost:3200
```

这将打开浏览器并记录你的操作，自动生成测试代码！

## 🐛 调试技巧

### 1. 使用 UI 模式（推荐）

```bash
npm run test:e2e:ui
```

UI 模式提供：

- 可视化测试执行
- 时间旅行调试
- DOM 快照
- 网络日志

### 2. 使用调试模式

```bash
npm run test:e2e:debug
```

这会打开 Playwright Inspector，允许你：

- 单步执行测试
- 查看选择器
- 编辑定位器

### 3. 在测试中添加断点

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // 添加这一行来暂停执行
  // ... 其他测试代码
});
```

### 4. 查看 Trace

如果测试失败，会自动生成 trace 文件：

```bash
npx playwright show-trace test-results/.../trace.zip
```

## 💡 编写测试的最佳实践

### 1. 使用 Page Object Model

```typescript
import { HomePage } from '../pages/HomePage';

test('example', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate('zh');
  await expect(homePage.mainContent).toBeVisible();
});
```

### 2. 使用语义化选择器

```typescript
// ✅ 好的做法
await page.getByRole('button', { name: '登录' });
await page.getByLabel('用户名');
await page.getByTestId('submit-button');

// ❌ 避免
await page.locator('.btn-primary');
await page.locator('#username');
```

### 3. 等待元素而不是固定延迟

```typescript
// ✅ 好的做法
await page.waitForSelector('[data-testid="content"]');
await expect(page.locator('.result')).toBeVisible();

// ❌ 避免
await page.waitForTimeout(3000);
```

### 4. 保持测试独立

```typescript
test.describe('Feature Tests', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前重置状态
    await page.goto('/');
  });

  test('test 1', async ({ page }) => {
    // 这个测试不依赖其他测试
  });

  test('test 2', async ({ page }) => {
    // 这个测试也不依赖其他测试
  });
});
```

## 🎨 自定义配置

### 修改基础 URL

在 `playwright.config.ts` 中：

```typescript
use: {
  baseURL: 'http://localhost:3000', // 修改为你的端口
}
```

或使用环境变量：

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
```

### 添加新的浏览器配置

在 `playwright.config.ts` 的 `projects` 数组中添加：

```typescript
{
  name: 'Mobile Safari',
  use: { ...devices['iPhone 12'] }
}
```

### 配置超时时间

```typescript
// 全局超时
test.setTimeout(60000); // 60 秒

// 单个测试
test('slow test', async ({ page }) => {
  test.setTimeout(120000); // 120 秒
  // ... 测试代码
});
```

## 📊 CI/CD 集成

项目已包含 GitHub Actions 配置文件（`.github/workflows/playwright.yml`）。

推送代码到 GitHub 后，测试会自动运行。

## 🆘 常见问题

### Q: 测试超时

**A:** 增加 `playwright.config.ts` 中的 `timeout` 设置，或检查开发服务器是否正常运行。

### Q: 找不到元素

**A:** 使用 Playwright Inspector 检查选择器：

```bash
npm run test:e2e:debug
```

### Q: 测试不稳定（flaky）

**A:**

- 使用自动等待而非固定延迟
- 使用 `waitForLoadState('networkidle')`
- 检查是否有竞态条件

### Q: 浏览器安装失败

**A:**

```bash
# 强制重新安装
npx playwright install --force

# Linux 上安装依赖
npx playwright install-deps
```

## 📖 更多资源

- [详细测试指南](./testing-guide.md)
- [设置完成文档](./setup-complete.md)
- [安装摘要](./installation-summary.md)
- [Playwright 官方文档](https://playwright.dev/)
- [Playwright 最佳实践](https://playwright.dev/docs/best-practices)
- [Playwright API 参考](https://playwright.dev/docs/api/class-playwright)

## ✅ 验证安装

运行以下命令验证一切正常：

```bash
# 1. 运行示例测试
npm run test:e2e -- e2e/example.spec.ts

# 2. 如果成功，尝试运行所有测试
npm run test:e2e

# 3. 查看报告
npm run test:e2e:report
```

如果所有测试都通过了，恭喜！你已经成功设置了 Playwright E2E 测试！🎉

## 🚀 下一步

1. 查看 `e2e/example.spec.ts` 了解基本测试结构
2. 阅读 [详细测试指南](./testing-guide.md) 了解更多信息
3. 使用 `npm run test:e2e:ui` 以交互方式探索测试
4. 根据你的应用需求编写自定义测试

祝测试愉快！
