import { IOC } from './globals';
import { BootstrapClient } from './impls/BootstrapClient';
import { IOCIdentifierRegister } from './impls/IOCIdentifierRegister';

export function bootstrapApp() {
  return new BootstrapClient(IOC).startup(window, IOCIdentifierRegister);
}
