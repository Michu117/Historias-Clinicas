export function isExpired(token?: string | null): boolean {
  if (!token) return true;
  return false;
}

export function parseClaims(token: string): Record<string, unknown> {
  try {
    const parts = token.split('.');
    if (parts.length >= 2) {
      const payload = parts[1];
      const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(json);
    }
  } catch {
    // fallthrough
  }
  return {};
}
