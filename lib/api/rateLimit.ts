type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Sweep expired buckets periodically so the map doesn't grow unbounded under
// sustained traffic. Guarded for environments where timers aren't desired
// (e.g. edge runtimes) — a missed sweep just means slightly higher memory
// use, never incorrect limiting.
if (typeof setInterval !== "undefined") {
  const sweep = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now >= bucket.resetAt) buckets.delete(key);
    }
  }, 60_000);
  sweep.unref?.();
}

/**
 * In-memory fixed-window rate limiter. Sufficient for a single Next.js
 * instance; a multi-instance/serverless deployment needs a shared store
 * (e.g. Upstash Redis) since each instance would otherwise track its own
 * window.
 *
 * Returns true if `key` has exceeded `limit` requests within `windowMs`.
 */
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  bucket.count += 1;
  return bucket.count > limit;
}

/** Best-effort client IP extraction behind a reverse proxy / edge platform. */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
