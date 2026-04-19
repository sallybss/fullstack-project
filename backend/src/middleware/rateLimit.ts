import { type Request, type RequestHandler, type Response } from "express";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type KeyGenerator = (req: Request) => string | null;

type RateLimitOptions = {
  keyPrefix: string;
  windowMs: number;
  maxRequests: number;
  message: string;
  keyGenerator: KeyGenerator;
};

const buckets = new Map<string, RateLimitBucket>();

function getIpAddress(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return String(forwardedFor[0]).trim();
  }
  return req.ip || "unknown";
}

export function createIpRateLimiter(options: Omit<RateLimitOptions, "keyGenerator">): RequestHandler {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => getIpAddress(req),
  });
}

function getRetryAfterSeconds(resetAt: number): number {
  return Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
}

function sendRateLimitResponse(res: Response, message: string, resetAt: number) {
  const retryAfter = getRetryAfterSeconds(resetAt);
  res.setHeader("Retry-After", String(retryAfter));
  return res.status(429).send(message);
}

export function createRateLimiter(options: RateLimitOptions): RequestHandler {
  const { keyPrefix, windowMs, maxRequests, message, keyGenerator } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    if (!key) {
      return next();
    }

    const bucketKey = `${keyPrefix}:${key}`;
    const now = Date.now();
    const existingBucket = buckets.get(bucketKey);

    if (!existingBucket || existingBucket.resetAt <= now) {
      buckets.set(bucketKey, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (existingBucket.count >= maxRequests) {
      return sendRateLimitResponse(res, message, existingBucket.resetAt);
    }

    existingBucket.count += 1;
    buckets.set(bucketKey, existingBucket);
    return next();
  };
}

export function createUserRateLimiter(options: Omit<RateLimitOptions, "keyGenerator">): RequestHandler {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => {
      const userId = (req as any).user?.id;
      return typeof userId === "string" && userId.trim()
        ? userId
        : getIpAddress(req);
    },
  });
}

export function createLoginRateLimiter(options: Omit<RateLimitOptions, "keyGenerator">): RequestHandler {
  return createRateLimiter({
    ...options,
    keyGenerator: (req) => {
      const email = typeof req.body?.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
      return `${getIpAddress(req)}:${email || "unknown-email"}`;
    },
  });
}

setInterval(() => {
  const now = Date.now();

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}, 60_000).unref();
