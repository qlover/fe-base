import { readFileSync } from 'fs';

export function readJson(path: string) {
  return ReadJson.read(path);
}

export class ReadJson {
  static read(path: string): Record<string, unknown> {
    const packageJson = readFileSync(path, 'utf8');
    return JSON.parse(packageJson);
  }
}
