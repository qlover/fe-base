/**
 * 通用 SSE 传输层：线协议编解码 + 服务端写出 + 客户端读取。
 * 业务帧映射不放此处。
 */

export type { SseEnvelopeType, SseWriterRunErrorHandlerType } from './SseTypes';
export type { SseCodecInterface } from './SseCodecInterface';
export { SseCodec } from './SseCodec';
export type { SseWriterInterface } from './SseWriterInterface';
export { SseWriter } from './SseWriter';
export type { SseReaderInterface } from './SseReaderInterface';
export { SseReader } from './SseReader';
