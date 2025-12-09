import { createMockGlobals } from '__tests__/__mocks__/createMockGlobals';

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
vi.mock('@/core/globals', () => createMockGlobals());

// Mock i18next-http-backend to avoid network requests in tests
// This prevents timeout issues when I18nService tries to load language files
// The mock loads translations directly from JSON files, enabling translation testing
vi.mock('i18next-http-backend', async () => {
  const { MockHttpBackend } = await import('@__mocks__/i18nextHttpBackend');
  return { default: MockHttpBackend };
});

// Mock i18next-browser-languagedetector to avoid browser API calls
vi.mock('i18next-browser-languagedetector', () => ({
  default: {}
}));
