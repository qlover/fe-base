/**
 * Replace workspace:* in package.json with latest version from npm registry.
 * On fetch failure, use "latest" as the version.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const NPM_REGISTRY = 'https://registry.npmjs.org';

const DEP_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies'
] as const;

function npmRegistryUrl(packageName: string): string {
  const pathSegment = packageName.includes('/')
    ? packageName.replace('/', '%2F')
    : encodeURIComponent(packageName);
  return `${NPM_REGISTRY}/${pathSegment}/latest`;
}

/**
 * Fetch latest version from npm registry. Returns "latest" on any failure.
 */
export async function getLatestVersion(packageName: string): Promise<string> {
  try {
    const url = npmRegistryUrl(packageName);
    const res = await fetch(url);
    if (!res.ok) return 'latest';
    const data = (await res.json()) as { version?: string };
    return typeof data?.version === 'string' ? data.version : 'latest';
  } catch {
    return 'latest';
  }
}

/**
 * Process a single package.json: replace all workspace:* with resolved version or "latest".
 */
export async function resolvePackageJson(filePath: string): Promise<void> {
  const content = readFileSync(filePath, 'utf-8');
  let pkg: Record<string, unknown>;
  try {
    pkg = JSON.parse(content) as Record<string, unknown>;
  } catch {
    return;
  }

  let changed = false;
  for (const field of DEP_FIELDS) {
    const deps = pkg[field] as Record<string, string> | undefined;
    if (!deps || typeof deps !== 'object') continue;
    for (const name of Object.keys(deps)) {
      if (deps[name] !== 'workspace:*') continue;
      const version = await getLatestVersion(name);
      deps[name] = version;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(filePath, JSON.stringify(pkg, null, 2), 'utf-8');
  }
}

/**
 * Find all package.json under dir (skip node_modules) and resolve workspace:* in each.
 */
export async function resolveWorkspaceDepsInDir(dir: string): Promise<void> {
  const items = readdirSync(dir);
  for (const item of items) {
    if (item === 'node_modules') continue;
    const full = join(dir, item);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      await resolveWorkspaceDepsInDir(full);
    } else if (item === 'package.json') {
      await resolvePackageJson(full);
    }
  }
}
