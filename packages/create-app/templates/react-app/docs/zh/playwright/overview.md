# Playwright E2E 测试指南

## 概述

本项目包含使用 [Playwright](https://playwright.dev/) 的完整端到端（E2E）测试，这是一个现代化的测试框架，能够在所有主流浏览器上进行可靠的测试。

## 功能特性

- ✅ 多浏览器测试（Chromium、Firefox、WebKit）
- ✅ 移动浏览器模拟
- ✅ 页面对象模型（POM）架构
- ✅ 全面的测试覆盖
- ✅ 失败时自动截图和录制视频
- ✅ 与 GitHub Actions 的 CI/CD 集成
- ✅ 可访问性测试
- ✅ 性能测试
- ✅ 国际化测试

## 快速开始

### 安装

```bash
# 如需要，修复 npm 权限问题
sudo chown -R $(id -u):$(id -g) "$HOME/.npm"

# 安装 Playwright
npm install -D @playwright/test playwright

# 安装浏览器
npx playwright install
```

### 运行测试

```bash
# 运行所有测试
npm run test:e2e

# 交互式 UI 模式（推荐）
npm run test:e2e:ui

# 调试模式
npm run test:e2e:debug

# 查看报告
npm run test:e2e:report
```

## 测试结构

```
e2e/
├── fixtures/           # 自定义测试固件
├── pages/             # 页面对象模型
├── tests/             # 测试规范
│   ├── home.spec.ts          # 首页测试
│   ├── navigation.spec.ts    # 导航测试
│   ├── auth.spec.ts          # 认证测试
│   ├── i18n.spec.ts          # 国际化测试
│   ├── accessibility.spec.ts # 可访问性测试
│   └── performance.spec.ts   # 性能测试
└── utils/             # 测试辅助工具
```

## 测试类别

### 功能测试

- **首页测试**：页面渲染、导航菜单、响应式设计
- **导航测试**：路由、404 处理、浏览器导航
- **认证测试**：登录/注册表单、验证

### 质量测试

- **国际化测试**：语言切换、翻译覆盖
- **可访问性测试**：ARIA 角色、键盘导航、屏幕阅读器支持
- **性能测试**：加载时间、包大小、内存泄漏

## 编写测试

### 基本测试示例

```typescript
import { test, expect } from '@playwright/test';

test('示例测试', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

### 使用页面对象

```typescript
import { HomePage } from '../pages/HomePage';

test('首页测试', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.navigate('zh');
  await expect(homePage.mainContent).toBeVisible();
});
```

## 配置

配置文件：`playwright.config.ts`

主要设置：

- 基础 URL：`http://localhost:3200`
- 浏览器：Chromium、Firefox、WebKit、移动端
- 自动启动开发服务器
- 失败时截图/录像
- 重试时跟踪

## CI/CD 集成

GitHub Actions 工作流：`.github/workflows/playwright.yml`

功能：

- 在推送/PR 时运行
- 跨多个浏览器测试
- 上传测试报告作为工件
- 并行执行

## 最佳实践

1. 使用语义化选择器（`getByRole`、`getByLabel`）
2. 利用自动等待而非固定延迟
3. 保持测试独立和隔离
4. 使用页面对象模型提高可重用性
5. 测试用户旅程，而非实现细节
6. 在每个测试中包含可访问性检查
7. 监控性能指标

## 调试

### UI 模式（推荐）

```bash
npm run test:e2e:ui
```

功能：

- 时间旅行调试
- DOM 快照
- 网络日志
- 跟踪查看器

### 调试模式

```bash
npm run test:e2e:debug
```

使用 Playwright Inspector：

- 单步执行测试
- 检查选择器
- 编辑定位器

### 跟踪查看器

```bash
npx playwright show-trace test-results/path/to/trace.zip
```

## VS Code 集成

安装 [Playwright Test for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright) 扩展以获得：

- 从编辑器运行测试
- 设置断点
- 内联查看结果
- 录制测试

## 故障排除

### 测试超时

- 在配置中增加超时时间
- 检查开发服务器是否运行
- 验证网络连接

### 找不到元素

- 使用 Playwright Inspector 调试选择器
- 检查元素是否在 frame/shadow DOM 中
- 验证元素是否存在于 DOM 中

### 测试不稳定

- 使用自动等待而非固定延迟
- 确保测试之间正确清理
- 检查竞态条件

## 资源

### 项目文档

- [Playwright 文档中心](./playwright/README.md) - 所有 Playwright 文档的入口
- [快速入门指南](./playwright/quickstart.md) - 快速上手
- [详细测试指南](./playwright/testing-guide.md) - 完整参考
- [设置完成指南](./playwright/setup-complete.md) - 配置和故障排除
- [安装摘要](./playwright/installation-summary.md) - 安装详情
- [E2E 测试文档](./playwright/e2e-tests.md) - E2E 测试代码文档

### 外部资源

- [Playwright 官方文档](https://playwright.dev/)
- [API 参考](https://playwright.dev/docs/api/class-playwright)

## 下一步

1. 查看 `e2e/example.spec.ts`
2. 使用 `npm run test:e2e:ui` 运行测试
3. 为你的功能编写自定义测试
4. 集成到 CI/CD 管道
5. 监控测试结果和覆盖率
