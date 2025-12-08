// @vitest-environment node
import { readFileSync, existsSync } from 'node:fs';
import * as path from 'node:path';

describe('main.tsx Integration Tests', () => {
  beforeAll(() => {
    // Setup test environment
    if (!document.getElementById('root')) {
      const rootElement = document.createElement('div');
      rootElement.id = 'root';
      document.body.appendChild(rootElement);
    }
  });

  afterAll(() => {
    // Clean up DOM
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.remove();
    }
  });

  beforeEach(() => {
    // Clean up root element content
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.innerHTML = '';
    }
  });

  it('should have main.tsx file', () => {
    // Test if file exists
    const mainPath = path.join(process.cwd(), 'src/main.tsx');
    expect(existsSync(mainPath)).toBe(true);
  });

  it('should have main.tsx with correct structure', () => {
    // Test file content structure
    const mainPath = path.join(process.cwd(), 'src/main.tsx');
    const content = readFileSync(mainPath, 'utf-8');

    // Check if it contains necessary imports
    expect(content).toContain('import');
    expect(content).toContain('BootstrapClient');
    expect(content).toContain('createRoot');
  });

  it('should have App.tsx file', () => {
    // Test if App.tsx file exists
    const appPath = path.join(process.cwd(), 'src/App.tsx');
    expect(existsSync(appPath)).toBe(true);
  });

  it('should have BootstrapClient.ts file', () => {
    // Test if BootstrapClient.ts file exists
    const bootstrapPath = path.join(
      process.cwd(),
      'src/core/bootstraps/BootstrapClient.ts'
    );
    expect(existsSync(bootstrapPath)).toBe(true);
  });
});
