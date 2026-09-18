import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { ApiCorsRule } from '@qlover/next-kit/server';

export type RuntimeCorsConfig = Pick<
  SeedServerConfigInterface,
  'apiCorsAllowedOrigins' | 'apiCorsAllowedMethods'
> & {
  readonly apiCorsRules: readonly ApiCorsRule[];
};

export function buildRuntimeCorsConfig(
  rules: readonly ApiCorsRule[],
  methods: readonly string[]
): RuntimeCorsConfig {
  const apiCorsAllowedMethods =
    methods.length > 0
      ? Object.freeze([...methods])
      : Object.freeze(['GET', 'POST', 'OPTIONS']);

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
