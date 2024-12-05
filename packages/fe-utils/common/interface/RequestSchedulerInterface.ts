import { Executor } from '../executor';
import {
  RequestAdapterInterface,
  RequestAdapterResponse,
  RequestAdpaterConfig
} from './RequestAdapterInterface';

/**
 * 定义一个统一的请求调用接口
 *
 * 实现功能统一 api
 * - 插件系统
 * - TODO: 缓存请求
 * - TODO: 可以支持上传、下载进度
 * - 流式响应
 * - TODO: 重试
 * - TODO: 超时
 * - 取消
 * - TODO: mock数据(可局部)
 */
export interface RequestSchedulerInterface<
  Config extends RequestAdpaterConfig
> {
  readonly executor: Executor;

  readonly adapter: RequestAdapterInterface<Config>;

  request<Request, Response>(
    config: RequestAdpaterConfig<Request>
  ): Promise<RequestAdapterResponse<Response, Request>>;
}
