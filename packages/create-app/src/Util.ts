import { existsSync, mkdirSync } from 'fs';

export class Util {
  static ensureDir(dir: string): void {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }
}
