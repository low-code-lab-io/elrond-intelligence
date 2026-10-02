// Tiny in-memory per-IP limiter. The OpenAQ key is shared by all visitors and
// capped at 60 requests/minute, so we keep individual visitors well below that.
// (Per serverless instance — good enough as a guard, not a hard guarantee.)

const hits = new Map<string, number[]>();

export function allow(key: string, max = 4, windowMs = 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}
