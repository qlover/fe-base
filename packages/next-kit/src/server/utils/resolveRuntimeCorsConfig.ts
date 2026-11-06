import type { ApiCorsConfig, ApiCorsRule } from './apiCors';

const DEFAULT_CORS_METHODS = Object.freeze([
  'GET',
  'POST',
  'OPTIONS'
]) as readonly string[];

/**
 * 运行时 CORS 配置：以 `apiCorsRules` 为主；`apiCorsAllowedOrigins` 恒为空
 *（兼容 {@link ApiCorsConfig} 旧字段）。
 */
export type RuntimeCorsConfigType = ApiCorsConfig & {
  readonly apiCorsRules: readonly ApiCorsRule[];
};

/**
 * 由规则列表与默认 methods 拼装运行时 CORS 配置。
 */
export function buildRuntimeCorsConfig(
  rules: readonly ApiCorsRule[],
  methods: readonly string[]
): RuntimeCorsConfigType {
  const apiCorsAllowedMethods =
    methods.length > 0
      ? Object.freeze([...methods])
      : DEFAULT_CORS_METHODS;

  return {
    apiCorsAllowedOrigins: Object.freeze([]),
    apiCorsAllowedMethods,
    apiCorsRules: Object.freeze(
      rules.map((rule) => ({
        origin: rule.origin,
        path: rule.path,
        methods: [...rule.methods]
      }))
    )
  };
}
