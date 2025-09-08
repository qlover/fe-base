import { inject, injectable } from 'inversify';
import { SupabaseBridge } from './SupabaseBridge';
import type { DBBridgeInterface } from '../port/DBBridgeInterface';
import type { DBTableInterface } from '../port/DBTableInterface';

@injectable()
export class UserTable implements DBTableInterface {
  readonly name = 'users';

  constructor(@inject(SupabaseBridge) protected dbBridge: DBBridgeInterface) {}

  getAll(): Promise<unknown> {
    return this.dbBridge.get(this.name);
  }
}
