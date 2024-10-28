declare module 'mock-stdio' {
  export function start(): void;
  export function end(): { stdout: string; stderr: string };
}
