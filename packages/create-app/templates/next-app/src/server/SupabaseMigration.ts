import * as fs from 'fs/promises';
import * as path from 'path';
import { injectable, inject } from 'inversify';
import type {
  DBMigrationInterface,
  MigrationConfig,
  MigrationResult
} from '@/base/port/DBMigrationInterface';
import { SupabaseBridge } from './SupabaseBridge';
import type { SupabaseClient } from '@supabase/supabase-js';

@injectable()
export class SupabaseMigration implements DBMigrationInterface {
  protected supabase: SupabaseClient;
  protected readonly MIGRATIONS_TABLE = '_migrations';
  protected readonly MIGRATIONS_DIR = 'migrations';
  protected readonly SQL_DIR = 'migrations/sql';

  constructor(@inject(SupabaseBridge) protected dbBridge: SupabaseBridge) {
    this.supabase = dbBridge.getSupabase();
  }

  async init(): Promise<void> {}

  /**
   * 生成基础的表结构 SQL
   */
  protected generateTableSQL(
    tableName: string,
    columns: Record<string, string>
  ): string {
    const columnDefinitions = Object.entries(columns)
      .map(([name, type]) => `  ${name} ${type}`)
      .join(',\n');

    return `CREATE TABLE ${tableName} (\n${columnDefinitions}\n);`;
  }

  /**
   * 生成索引 SQL
   */
  protected generateIndexSQL(tableName: string, columns: string[]): string {
    const indexName = `idx_${tableName}_${columns.join('_')}`;
    return `CREATE INDEX ${indexName} ON ${tableName} (${columns.join(', ')});`;
  }

  /**
   * 确保迁移目录存在
   */
  protected async ensureMigrationsDirs(): Promise<void> {
    await fs.mkdir(this.MIGRATIONS_DIR, { recursive: true });
    await fs.mkdir(this.SQL_DIR, { recursive: true });
  }

  /**
   * 写入迁移文件
   */
  protected async writeMigrationFile(
    version: string | number,
    sql: string
  ): Promise<void> {
    const filePath = path.join(this.SQL_DIR, `${version}.sql`);
    await fs.writeFile(filePath, sql, 'utf-8');
  }

  /**
   * 从 Supabase 获取表结构
   */
  protected async getTableDefinition(tableName: string): Promise<{
    columns: Record<string, string>;
    primaryKey?: string;
    indexes: string[][];
  }> {
    interface ColumnInfo {
      column_name: string;
      data_type: string;
      is_primary_key: boolean;
    }

    interface IndexInfo {
      column_names: string[];
    }

    // 获取列信息
    const { data: columns, error: columnError } = await this.supabase.rpc(
      'get_table_columns',
      { table_name: tableName }
    );

    if (columnError) throw columnError;

    // 获取索引信息
    const { data: indexes, error: indexError } = await this.supabase.rpc(
      'get_table_indexes',
      { table_name: tableName }
    );

    if (indexError) throw indexError;

    return {
      columns: ((columns as ColumnInfo[]) || []).reduce<Record<string, string>>(
        (acc, col) => ({
          ...acc,
          [col.column_name]: col.data_type
        }),
        {}
      ),
      primaryKey: ((columns as ColumnInfo[]) || []).find(
        (col) => col.is_primary_key
      )?.column_name,
      indexes: ((indexes as IndexInfo[]) || []).map((idx) => idx.column_names)
    };
  }

  protected async readMigrationFile(version: string | number): Promise<string> {
    const filePath = path.join(this.SQL_DIR, `${version}.sql`);
    return fs.readFile(filePath, 'utf-8');
  }

  protected async loadAllMigrations(): Promise<MigrationConfig[]> {
    const files = await fs.readdir(this.SQL_DIR);
    const migrations: MigrationConfig[] = [];

    for (const file of files) {
      if (!file.endsWith('.sql')) continue;
      const version = file.replace('.sql', '');
      const content = await this.readMigrationFile(version);
      const [firstLine] = content.split('\n');
      const description = firstLine.replace('-- ', '').trim();
      const timestamp = parseInt(version.split('_')[0], 10);

      migrations.push({
        version,
        description,
        timestamp
      });
    }

    return migrations.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }

