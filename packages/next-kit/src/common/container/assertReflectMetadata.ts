/**
 * Throws if `reflect-metadata` has not been loaded in the current runtime.
 * Call from IOC bootstrap paths; do not import `reflect-metadata` in this package.
 */
export function assertReflectMetadata(): void {
  const reflect = (
    globalThis as typeof globalThis & {
      Reflect?: { getMetadata?: unknown };
    }
  ).Reflect;

  if (typeof reflect?.getMetadata !== 'function') {
    throw new Error(
      "[@qlover/next-kit] Missing `reflect-metadata`. Import it once at your app entry before using IOC:\n\n  import 'reflect-metadata';\n"
    );
  }
}
