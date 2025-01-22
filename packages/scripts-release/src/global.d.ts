declare module 'release-it' {
  export default function release(
    options: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
}
