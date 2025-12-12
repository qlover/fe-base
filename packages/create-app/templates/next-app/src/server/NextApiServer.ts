import { ExecutorError } from '@qlover/fe-corekit';
import { NextResponse } from 'next/server';
import {
  isAppApiErrorInterface,
  isAppApiSuccessInterface,
  type AppApiResult
} from '@/base/port/AppApiInterface';
import type { BootstrapServerContextValue } from '@/core/bootstraps/BootstrapServer';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { AppErrorApi } from './AppErrorApi';
import { AppSuccessApi } from './AppSuccessApi';
import type { PromiseTask } from '@qlover/fe-corekit';

export class NextApiServer extends BootstrapServer {
  protected isAppApiResult(result: unknown): result is AppApiResult {
    return isAppApiSuccessInterface(result) || isAppApiErrorInterface(result);
  }

  public async run<Result>(
    task?: PromiseTask<Result | AppApiResult, BootstrapServerContextValue>
  ): Promise<AppApiResult> {
    const result = await this.execNoError(task);

    // Is result is AppApiResult, return it directly
    if (this.isAppApiResult(result)) {
      return result;
    }

    // If result is ExecutorError, return AppErrorApi
    if (result instanceof ExecutorError) {
      return new AppErrorApi(result.id, result.message);
    }

    // If result is Error, return AppErrorApi
    if (result instanceof Error) {
      return new AppErrorApi('SERVER_ERROR', result.message);
    }

    return new AppSuccessApi(result);
  }

  public async runWithJson<Result>(
    task?: PromiseTask<Result | AppApiResult, BootstrapServerContextValue>
  ): Promise<NextResponse> {
    const result = await this.run(task);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  }
}
