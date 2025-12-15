import { existsSync, mkdirSync } from 'fs';

export class Util {
  public static ensureDir(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}
