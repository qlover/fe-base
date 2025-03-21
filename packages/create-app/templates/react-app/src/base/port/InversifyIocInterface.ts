import type { IOCRegisterInterface } from '@fe-prod/core/bootstrap';
import type { Container } from 'inversify';

export type InversifyRegisterContainer = Container;
/**
 * Inversify register interface.
 */
export interface InversifyRegisterInterface
  extends IOCRegisterInterface<InversifyRegisterContainer> {}
