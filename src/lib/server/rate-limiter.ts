// src/lib/server/rate-limiter.ts
import { createHash } from 'crypto';

interface RateLimitResult {
	allowed: boolean;
	remaining: number;
	resetAt: number;
}

interface RateLimitEntry {
	count: number;
	resetAt: number;
}

// Track unknown client hits for monitoring
let unknownHits = 0;

export function incrementUnknown() {
	unknownHits++;
}

export function getUnknownStats() {
	return { unknownHits };
}

export const UNKNOWN_CLIENT = 'unknown';

/**
 * Rate limiter with GDPR-compliant IP hashing
 * IPs are hashed with a daily rotating salt to prevent identification
 */
class RateLimiter {
	private limits: Map<string, RateLimitEntry> = new Map();
	private readonly maxRequests: number;
	private readonly windowMs: number;
	private cleanupInterval: NodeJS.Timeout | null = null;

	constructor(maxRequests: number, windowMs: number) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;

		// Cleanup expired entries every 5 minutes
		this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
	}

	check(identifier: string): RateLimitResult {
		const now = Date.now();
		const entry = this.limits.get(identifier);

		// No entry or expired entry
		if (!entry || now > entry.resetAt) {
			const resetAt = now + this.windowMs;
			this.limits.set(identifier, { count: 1, resetAt });
			return {
				allowed: true,
				remaining: this.maxRequests - 1,
				resetAt
			};
		}

		// Entry exists and is valid
		if (entry.count < this.maxRequests) {
			entry.count++;
			return {
				allowed: true,
				remaining: this.maxRequests - entry.count,
				resetAt: entry.resetAt
			};
		}

		// Limit exceeded
		return {
			allowed: false,
			remaining: 0,
			resetAt: entry.resetAt
		};
	}

	private cleanup() {
		const now = Date.now();
		for (const [key, entry] of this.limits.entries()) {
			if (now > entry.resetAt) {
				this.limits.delete(key);
			}
		}
	}

	/**
	 * Get anonymized statistics (GDPR-safe)
	 * Does not expose any identifiable information
	 */
	getStats() {
		return {
			activeIdentifiers: this.limits.size, // Changed from activeIPs
			maxRequests: this.maxRequests,
			windowMs: this.windowMs
		};
	}

	/**
	 * Cleanup resources on shutdown
	 */
	destroy() {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}
		this.limits.clear();
	}
}

/**
 * Time-based cache with automatic expiration
 */
class Cache<T> {
	private cache: Map<string, { data: T; expiresAt: number }> = new Map();
	private readonly ttlMs: number;
	private cleanupInterval: NodeJS.Timeout | null = null;

	constructor(ttlMs: number) {
		this.ttlMs = ttlMs;

		// Cleanup expired entries every minute
		this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
	}

	get(key: string): T | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		if (Date.now() > entry.expiresAt) {
			this.cache.delete(key);
			return null;
		}

		return entry.data;
	}

	set(key: string, data: T): void {
		this.cache.set(key, {
			data,
			expiresAt: Date.now() + this.ttlMs
		});
	}

	private cleanup() {
		const now = Date.now();
		for (const [key, entry] of this.cache.entries()) {
			if (now > entry.expiresAt) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * Get cache statistics (GDPR-safe)
	 */
	getStats() {
		return {
			entries: this.cache.size,
			ttlMs: this.ttlMs
		};
	}

	clear() {
		this.cache.clear();
	}

	/**
	 * Cleanup resources on shutdown
	 */
	destroy() {
		if (this.cleanupInterval) {
			clearInterval(this.cleanupInterval);
			this.cleanupInterval = null;
		}
		this.cache.clear();
	}
}

/**
 * Hash IP address for GDPR compliance
 * Uses daily rotating salt to prevent long-term tracking
 *
 * @param ip - The client IP address
 * @returns Hashed identifier (first 16 chars of SHA-256)
 */
function hashIP(ip: string): string {
	// Daily rotating salt (resets at midnight UTC)
	const today = new Date().toISOString().split('T')[0];
	const salt = `rate-limit-${today}`;

	// Hash IP with daily salt
	const hash = createHash('sha256');
	hash.update(ip + salt);

	// Return first 16 characters (sufficient for collision avoidance)
	return hash.digest('hex').substring(0, 16);
}

/**
 * Extract client IP from request headers
 *
 * @param request - The incoming request
 * @returns Client IP address or hashed fallback
 */
export function getClientIP(request: Request): string {
	const realIp = request.headers.get('x-real-ip');
	if (realIp) {
		return hashIP(realIp);
	}

	return UNKNOWN_CLIENT;
}

// Rate limiters
export const geocodingRateLimiter = new RateLimiter(
	20, // 20 requests
	60 * 1000 // per minute
);

export const dailyRateLimiter = new RateLimiter(
	500, // 500 requests
	24 * 60 * 60 * 1000 // per day
);

// Cache for geocoding results (5 minutes TTL)
// Stores API responses, not user data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const geocodingCache = new Cache<any>(5 * 60 * 1000);

/**
 * Get aggregated statistics for monitoring
 * All data is anonymized and GDPR-compliant
 *
 * Use this for:
 * - Monitoring endpoints (see example below)
 * - Health checks
 * - Capacity planning
 *
 * Example usage in +server.ts:
 * ```typescript
 * export const GET: RequestHandler = async () => {
 *   const stats = getRateLimiterStats();
 *   return json(stats);
 * };
 * ```
 */
export function getRateLimiterStats() {
	return {
		minute: geocodingRateLimiter.getStats(),
		daily: dailyRateLimiter.getStats(),
		cache: geocodingCache.getStats(),
		timestamp: new Date().toISOString()
	};
}
