export interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

// Use a global store to survive hot reloads in dev and share between route invocations
const getStore = (): Map<string, number[]> => {
  const g = globalThis as any;
  if (!g.__RATE_LIMIT_STORE__) {
    g.__RATE_LIMIT_STORE__ = new Map<string, number[]>();
  }
  return g.__RATE_LIMIT_STORE__ as Map<string, number[]>;
};

export const rateLimit = (options: RateLimitOptions): { allowed: boolean; remaining: number } => {
  const { key, limit, windowMs } = options;
  const now = Date.now();
  const store = getStore();
  const windowStart = now - windowMs;

  const timestamps = store.get(key) || [];
  const recent = timestamps.filter((ts) => ts > windowStart);

  if (recent.length >= limit) {
    store.set(key, recent); // prune old
    return { allowed: false, remaining: 0 };
  }

  recent.push(now);
  store.set(key, recent);
  return { allowed: true, remaining: Math.max(0, limit - recent.length) };
};

export const getClientIp = (req: Request | { headers: Headers }): string => {
  try {
    const headers = (req as any).headers as Headers;
    const xff = headers.get('x-forwarded-for');
    if (xff) {
      // first IP in the list
      return xff.split(',')[0]?.trim() || '0.0.0.0';
    }
    const realIp = headers.get('x-real-ip');
    if (realIp) return realIp;
  } catch {}
  return '0.0.0.0';
};

export const buildRateKey = (req: Request | { headers: Headers }, userId: string | null, scope: string): string => {
  const ip = getClientIp(req);
  return `${scope}:${userId || 'anon'}:${ip}`;
}; 