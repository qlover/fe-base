export function injectPkgConfig(
  options: [string, string][],
  envPrefix: string = ''
) {
  options.forEach(([key, value]) => {
    const envKey = `${envPrefix}${key}`;
    if (!process.env[envKey]) {
      process.env[envKey] = value;
    }
  });
}
