import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';

export class RegisterApi implements InversifyRegisterInterface {
  register(container: InversifyRegisterContainer): void {}
}
