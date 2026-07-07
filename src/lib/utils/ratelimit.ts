// src/lib/utils/ratelimit.ts
// Rate limiting via Upstash Redis (sliding window algorithm)
// Docs: https://upstash.com/docs/redis/sdks/ratelimit-ts/overview

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ── Redis client ──────────────────────────────────────────────────────────────
function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set')
  }

  return new Redis({ url, token })
}

// ── Rate limiters ─────────────────────────────────────────────────────────────

let generationLimiter: Ratelimit | null = null
let exportLimiter: Ratelimit | null = null

/**
 * 20 generations per hour per user (free plan)
 * Sliding window — resets continuously, not at fixed intervals
 */
export function getGenerationLimiter(): Ratelimit {
  if (!generationLimiter) {
    generationLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(20, '1 h'),
      prefix: 'rl:generate',
      analytics: true,
    })
  }
  return generationLimiter
}

/**
 * 30 exports per hour per user
 */
export function getExportLimiter(): Ratelimit {
  if (!exportLimiter) {
    exportLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(30, '1 h'),
      prefix: 'rl:export',
      analytics: true,
    })
  }
  return exportLimiter
}

// ── Helper ────────────────────────────────────────────────────────────────────

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number // Unix timestamp ms
}

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<RateLimitResult> {
  const result = await limiter.limit(identifier)
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  }
}
