import { MANIFEST_PATH } from '../defaults';
import type { WorkspaceInterface } from '../interface/WorkspaceInterface';
import type { PackageJson } from '../type';
import { worksapce2name } from '../utils/createWorkspace';

export type WorkspaceValueOptions = WorkspaceInterface & {
  /**
   * The manifest path of the workspace
   * @default 'package.json'
   */
  manifestPath?: string;

  /**
   * The package path of the workspace
   */
  packagePath?: string;
};

export class WorkspaceValue implements WorkspaceInterface {
  protected manifestPath: string = MANIFEST_PATH;
  protected packagePath: string = '';

  public name: string;
  public version: string;
  public newVersion?: string;
  public path: string;
  public root: string;
  public packageJson: PackageJson;
  public tagName?: string;
  public lastTag?: string;
  public changelog?: string;
  public dependencyRelease?: boolean;

  constructor(options: WorkspaceValueOptions) {
    Object.assign(this, options);
    this.name = options.name;
    this.version = options.version;
    this.newVersion = options.newVersion;
    this.path = options.path;
    this.root = options.root;
    this.packageJson = options.packageJson;
  }

  public static toWorkspace(workspace: WorkspaceValueOptions): WorkspaceValue {
    return new WorkspaceValue(workspace);
  }

  public toString(): string {
    let result = '';
    if (typeof this.dependencyRelease === 'boolean') {
      result += this.dependencyRelease ? '(DEP)' : '';
    }

    result += worksapce2name(this);

    result += ` path=${this.packagePath ?? this.root}`;

    if (this.tagName) {
      result += ` tag=${this.tagName}`;
    }

    if (this.lastTag) {
      result += ` lastTag=${this.lastTag}`;
    }

    if (this.newVersion && this.newVersion !== this.version) {
      result += ` newVersion=${this.newVersion}`;
    }

    return result;
  }
}
