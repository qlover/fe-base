export type ReleaseLabelCompare = (
  changedFilePath: string,
  packagePath: string
) => boolean;

export interface ReleaseLabelOptions {
  /**
   * The change packages label
   */
  changePackagesLabel: string;

  /**
   * The packages directories
   */
  packagesDirectories: string[];

  compare?: ReleaseLabelCompare;
}

export class ReleaseLabel {
  constructor(private readonly options: ReleaseLabelOptions) {}

  compare(changedFilePath: string, packagePath: string): boolean {
    if (typeof this.options.compare === 'function') {
      return this.options.compare(changedFilePath, packagePath);
    }

    return changedFilePath.startsWith(packagePath);
  }

  toChangeLabel(
    packagePath: string,
    label: string = this.options.changePackagesLabel
  ): string {
    return label.replace('${name}', packagePath);
  }

  toChangeLabels(
    packages: string[],
    label: string = this.options.changePackagesLabel
  ): string[] {
    return packages.map((pkg) => this.toChangeLabel(pkg, label));
  }

  pick(
    changedFiles: Array<string> | Set<string>,
    packages: string[] = this.options.packagesDirectories
  ): string[] {
    const result: string[] = [];

    for (const pkgPath of packages) {
      for (const filepath of changedFiles) {
        if (this.compare(filepath, pkgPath)) {
          result.push(pkgPath);
          break;
        }
      }
    }

    return result;
  }
}
