export type ApiAuditRule = {
  readonly method: string | readonly string[];
  /** Exact pathname, or RegExp matched against pathname. */
  readonly path: string | RegExp;
};

export type ApiAuditMatcher = (method: string, pathname: string) => boolean;

function methodMatches(
  method: string,
  ruleMethod: string | readonly string[]
): boolean {
  const upper = method.toUpperCase();
  if (typeof ruleMethod === 'string') {
    return ruleMethod.toUpperCase() === upper;
  }
  return ruleMethod.some((item) => item.toUpperCase() === upper);
}

function pathMatches(pathname: string, rulePath: string | RegExp): boolean {
  if (typeof rulePath === 'string') {
    return pathname === rulePath;
  }
  return rulePath.test(pathname);
}

/**
 * Allowlist matcher deciding whether an API request is written to the
 * request-log table. Anything not matched by a rule is not audited.
 */
export function createApiAuditMatcher(
  rules: readonly ApiAuditRule[]
): ApiAuditMatcher {
  return (method, pathname) =>
    rules.some(
      (rule) =>
        methodMatches(method, rule.method) && pathMatches(pathname, rule.path)
    );
}