  protected async ensureMigrationsTable(): Promise<void> {
    const { error } = await this.supabase.rpc(
      'create_migrations_table_if_not_exists'
    );
    if (error) {
      throw new Error(`Failed to create migrations table: ${error.message}`);
    }
  }

  async createMigration(name: string): Promise<MigrationConfig> {
    await this.ensureMigrationsDirs();

    const timestamp = Date.now();
    const version = `${timestamp}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // 这里我们先创建一个基本的模板
    const sql = `-- ${name}

-- Up Migration
-- 在这里添加创建表和修改的 SQL
-- 例如:
-- CREATE TABLE example (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   name VARCHAR(255) NOT NULL,
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- Down Migration
-- 在这里添加回滚操作的 SQL
-- 例如:
-- DROP TABLE IF EXISTS example;
`;

    await this.writeMigrationFile(version, sql);

    return {
      version,
      description: name,
      timestamp
    };
  }

  async getCurrentVersion(): Promise<string | number> {
    await this.ensureMigrationsTable();
    const { data, error } = await this.supabase
      .from(this.MIGRATIONS_TABLE)
      .select('version')
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data?.version || '0';
  }

  async getAppliedMigrations(): Promise<MigrationConfig[]> {
    await this.ensureMigrationsTable();
    const { data, error } = await this.supabase
      .from(this.MIGRATIONS_TABLE)
      .select('*')
      .order('timestamp', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPendingMigrations(): Promise<MigrationConfig[]> {
    const appliedMigrations = await this.getAppliedMigrations();
    const appliedVersions = new Set(appliedMigrations.map((m) => m.version));
    const allMigrations = await this.loadAllMigrations();
    return allMigrations.filter((m) => !appliedVersions.has(m.version));
  }

  async applyMigration(migration: MigrationConfig): Promise<MigrationResult> {
    await this.ensureMigrationsTable();
    const startTime = Date.now();

    try {
      // 检查迁移是否已经应用
      const { data: existingMigration } = await this.supabase
        .from(this.MIGRATIONS_TABLE)
        .select('version')
        .eq('version', migration.version)
        .single();

      if (existingMigration) {
        return {
          success: false,
          error: 'Migration already applied',
          version: migration.version,
          executionTime: 0
        };
      }

      // 读取并执行迁移文件
      const sql = await this.readMigrationFile(migration.version);
      const upMigration = String(sql)
        .split('-- Down Migration')[0]
        .split('-- Up Migration')[1]
        .trim();

      const { error: migrationError } = await this.supabase.rpc(
        'execute_migration',
        {
          migration_version: String(migration.version),
          migration_sql: upMigration
        }
      );

      if (migrationError) {
        return {
          success: false,
          error: migrationError.message,
          version: migration.version,
          executionTime: Date.now() - startTime
        };
      }

      // 记录迁移
      const { error: recordError } = await this.supabase
        .from(this.MIGRATIONS_TABLE)
        .insert({
          version: migration.version,
          description: migration.description,
          timestamp: migration.timestamp || Date.now()
        });

      if (recordError) {
        return {
          success: false,
          error: recordError.message,
          version: migration.version,
          executionTime: Date.now() - startTime
        };
      }

      return {
        success: true,
        version: migration.version,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        version: migration.version,
        executionTime: Date.now() - startTime
      };
    }
  }

  async rollbackMigration(
    migration: MigrationConfig
  ): Promise<MigrationResult> {
    await this.ensureMigrationsTable();
    const startTime = Date.now();

    try {
      // 检查迁移是否存在
      const { data: existingMigration } = await this.supabase
        .from(this.MIGRATIONS_TABLE)
        .select('version')
        .eq('version', migration.version)
        .single();

      if (!existingMigration) {
        return {
          success: false,
          error: 'Migration not found',
          version: migration.version,
          executionTime: 0
        };
      }

      // 读取并执行回滚
      const sql = await this.readMigrationFile(migration.version);
      const downMigration = String(sql).split('-- Down Migration')[1].trim();

      const { error: migrationError } = await this.supabase.rpc(
        'execute_migration',
        {
          migration_version: String(migration.version),
          migration_sql: downMigration
        }
      );

      if (migrationError) {
        return {
          success: false,
          error: migrationError.message,
          version: migration.version,
          executionTime: Date.now() - startTime
        };
      }

      // 删除迁移记录
      const { error: recordError } = await this.supabase
        .from(this.MIGRATIONS_TABLE)
        .delete()
        .eq('version', migration.version);

      if (recordError) {
        return {
          success: false,
          error: recordError.message,
          version: migration.version,
          executionTime: Date.now() - startTime
        };
      }

      return {
        success: true,
        version: migration.version,
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        version: migration.version,
        executionTime: Date.now() - startTime
      };
    }
  }

  async migrateUp(): Promise<MigrationResult[]> {
    const pendingMigrations = await this.getPendingMigrations();
    const results: MigrationResult[] = [];

    for (const migration of pendingMigrations) {
      const result = await this.applyMigration(migration);
      results.push(result);
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  async migrateDown(
    targetVersion: string | number
  ): Promise<MigrationResult[]> {
    const appliedMigrations = await this.getAppliedMigrations();
    const results: MigrationResult[] = [];

    // 找到目标版本的索引
    const targetIndex = appliedMigrations.findIndex(
      (m) => m.version === targetVersion
    );
    if (targetIndex === -1) {
      throw new Error(
        `Target version ${targetVersion} not found in applied migrations`
      );
    }

    // 从最新版本开始回滚到目标版本（不包括目标版本）
    const migrationsToRollback = appliedMigrations
      .slice(targetIndex + 1)
      .reverse();

    for (const migration of migrationsToRollback) {
      const result = await this.rollbackMigration(migration);
      results.push(result);
      if (!result.success) {
        break;
      }
    }

    return results;
  }

  async validateMigrations(): Promise<{ valid: boolean; errors?: string[] }> {
    const errors: string[] = [];
    const appliedMigrations = await this.getAppliedMigrations();

    // 检查版本号是否按时间戳顺序排列
    for (let i = 1; i < appliedMigrations.length; i++) {
      const prev = appliedMigrations[i - 1];
      const curr = appliedMigrations[i];

      if (prev.timestamp && curr.timestamp && prev.timestamp > curr.timestamp) {
        errors.push(
          `Migration timestamp inconsistency: ${prev.version} (${prev.timestamp}) ` +
            `is later than ${curr.version} (${curr.timestamp})`
        );
      }
    }

    // 检查是否有重复的版本号
    const versions = new Set<string | number>();
    for (const migration of appliedMigrations) {
      if (versions.has(migration.version)) {
        errors.push(`Duplicate migration version found: ${migration.version}`);
      }
      versions.add(migration.version);
    }

    // 检查迁移表是否存在
    try {
      await this.ensureMigrationsTable();
    } catch (error) {
      errors.push(
        `Migration table check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    // 检查文件系统中的迁移文件
    try {
      const allMigrations = await this.loadAllMigrations();
      const appliedVersions = new Set(appliedMigrations.map((m) => m.version));

      // 检查是否有已应用的迁移文件丢失
      for (const migration of appliedMigrations) {
        const migrationFile = path.join(
          this.SQL_DIR,
          `${migration.version}.sql`
        );
        try {
          await fs.access(migrationFile);
        } catch {
          errors.push(
            `Migration file not found for version: ${migration.version}`
          );
        }
      }

      // 检查迁移文件的版本号格式
      for (const migration of allMigrations) {
        const versionParts = migration.version.split('_');
        if (versionParts.length < 2) {
          errors.push(`Invalid migration version format: ${migration.version}`);
          continue;
        }

        const timestamp = parseInt(versionParts[0], 10);
        if (isNaN(timestamp)) {
          errors.push(
            `Invalid timestamp in migration version: ${migration.version}`
          );
        }
      }
    } catch (error) {
      errors.push(
        `Failed to validate migration files: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
}
