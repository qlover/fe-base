/**
 * LLM HTTP / 协议错误。
 */
export class LlmError extends Error {
  public readonly status: number | undefined;
  public readonly body: string | undefined;

  constructor(
    message: string,
    options?: {
      readonly status?: number;
      readonly body?: string;
      readonly cause?: unknown;
    }
  ) {
    super(message, options?.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = 'LlmError';
    this.status = options?.status;
    this.body = options?.body;
  }
}
