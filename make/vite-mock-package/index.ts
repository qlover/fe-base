import { readdirSync } from 'fs';
import { join, resolve } from 'path';
import { Plugin } from 'vite';
import { WorkspaceCreator } from '../../packages/fe-release/src/plugins/workspaces/WorkspaceCreator';
import { AliasOptions } from 'vite';

export type ViteMockPackageOptions = {
  root?: string;
  onlyPackages?: string[];
  packagesRoot?: string;
  mockDirname?: string;
};

export function parsePackagesMap(opts: ViteMockPackageOptions = {}) {
  const {
    onlyPackages,
    root = process.cwd(),
    packagesRoot = 'packages',
    mockDirname = '__mocks__'
  } = opts;

  const packages = readdirSync(resolve(root, packagesRoot));

  const targetPackages =
    Array.isArray(onlyPackages) && onlyPackages.length > 0
      ? packages.filter((path) => onlyPackages.includes(path))
      : packages;

  const workspaces = targetPackages
    .map((path) => join(packagesRoot, path))
    .map((path) => WorkspaceCreator.toWorkspace({ path }, root))
    .filter(Boolean);

  return workspaces.reduce((acc, workspace) => {
    acc[workspace.name] = join(workspace.root, mockDirname);
    return acc;
  }, {} as AliasOptions);
}

export default (opts: ViteMockPackageOptions = {}): Plugin => {
  return {
    name: 'vite-mock-package',
    config(userConfig) {
      return {
        test: {
          alias: {
            ...userConfig.test?.alias,
            ...parsePackagesMap(opts)
          }
        }
      };
    }
  };
};
