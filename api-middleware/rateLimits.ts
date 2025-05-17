type RateLimitOptions = {
  windowMs?: number;
  max?: number;
};
const ipStore = new Map<string, { count: number; lastRequest: number }>();

export function rateLimit(req: Request, options: RateLimitOptions = { windowMs: 60_000, max: 2 }) {
  const { windowMs = 60_000, max = 2 } = options;
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const entry = ipStore.get(ip);

  if (entry && now - entry.lastRequest < windowMs) {
    if (entry.count >= max) {
      return { limited: true };
    }
    entry.count += 1;
    entry.lastRequest = now;
    ipStore.set(ip, entry);
    return { limited: false };
  }
  ipStore.set(ip, { count: 1, lastRequest: now });
  return { limited: false };
}
