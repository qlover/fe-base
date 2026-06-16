import { networkInterfaces } from 'os';

/**
 * Automatically detect the local network IPv4 address
 * @returns The first non-internal IPv4 address found, or undefined if not found
 */
export function getLocalIpAddress(): string | undefined {
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    const netItems = nets[name];
    if (!netItems) continue;

    for (const netItem of netItems) {
      // Skip internal (loopback) addresses and non-IPv4 addresses
      if (netItem.family === 'IPv4' && !netItem.internal) {
        return netItem.address;
      }
    }
  }
  return undefined;
}
