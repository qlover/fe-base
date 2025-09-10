export interface MigrationConfig {
  /**
   * Migration version number or identifier
   */
  version: string | number;

  /**
   * Description of what this migration does
   */
  description: string;

  /**
   * Timestamp when migration was created
   */
  timestamp?: number;
}

export interface MigrationResult {
  /**
   * Whether the migration was successful
   */
  success: boolean;

  /**
   * Error message if migration failed
   */
  error?: string;

  /**
   * Migration version that was executed
   */
  version: string | number;

  /**
   * Time taken to execute the migration in milliseconds
   */
  executionTime?: number;
}

export interface DBMigrationInterface {
  /**
   * Get current database version
   */
  getCurrentVersion(): Promise<string | number>;

  /**
   * Get list of all applied migrations
   */
  getAppliedMigrations(): Promise<MigrationConfig[]>;

  /**
   * Get list of pending migrations that need to be applied
   */
  getPendingMigrations(): Promise<MigrationConfig[]>;

  /**
   * Apply a specific migration
   * @param migration Migration configuration
   */
  applyMigration(migration: MigrationConfig): Promise<MigrationResult>;

  /**
   * Rollback a specific migration
   * @param migration Migration configuration
   */
  rollbackMigration(migration: MigrationConfig): Promise<MigrationResult>;

  /**
   * Apply all pending migrations
   */
  migrateUp(): Promise<MigrationResult[]>;

  /**
   * Rollback to a specific version
   * @param targetVersion Version to rollback to
   */
  migrateDown(targetVersion: string | number): Promise<MigrationResult[]>;

  /**
   * Create a new migration file/record
   * @param name Name/description of the migration
   */
  createMigration(name: string): Promise<MigrationConfig>;

  /**
   * Validate migration history and database state
   */
  validateMigrations(): Promise<{
    valid: boolean;
    errors?: string[];
  }>;
}
