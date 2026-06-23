import { isPlainObject, pick } from 'lodash';
import { NextResponse, type NextRequest } from 'next/server';
import { I } from '@config/ioc-identifiter';
import type {
  AppApiResult,
  AppApiSuccessInterface
} from '@interfaces/AppApiInterface';
import { BootstrapServer } from '@server/BootstrapServer';
import { RequestLogsRepository } from '@server/repositorys/RequestLogsRepository';
import { nextApiServerBackstop } from './plugins/nextApiServerBackstop';
import { NextApiHandler } from './utils/NextApiHandler';
import type {
  BootstrapServerContextOptions,
  BootstrapServerPlugin
} from './interfaces/BootstrapServerInterface';
import type { ServerContextInterface } from './interfaces/ServerContextInterface';
import type { ResultHandlerInterface } from './utils/NextApiHandler';
import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type { ExecutorAsyncTask } from '@qlover/fe-corekit';

export type NextApiServerContext = {
  name?: string;
  nextRequest?: NextRequest;
  /**
   * @default 'http.request'
   */
  event_type: string;
};

type RunWithInit = {
  successHeaders?: HeadersInit;
  errorHeaders?: HeadersInit;
  httpStatus?: number;
};
type RunWithTask<Result> = ExecutorAsyncTask<
  Result | AppApiResult<Result>,
  BootstrapServerContextOptions
>;

function isNextApiServerContext(
  value: unknown
): value is Partial<NextApiServerContext> {
  return isPlainObject(value);
}
export class NextApiServer extends BootstrapServer {
  protected resultHandler: ResultHandlerInterface;
  protected serverContext: ServerContextInterface;
  protected nextRequest?: NextRequest;

  constructor(name?: string, nextRequest?: NextRequest);
  constructor(context?: Partial<NextApiServerContext>);

  constructor(
    nameOrContext?: string | Partial<NextApiServerContext>,
    nextRequest?: NextRequest
  ) {
    let context: NextApiServerContext;
    if (isNextApiServerContext(nameOrContext)) {
      const { name } = nameOrContext ?? {};

      super(name);
      context = {
        ...nameOrContext,
        event_type: 'http.request'
      };
    } else {
      super(nameOrContext);
      context = {
        name: nameOrContext,
        nextRequest,
        event_type: 'http.request'
      };
    }
    this.nextRequest = context.nextRequest;
    this.serverContext = this.IOC(I.ServerContextInterface);
    this.resultHandler = new NextApiHandler(this.logger, this.serverContext);

    this.serverContext.reset({
      name: context.name,
      uid: this.root.uuid,
      event_type: context.event_type
    });
  }

  public async run<Result>(
    task?: ExecutorAsyncTask<
      Result | AppApiResult<Result>,
      BootstrapServerContextOptions
    >
  ): Promise<AppApiResult<Result>> {
    if (this.nextRequest) {
      this.serverContext.changeState({ request: this.nextRequest });
    }

    const result = await this.execNoError(task);

    const envelope = this.resultHandler.handler<Result>(
      result,
      this.serverContext
    );

    if (this.nextRequest) {
      this.IOC(RequestLogsRepository).insertWithApiResult(envelope, {
        request: this.nextRequest
      });
    }

    return envelope;
  }

  protected returnJson<Result>(
    result: AppApiResult<Result>,
    init?: RunWithInit
  ): NextResponse {
    const contextHttpStatus = this.serverContext.getState('httpStatus');

    if (!result.success) {
      return NextResponse.json(this.getSafeAppApiResult(result), {
        status: contextHttpStatus ?? 400,
        headers: init?.errorHeaders
      });
    }

    return NextResponse.json(this.getSafeAppApiResult(result), {
      headers: init?.successHeaders
    });
  }

  public async runWithJson<Result>(
    task?: RunWithTask<Result>,
    init?: RunWithInit
  ): Promise<NextResponse> {
    const result = await this.run(task);
    return this.returnJson(result, init);
  }

  /**
   * 支持在运行时重定向接口
   *
   * 如果没有发生重定向，则会默认返回 json
   *
   * @param task
   * @param init
   * @returns
   */
  public async runWithRedirect<Result>(
    task?: RunWithTask<Result>,
    init?: RunWithInit
  ): Promise<NextResponse> {
    const result = await this.run(task);

    const contextHttpStatus = this.serverContext.getState('httpStatus');

    const redirectUrl = this.serverContext.getState('redirectUrl');
    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl, {
        status: contextHttpStatus ?? 307,
        headers: init?.errorHeaders
      });
    }

    return this.returnJson(result, init);
  }

  protected getSafeAppApiResult<T>(result: AppApiResult<T>): AppApiResult<T> {
    return pick(result, [
      'success',
      'id',
      'requestId',
      'message',
      'data'
    ]) as AppApiSuccessInterface<T>;
  }

  public override getPlugins(
    _seedConfig: SeedConfigInterface
  ): BootstrapServerPlugin[] {
    const plugins = super.getPlugins(_seedConfig);
    return [...plugins, nextApiServerBackstop];
  }
}
