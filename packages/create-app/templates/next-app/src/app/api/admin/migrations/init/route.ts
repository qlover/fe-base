import { NextResponse } from 'next/server';
import type { ServerApiResponseInterface } from '@/base/port/ServerApiResponseInterface';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { MigrationExecutor } from '@/server/MigrationExecutor';
import { SupabaseMigration } from '@/server/SupabaseMigration';

export async function POST() {
  try {
    const server = new BootstrapServer();
    const migrationService = server.getIOC(SupabaseMigration);
    const migrationExecutor = server.getIOC(MigrationExecutor);

    await migrationExecutor.exec(() => {
      return migrationService.init();
    });

    // if (result.success) {
    return NextResponse.json({
      success: true,
      message: 'Migration system initialized successfully'
    } as ServerApiResponseInterface<unknown>);
    // } else {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error: result.error
    //     } as ServerApiResponseInterface<unknown>,
    //     { status: 500 }
    //   );
    // }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      } as ServerApiResponseInterface<unknown>,
      { status: 500 }
    );
  }
}
