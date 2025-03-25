import type { IOCRegisterInterface } from '@qlover/corekit-bridge';
import type { Container } from 'inversify';

export type InversifyRegisterContainer = Container;
/**
 * Inversify register interface.
 */
export interface InversifyRegisterInterface
  extends IOCRegisterInterface<InversifyRegisterContainer> {}
