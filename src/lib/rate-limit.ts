const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  opts: { maxRequests: number; windowMs: number } = { maxRequests: 20, windowMs: 15 * 60 * 1000 },
) {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + opts.windowMs });
    return;
  }

  if (record.count >= opts.maxRequests) {
    throw new Error("Prea multe cereri. Incearca din nou mai tarziu.");
  }

  record.count++;
}

export function withRateLimit<R>(
  fn: () => Promise<R>,
  key: string,
  opts?: { maxRequests: number; windowMs: number },
): Promise<R> {
  checkRateLimit(key, opts);
  return fn();
}
