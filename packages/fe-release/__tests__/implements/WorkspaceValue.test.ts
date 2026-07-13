import { describe, it, expect } from 'vitest';
import { WorkspaceValue } from '../../src/implments/WorkspaceValue';

describe('WorkspaceValue', () => {
  const baseOptions = {
    name: 'pkg-a',
    version: '1.0.0',
    path: 'packages/a',
    root: '/repo/packages/a',
    packageJson: { name: 'pkg-a', version: '1.0.0' }
  };

  it('should create via toWorkspace factory', () => {
    const workspace = WorkspaceValue.toWorkspace(baseOptions);
    expect(workspace.name).toBe('pkg-a');
    expect(workspace.version).toBe('1.0.0');
  });

  it('should format basic toString output', () => {
    const workspace = new WorkspaceValue({
      ...baseOptions,
      packagePath: '/repo/packages/a/package.json'
    });
    expect(workspace.toString()).toBe(
      'pkg-a@1.0.0 path=/repo/packages/a/package.json'
    );
  });

  it('should include dependency-release prefix in toString', () => {
    const workspace = new WorkspaceValue({
      ...baseOptions,
      dependencyRelease: true
    });

    expect(workspace.toString()).toContain('(DEP)');
  });

  it('should include tag and version bump details in toString', () => {
    const workspace = new WorkspaceValue({
      ...baseOptions,
      lastTag: 'pkg-a@1.0.0',
      tagName: 'pkg-a@1.0.1',
      newVersion: '1.0.1'
    });

    const output = workspace.toString();
    expect(output).toContain('lastTag=pkg-a@1.0.0');
    expect(output).toContain('tag=pkg-a@1.0.1');
    expect(output).toContain('newVersion=1.0.1');
  });
});
