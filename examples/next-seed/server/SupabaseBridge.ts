import { ExecutorError } from '@qlover/fe-corekit';
import { AuthError } from '@supabase/supabase-js';
import { inject, injectable } from '@shared/container';
import { createClient } from '@shared/supabase/server';
import { I } from '@config/ioc-identifiter';
import { UserRole, UserSchema } from '@schemas/UserSchema';
import type {
  BridgeEvent,
  DBBridgeInterface,
  DBBridgeResponse,
  BridgeOrderBy,
  Where
} from '@server/port/DBBridgeInterface';
import type { LoggerInterface } from '@qlover/logger';
import type { PostgrestResponseFailure } from '@supabase/postgrest-js';
import type {
  PostgrestSingleResponse,
  SupabaseClient,
  PostgrestResponse,
  User,
  AuthResponse,
  UserResponse
} from '@supabase/supabase-js';

const whereHandlerMaps = {
  '=': 'eq',
  '!=': 'neq',
  '>': 'gt',
  '<': 'lt',
  '>=': 'gte',
  '<=': 'lte'
};

export type SupabaseBridgeResponse<T> = DBBridgeResponse<T> &
  PostgrestResponse<T>;

@injectable()
export class SupabaseBridge implements DBBridgeInterface {
  constructor(@inject(I.Logger) protected logger: LoggerInterface) {}

  public async getSupabase(): Promise<SupabaseClient> {
    return await createClient();
  }

  public async execSql(sql: string): Promise<SupabaseBridgeResponse<unknown>> {
    const supabase = await this.getSupabase();
    const res = await supabase.rpc('exec_sql', { sql });
    return this.catch(res);
  }

  protected async catch(
    result: PostgrestSingleResponse<unknown>
  ): Promise<SupabaseBridgeResponse<unknown>> {
    if (result.error) {
      this.logger.error('', result);

      if (this.hasPausedProject(result)) {
        throw new Error(
          'Project is paused, Please Restore project: https://supabase.com/dashboard'
        );
      }

      throw new Error(result.error.details + ' ' + result.error.message);
    }

    return result as SupabaseBridgeResponse<unknown>;
  }

  protected hasPausedProject(error: PostgrestResponseFailure): boolean {
    return (
      error.status === 0 && error.error.message === 'TypeError: fetch failed'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected handleWhere(handler: any, wheres: Where[]): void {
    for (const where of wheres) {
      const [key, operator, value] = where;
      const opr = whereHandlerMaps[operator];
      if (!opr) {
        throw new Error(`Unsupported where operation: ${value}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (handler as any)[opr] !== 'function') {
        throw new Error(`Unsupported where operation: ${value}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (handler as any)[opr](key, value);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected handleOrderBy(handler: any, orderBy?: BridgeOrderBy): void {
    if (orderBy) {
      handler.order(orderBy[0], { ascending: orderBy[1] === 0 });
    }
  }

  public toUserSchema(user: User): UserSchema {
    return {
      id: user.id,
      email: user.email!,
      created_at: user.created_at,
      updated_at: user.updated_at,
      role: user.role === 'admin' ? UserRole.ADMIN : UserRole.USER,
      // 始终为空
      password: '',
      credential_token: ''
    };
  }

  public throwIfError(
    response: AuthResponse | UserResponse | { error: unknown }
  ): void {
    const { error } = response;
    if (error) {
      this.logger.info('SupabaseBridge throw error:', error);

      if (error instanceof AuthError) {
        throw new ExecutorError('SupabaseAuthError', error);
      }

      throw new Error(error as string);
    }
  }

  /**
   * @override
   */
  public async add(event: BridgeEvent): Promise<DBBridgeResponse<unknown>> {
    const { table, data } = event;
    if (!data) {
      throw new Error('Data is required for add operation');
    }
    const supabase = await this.getSupabase();
    const res = await supabase
      .from(table)
      .insert(Array.isArray(data) ? data : [data]);
    return this.catch(res);
  }

  /**
   * @override
   */
  public async upsert(event: BridgeEvent): Promise<DBBridgeResponse<unknown>> {
    const { table, data, fields = '*' } = event;
    if (!data) {
      throw new Error('Data is required for upsert operation');
    }
    const selectFields = Array.isArray(fields) ? fields.join(',') : fields;
    const supabase = await this.getSupabase();

    const res = await supabase
      .from(table)
      .upsert(Array.isArray(data) ? data : [data], {
        onConflict: 'value'
      })
      .select(selectFields); // Request to return the upserted data
    return this.catch(res);
  }

  /**
   * @override
   */
  public async update(event: BridgeEvent): Promise<DBBridgeResponse<unknown>> {
    const { table, data, where } = event;
    if (!data) {
      throw new Error('Data is required for update operation');
    }
    const supabase = await this.getSupabase();

    const handler = supabase.from(table).update(data);

    this.handleWhere(handler, where ?? []);

    return this.catch(await handler);
  }

  /**
   * @override
   */
  public async delete(event: BridgeEvent): Promise<DBBridgeResponse<unknown>> {
    const { table, where } = event;
    const supabase = await this.getSupabase();

    const handler = supabase.from(table).delete();

    this.handleWhere(handler, where ?? []);

    return this.catch(await handler);
  }

  /**
   * @override
   */
  public async get(
    event: BridgeEvent
  ): Promise<SupabaseBridgeResponse<unknown>> {
    const { table, fields = '*', where, orderBy } = event;
    const selectFields = Array.isArray(fields) ? fields.join(',') : fields;
    const supabase = await this.getSupabase();

    const handler = supabase.from(table).select(selectFields);

    this.handleWhere(handler, where ?? []);

    this.handleOrderBy(handler, orderBy);

    return this.catch(await handler);
  }

  /**
   * @override
   */
  public async pagination(
    event: BridgeEvent
  ): Promise<DBBridgeResponse<unknown[]>> {
    const {
      table,
      fields = '*',
      where,
      page = 1,
      pageSize = 10,
      orderBy
    } = event;
    const selectFields = Array.isArray(fields) ? fields.join(',') : fields;

    const supabase = await this.getSupabase();

    // 获取总数
    const countHandler = supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    this.handleWhere(countHandler, where ?? []);
    const countResult = await this.catch(await countHandler);

    // 获取分页数据
    const handler = supabase.from(table).select(selectFields);

    this.handleOrderBy(handler, orderBy);

    handler.range((page - 1) * pageSize, page * pageSize - 1);

    this.handleWhere(handler, where ?? []);
    const result = await this.catch(await handler);

    if (result.error) {
      return result as DBBridgeResponse<unknown[]>;
    }

    return {
      data: Array.isArray(result.data) ? result.data : [],
      error: null,
      count: countResult.count,
      status: result.status,
      statusText: result.statusText
    } as DBBridgeResponse<unknown[]>;
  }
}
