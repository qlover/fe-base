export function getHashParams(hash: string): Record<string, string | null> {
  const sp = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
  const params = {};
  sp.forEach((value, key) => {
    Object.assign(params, { [key]: value });
  });
  return params;
}
