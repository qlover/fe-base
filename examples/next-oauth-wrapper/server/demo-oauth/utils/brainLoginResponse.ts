type BrainLoginLike = Record<string, unknown>;

export function extractBrainSessionToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const obj = data as BrainLoginLike;

  if (typeof obj.token === 'string' && obj.token.trim()) {
    return obj.token.trim();
  }

  if (typeof obj.session_token === 'string' && obj.session_token.trim()) {
    return obj.session_token.trim();
  }

  const authToken = obj.auth_token;
  if (authToken && typeof authToken === 'object') {
    const key = (authToken as BrainLoginLike).key;
    if (typeof key === 'string' && key.trim()) {
      return key.trim();
    }
  }

  return null;
}

export function formatBrainLoginError(data: unknown): string {
  if (!data || typeof data !== 'object') {
    return 'Brain login did not return a session token';
  }

  const obj = data as BrainLoginLike;

  if (Array.isArray(obj.non_field_errors) && obj.non_field_errors.length > 0) {
    return String(obj.non_field_errors[0]);
  }

  for (const [field, value] of Object.entries(obj)) {
    if (Array.isArray(value) && value.length > 0) {
      return `${field}: ${String(value[0])}`;
    }
    if (typeof value === 'string' && value.trim()) {
      return `${field}: ${value}`;
    }
  }

  return 'Brain login did not return a session token';
}
