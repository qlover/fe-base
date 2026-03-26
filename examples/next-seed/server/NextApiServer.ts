import { NextResponse } from 'next/server';
import type { AppApiResult } from '@interfaces/AppApiInterface';
import { BootstrapServer } from '@server/BootstrapServer';
import { nextApiServerBackstop } from './plugins/nextApiServerBackstop';
import { ApiResultFactory } from './utils/ApiResultFactory';
import type {
  BootstrapServerContextOptions,
  BootstrapServerPlugin
} from './interfaces/ServerInterface';
import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type { ExecutorAsyncTask } from '@qlover/fe-corekit';

export class NextApiServer extends BootstrapServer {
  public async run<Result>(
    task?: ExecutorAsyncTask<
      Result | AppApiResult<Result>,
      BootstrapServerContextOptions
    >
  ): Promise<AppApiResult<Result>> {
    const result = await this.execNoError(task);

    const options = {
      logger: this.logger,
      config: this.IOC('SeedConfigInterface'),
      requestId: this.root.uuid
    };

    if (ApiResultFactory.isAppApiResult(result)) {
      return result;
    }

    if (result instanceof Error) {
      return ApiResultFactory.createApiWithError(result, options);
    }

    return ApiResultFactory.createApiSuccess(result, options);
  }

  public async runWithJson<Result>(
    task?: ExecutorAsyncTask<
      Result | AppApiResult<Result>,
      BootstrapServerContextOptions
    >
  ): Promise<NextResponse> {
    const result = await this.run(task);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  }

  public override getPlugins(
    _seedConfig: SeedConfigInterface
  ): BootstrapServerPlugin[] {
    const plugins = super.getPlugins(_seedConfig);
    return [...plugins, nextApiServerBackstop];
  }
}
