// Force development so React exposes act() when running from IDE (e.g. Cursor Vitest plugin)
process.env.NODE_ENV = 'development';

import 'reflect-metadata';
import { createMockGlobals } from './__mocks__/createMockGlobals';

// Tell React we are in a test environment that supports act()
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// 设置测试环境
beforeEach(() => {
  // 清理DOM
  document.body.innerHTML = '';

  // 创建root元素（如果不存在）
  if (!document.getElementById('root')) {
    const rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);
  }
});

afterEach(() => {
  // 清理所有mock
  vi.clearAllMocks();
});

// 全局测试配置
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock globals
vi.mock('@/globals', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/globals')>();
  const mock = createMockGlobals();
  return {
    ...actual,
    ...mock,
    length: undefined
  };
});
