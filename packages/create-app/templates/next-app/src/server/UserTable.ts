import { inject, injectable } from 'inversify';
import type { DBBridgeInterface } from '@/base/port/DBBridgeInterface';
import type { DBTableInterface } from '@/base/port/DBTableInterface';
import { SupabaseBridge } from './SupabaseBridge';

@injectable()
export class UserTable implements DBTableInterface {
  readonly name = 'users';

  constructor(@inject(SupabaseBridge) protected dbBridge: DBBridgeInterface) {}

  getAll(): Promise<unknown> {
    return this.dbBridge.get({ table: this.name });
  }
}
