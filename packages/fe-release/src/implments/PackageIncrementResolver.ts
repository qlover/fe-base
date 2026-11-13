/**
 * @module PackageIncrementResolver
 * @description 按包名、目录、目录名解析单独的 semver increment
 *
 * 查找顺序：包名，其次包目录，再次目录名。
 */
import type { WorkspaceInterface } from '../interface/WorkspaceInterface';
import {
  VersionIncrement,
  type PackageIncrementResolverInterface,
  type PackageIncrementSource,
  type VersionIncrementType
} from '../interface/PackageIncrementResolverInterface';

/**
 * 从 `packageIncrements` 对照表为单个包取出 increment。
 */
export class PackageIncrementResolver
  implements PackageIncrementResolverInterface
{
  private readonly increments: ReadonlyMap<string, VersionIncrementType>;

  constructor(source: PackageIncrementSource) {
    this.increments = collectPackageIncrements(source.packageIncrements);
  }

  /**
   * @override
   */
  public resolve(
    workspace: Pick<WorkspaceInterface, 'name' | 'path'>
  ): VersionIncrementType | undefined {
    const directoryName = workspace.path.split(/[/\\]/).filter(Boolean).pop();
    const keys = [workspace.name, workspace.path, directoryName].filter(
      (key): key is string => typeof key === 'string' && key.length > 0
    );

    for (const key of keys) {
      const increment = this.increments.get(key);
      if (increment) {
        return increment;
      }
    }

    return undefined;
  }
}

function collectPackageIncrements(
  packageIncrements: Readonly<Record<string, string>> | undefined
): ReadonlyMap<string, VersionIncrementType> {
  const increments = new Map<string, VersionIncrementType>();

  for (const [key, raw] of Object.entries(packageIncrements ?? {})) {
    const target = key.trim();
    if (!target) {
      continue;
    }
    increments.set(target, assertVersionIncrement(raw, target));
  }

  return increments;
}

function assertVersionIncrement(
  value: string,
  target: string
): VersionIncrementType {
  if (
    value === VersionIncrement.patch ||
    value === VersionIncrement.minor ||
    value === VersionIncrement.major
  ) {
    return value;
  }

  throw new Error(
    `Invalid package increment "${value}" for "${target}". Must be patch, minor, or major`
  );
}
