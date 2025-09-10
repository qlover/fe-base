'use client';

import { Button } from 'antd';
import { useState } from 'react';
import { I } from '@config/IOCIdentifier';
import { MigrationsApi } from '@/base/services/migrations/MigrationsApi';
import { useIOC } from '@/uikit/hook/useIOC';

export default function AdminMigrationsPage() {
  const dialogHandler = useIOC(I.DialogHandler);
  const logger = useIOC(I.Logger);
  const migrationsApi = useIOC(MigrationsApi);

  const [isLoading, setIsLoading] = useState(false);

  const handleInitMigration = async () => {
    try {
      setIsLoading(true);
      const result = await migrationsApi.init();

      logger.info(result);
    } catch (error) {
      dialogHandler.error(
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-testid="AdminMigrationsPage" className="h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Database Migrations</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Initialize Migration System
          </h2>
          <p className="mb-2">
            This will create the necessary database objects for managing
            migrations. Only needs to be run once.
          </p>
          <Button
            type="primary"
            onClick={handleInitMigration}
            loading={isLoading}
          >
            Initialize
          </Button>
        </div>
      </div>
    </div>
  );
}
