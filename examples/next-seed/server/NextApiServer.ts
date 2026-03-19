import { ExecutorError } from '@qlover/fe-corekit';
import { first, isArray } from 'lodash';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { V_ZOD_FAILED } from '@config/i18n-identifier/common/validators';
import { I } from '@config/ioc-identifiter';
import {
  isAppApiErrorInterface,
  isAppApiSuccessInterface,
  type AppApiResult
} from '@interfaces/AppApiInterface';
import { BootstrapServer } from '@server/BootstrapServer';
import { AppErrorApi } from './AppErrorApi';
import { AppSuccessApi } from './AppSuccessApi';
import type { BootstrapServerContextOptions } from './interfaces/ServerInterface';
import type { SeedConfigInterface } from '@qlover/corekit-bridge';
import type { ExecutorAsyncTask } from '@qlover/fe-corekit';

export class NextApiServer extends BootstrapServer {
  protected isAppApiResult(result: unknown): result is AppApiResult {
    return isAppApiSuccessInterface(result) || isAppApiErrorInterface(result);
  }

  protected catchZodError(error: ZodError): AppApiResult {
    this.logger.info('ZodError', typeof error.message);

    try {
      const messageList = JSON.parse(error.message);

      if (isArray(messageList)) {
        return new AppErrorApi(
          V_ZOD_FAILED,
          first(messageList)?.message,
          this.root.uuid
        );
      }

      return new AppErrorApi(V_ZOD_FAILED, error.message, this.root.uuid);
    } catch {}

    return new AppErrorApi(V_ZOD_FAILED, error.message, this.root.uuid);
  }

  protected catchExecutorError(
    error: ExecutorError,
    appConfig: SeedConfigInterface
  ): AppApiResult {
    this.logger.log('NextApiServer ExecutorError', error.id);
    this.logger.error(error.cause ? error.cause : error);

    if (appConfig.isProduction) {
      return new AppErrorApi(error.id, undefined, this.root.uuid);
    }

    if (error.cause instanceof ZodError) {
      return this.catchZodError(error.cause);
    }

    return new AppErrorApi(error.id, error.message, this.root.uuid);
  }

  public async run<Result>(
    task?: ExecutorAsyncTask<
      Result | AppApiResult,
      BootstrapServerContextOptions
    >
  ): Promise<AppApiResult> {
    const result = await this.execNoError(task);

    // Is result is AppApiResult, return it directly
    if (this.isAppApiResult(result)) {
      return result;
    }

    const appConfig = this.getIOC(I.AppConfig);

    // If result is ExecutorError, return AppErrorApi
    if (result instanceof ExecutorError) {
      return this.catchExecutorError(result, appConfig);
    }

    // If result is Error, return AppErrorApi
    if (result instanceof Error) {
      this.logger.error(result);

      if (appConfig.isProduction) {
        return new AppErrorApi('SERVER_ERROR', undefined, this.root.uuid);
      }

      return new AppErrorApi('SERVER_ERROR', result.message, this.root.uuid);
    }

    return new AppSuccessApi(result, this.root.uuid);
  }

  public async runWithJson<Result>(
    task?: ExecutorAsyncTask<
      Result | AppApiResult,
      BootstrapServerContextOptions
    >
  ): Promise<NextResponse> {
    const result = await this.run(task);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  }
}
