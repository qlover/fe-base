/**
 * 兼容入口：运行时 CORS 拼装已下沉到 `@qlover/next-kit/server`。
 */
export {
  buildRuntimeCorsConfig,
  type RuntimeCorsConfigType as RuntimeCorsConfig
} from '@qlover/next-kit/server';
