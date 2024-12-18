declare module 'shelljs';
declare module 'commitizen/dist/cli/git-cz.js' {
  export function bootstrap(options: Record<string, unknown>): void;
}

declare module 'release-it' {
  export default function release(
    options: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
}
