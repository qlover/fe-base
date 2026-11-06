/**
 * SSE 线协议信封：与业务帧无关。
 */
export type SseEnvelopeType = {
  readonly eventName: string;
  readonly data: unknown;
};

/**
 * 写出侧可选：run 抛错时的处理（默认关闭流前不写业务帧）。
 */
export type SseWriterRunErrorHandlerType = (
  error: unknown,
  write: (envelope: SseEnvelopeType) => void
) => void;
