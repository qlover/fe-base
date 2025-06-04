import { InversifyContainer, InversifyRegisterInterface } from '../IOC';

export class RegisterApi implements InversifyRegisterInterface {
  register(_container: InversifyContainer): void {}
}
