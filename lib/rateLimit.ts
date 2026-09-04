declare global {
  // eslint-disable-next-line no-var
  var _rateLimitBuckets: Map<string, { count: number; windowStart: number }> | undefined;
}

const buckets = global._rateLimitBuckets ?? (global._rateLimitBuckets = new Map());

/**
 * Fixed-window in-memory rate limiter, keyed by an arbitrary string (e.g. an
 * API key). Only correct within a single warm server instance — on
 * serverless platforms each cold instance starts its own counter, so this is
 * a best-effort abuse guard, not a hard multi-instance limit.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now - bucket.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (bucket.count >= limit) return false;

  bucket.count += 1;
  return true;
}
