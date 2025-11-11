# Playwright E2E 测试详细指南

本指南包含了完整的 E2E 测试文档，包括测试架构、编写测试、调试技巧和最佳实践。

## 📑 目录

1. [测试架构](#测试架构)
2. [编写测试](#编写测试)
3. [Page Object Model](#page-object-model)
4. [调试测试](#调试测试)
5. [最佳实践](#最佳实践)
6. [CI/CD 集成](#cicd-集成)
7. [常见问题](#常见问题)

## 测试架构

### 目录结构

```
e2e/
├── fixtures/           # 自定义测试固件
├── pages/             # Page Object Models
├── tests/             # 测试规范
└── utils/             # 测试辅助工具
```

### 测试分类

#### 1. 功能测试

- **home.spec.ts**: 首页功能测试
- **navigation.spec.ts**: 导航和路由测试
- **auth.spec.ts**: 认证流程测试

#### 2. 质量测试

- **i18n.spec.ts**: 国际化和本地化测试
- **accessibility.spec.ts**: 可访问性测试
- **performance.spec.ts**: 性能和优化测试

## 编写测试

### 基础测试结构

```typescript
import { test, expect } from '@playwright/test';

test.describe('功能名称', () => {
  test.beforeEach(async ({ page }) => {
    // 每个测试前的设置
    await page.goto('/');
  });

  test('测试用例描述', async ({ page }) => {
    // 测试步骤
    await page.click('button');

    // 断言
    await expect(page.locator('.result')).toBeVisible();
  });
});
```

### 使用自定义 Fixture

```typescript
import { test, expect } from '../fixtures/base.fixture';

test('使用自定义 fixture', async ({ page }) => {
  // 可以在这里使用扩展的 fixtures
});
```

### 选择器最佳实践

#### 推荐的选择器（按优先级）

1. **角色选择器** - 最接近用户体验

```typescript
await page.getByRole('button', { name: '提交' });
await page.getByRole('link', { name: '首页' });
await page.getByRole('textbox', { name: '用户名' });
```

2. **标签选择器** - 适用于表单元素

```typescript
await page.getByLabel('电子邮件');
await page.getByLabel('密码');
```

3. **占位符选择器**

```typescript
await page.getByPlaceholder('输入您的邮箱');
```

4. **文本选择器**

```typescript
await page.getByText('欢迎回来');
```

5. **测试ID选择器** - 最稳定

```typescript
await page.getByTestId('submit-button');
```

#### 避免使用的选择器

```typescript
// ❌ CSS 类名 - 容易变化
await page.locator('.btn-primary');

// ❌ CSS ID - 可能不唯一
await page.locator('#submit');

// ❌ XPath - 难以维护
await page.locator('//div[@class="container"]/button[1]');
```

## Page Object Model

### 创建 Page Object

```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  readonly heading: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.locator('h1');
    this.submitButton = page.getByRole('button', { name: '提交' });
  }

  async navigate() {
    await this.goto('/my-page', 'zh');
    await this.waitForReady();
  }

  async submit() {
    await this.submitButton.click();
    await this.page.waitForLoadState('networkidle');
  }
}
```

### 使用 Page Object

```typescript
import { test, expect } from '../fixtures/base.fixture';
import { MyPage } from '../pages/MyPage';

test('使用 Page Object', async ({ page }) => {
  const myPage = new MyPage(page);
  await myPage.navigate();
  await myPage.submit();
  await expect(myPage.heading).toContainText('成功');
});
```

## 调试测试

### 1. UI 模式 (推荐)

最强大的调试工具：

```bash
npm run test:e2e:ui
```

功能：

- 时间旅行调试
- 查看每个步骤的 DOM 快照
- 网络请求日志
- 测试代码高亮
- 实时编辑选择器

### 2. 调试模式

逐步执行测试：

```bash
npm run test:e2e:debug
```

在代码中添加断点：

```typescript
test('调试示例', async ({ page }) => {
  await page.goto('/');
  await page.pause(); // 暂停执行
  // ... 其他代码
});
```

### 3. Trace Viewer

查看失败测试的 trace：

```bash
npx playwright show-trace test-results/path/to/trace.zip
```

### 4. 截图和视频

自动捕获（已配置）：

- 失败时自动截图
- 失败时保留视频
- 重试时记录 trace

手动截图：

```typescript
await page.screenshot({ path: 'screenshot.png' });
await page.screenshot({ path: 'full-page.png', fullPage: true });
```

### 5. 控制台日志

查看浏览器控制台：

```typescript
page.on('console', (msg) => console.log(msg.text()));
page.on('pageerror', (err) => console.log(err.message));
```

## 最佳实践

### 1. 等待策略

#### ✅ 使用自动等待

```typescript
// Playwright 自动等待元素可见和可操作
await page.click('button');
await expect(page.locator('.result')).toBeVisible();
```

#### ❌ 避免固定延迟

```typescript
// 不推荐
await page.waitForTimeout(3000);

// 推荐
await page.waitForLoadState('networkidle');
await page.waitForSelector('.loaded');
```

### 2. 测试隔离

每个测试应该独立：

```typescript
test.describe('测试组', () => {
  test.beforeEach(async ({ page }) => {
    // 重置状态
    await page.goto('/');
    // 清除存储
    await page.context().clearCookies();
  });

  test('测试 1', async ({ page }) => {
    // 不依赖其他测试
  });

  test('测试 2', async ({ page }) => {
    // 独立运行
  });
});
```

### 3. 断言最佳实践

```typescript
// ✅ 使用 web-first 断言（自动重试）
await expect(page.locator('.status')).toHaveText('成功');
await expect(page).toHaveURL(/dashboard/);

// ❌ 避免非重试断言
const text = await page.locator('.status').textContent();
expect(text).toBe('成功'); // 不会重试
```

### 4. 测试数据管理

```typescript
// 使用常量
const TEST_USER = {
  username: 'testuser',
  password: 'password123'
};

// 使用工具函数生成测试数据
import { generateTestUser } from '../utils/test-data';

test('注册测试', async ({ page }) => {
  const user = generateTestUser();
  // 使用生成的数据
});
```

### 5. 处理异步操作

```typescript
// 等待网络请求
await Promise.all([
  page.waitForResponse((resp) => resp.url().includes('/api/data')),
  page.click('button')
]);

// 等待导航
await Promise.all([
  page.waitForNavigation(),
  page.click('a[href="/next-page"]')
]);
```

## CI/CD 集成

### GitHub Actions 配置

已包含的 `.github/workflows/playwright.yml` 提供：

- 多浏览器矩阵测试
- 自动安装依赖
- 并行执行
- 测试报告上传
- 失败时的调试信息

### 环境变量

```bash
# 设置基础 URL
PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e

# CI 模式
CI=true npm run test:e2e
```

### 配置 CI 优化

在 `playwright.config.ts` 中：

```typescript
export default defineConfig({
  // CI 模式下重试失败的测试
  retries: process.env.CI ? 2 : 0,

  // CI 模式下禁用并行
  workers: process.env.CI ? 1 : undefined,

  // CI 模式下必须通过所有测试
  forbidOnly: !!process.env.CI
});
```

## 常见问题

### Q: 测试超时怎么办？

**A:** 增加超时时间或检查原因：

```typescript
// 全局增加超时
test.setTimeout(60000);

// 单个测试增加
test('慢速测试', async ({ page }) => {
  test.setTimeout(120000);
  // ...
});

// 检查是否是网络问题
await page.goto('/', { waitUntil: 'networkidle' });
```

### Q: 元素找不到？

**A:** 使用调试工具：

```bash
# 使用 UI 模式查看
npm run test:e2e:ui

# 使用选择器生成器
npx playwright codegen http://localhost:3200
```

### Q: 测试不稳定（flaky）？

**A:** 常见原因和解决方案：

1. **时序问题**

```typescript
// 等待元素稳定
await expect(page.locator('.element')).toBeVisible();
await expect(page.locator('.element')).toHaveText('expected');
```

2. **动画和过渡**

```typescript
// 等待动画完成
await page.waitForLoadState('networkidle');
```

3. **竞态条件**

```typescript
// 使用 Promise.all 等待多个操作
await Promise.all([page.waitForResponse('/api/data'), page.click('button')]);
```

### Q: 如何处理弹窗和对话框？

**A:** 监听和处理：

```typescript
// 处理 alert
page.on('dialog', (dialog) => dialog.accept());

// 处理确认框
page.on('dialog', async (dialog) => {
  console.log(dialog.message());
  await dialog.accept();
});

// 新窗口
const [newPage] = await Promise.all([
  context.waitForEvent('page'),
  page.click('a[target="_blank"]')
]);
```

### Q: 如何测试文件上传？

**A:** 使用 setInputFiles：

```typescript
await page.setInputFiles('input[type="file"]', 'path/to/file.pdf');

// 多文件
await page.setInputFiles('input[type="file"]', ['file1.pdf', 'file2.pdf']);
```

### Q: 如何测试拖放？

**A:** 使用 dragTo：

```typescript
await page.locator('.draggable').dragTo(page.locator('.drop-zone'));
```

## 进阶主题

### 测试钩子和配置

```typescript
// 全局设置
test.beforeAll(async () => {
  // 所有测试前运行一次
});

test.afterAll(async () => {
  // 所有测试后运行一次
});

test.beforeEach(async ({ page }) => {
  // 每个测试前运行
});

test.afterEach(async ({ page }) => {
  // 每个测试后运行
});
```

### 自定义 Fixtures

在 `e2e/fixtures/base.fixture.ts` 中添加：

```typescript
export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // 执行登录
    await page.goto('/login');
    await page.fill('[name="username"]', 'user');
    await page.fill('[name="password"]', 'pass');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // 提供给测试使用
    await use(page);

    // 清理（可选）
    await page.close();
  }
});
```

使用自定义 fixture：

```typescript
test('需要认证的测试', async ({ authenticatedPage }) => {
  // authenticatedPage 已经登录
  await expect(authenticatedPage).toHaveURL('/dashboard');
});
```

### 测试标记和过滤

```typescript
// 标记测试
test('快速测试', { tag: '@fast' }, async ({ page }) => {
  // ...
});

test('慢速测试', { tag: '@slow' }, async ({ page }) => {
  // ...
});
```

运行特定标记：

```bash
npx playwright test --grep @fast
npx playwright test --grep-invert @slow
```

## 资源和链接

### 项目文档

- [快速入门](./quickstart.md)
- [设置完成](./setup-complete.md)
- [安装摘要](./installation-summary.md)
- [E2E README](../../e2e/README.md)

### 官方资源

- [Playwright 文档](https://playwright.dev/)
- [API 参考](https://playwright.dev/docs/api/class-playwright)
- [最佳实践](https://playwright.dev/docs/best-practices)
- [选择器指南](https://playwright.dev/docs/selectors)
- [调试指南](https://playwright.dev/docs/debug)

### 社区资源

- [Playwright GitHub](https://github.com/microsoft/playwright)
- [Discord 社区](https://discord.gg/playwright)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/playwright)

---

编写测试愉快！如有问题，请参考相关文档或访问 Playwright 官方文档。
