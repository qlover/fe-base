import type { UserSchema } from '@migrations/schema/UserSchema';
import type { BridgeOrderBy } from './DBBridgeInterface';
import type { PaginationInterface } from './PaginationInterface';

export interface AdminUserControllerInterface {
  getUsers(query: {
    page: number;
    pageSize: number;
    orderBy?: BridgeOrderBy;
  }): Promise<PaginationInterface<UserSchema>>;
}
