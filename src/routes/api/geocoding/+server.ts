// src/routes/api/geocoding/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { MAPTILER_API_KEY } from '$env/static/private';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import {
	geocodingRateLimiter,
	dailyRateLimiter,
	getClientIP,
	geocodingCache,
	UNKNOWN_CLIENT,
	incrementUnknown
} from '$lib/server/rate-limiter';

// Load allowed origins from environment or use defaults
const ALLOWED_ORIGINS: string[] = [];

if (dev) {
	ALLOWED_ORIGINS.push('http://localhost:5173', 'http://localhost:4173');
} else {
	ALLOWED_ORIGINS.push('https://panopublisher.net', 'https://www.panopublisher.net');
}

/**
 * Normalize cache key for better hit rate
 * - Lowercase query
 * - Trim whitespace
 */
function createCacheKey(
	query: string,
	limit: number,
	language: string,
	autocomplete: string
): string {
	return `${query.toLowerCase().trim()}:${limit}:${language}:${autocomplete}`;
}

/**
 * Server endpoint to proxy MapTiler Geocoding API requests.
 * This protects the API key from being exposed to the client.
 *
 * GDPR Compliance:
 * - IP addresses are hashed with daily rotating salt (Art. 32 DSGVO - Pseudonymisierung)
 * - No personal data is logged
 * - Rate limiting serves legitimate security interests (Art. 6(1)(f) DSGVO)
 *
 * Rate Limiting:
 * - 20 requests per minute per client
 * - 500 requests per day per client
 * - Caching: 5 minutes for identical queries
 *
 * Query parameters:
 * - q: Search query (required, 2-200 chars)
 * - limit: Maximum number of results (1-10, default: 5)
 * - language: Preferred language (default: de)
 * - autocomplete: Enable autocomplete mode (default: true)
 */
export const GET: RequestHandler = async ({ url, request }) => {
	// CORS Headers
	const origin = request.headers.get('origin');
	const corsHeaders: Record<string, string> = {};

	if (origin && ALLOWED_ORIGINS.includes(origin)) {
		corsHeaders['Access-Control-Allow-Origin'] = origin;
		corsHeaders['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
		corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type';
	}

	// Feature flag: Check if geocoding API is enabled
	if (env.PUBLIC_ENABLE_MAP_SEARCH === 'false') {
		return json(
			{ error: 'Service disabled', message: 'Geocoding service is currently disabled' },
			{ status: 503 }
		);
	}

	// Validate query parameter early (needed for cache check)
	const query = url.searchParams.get('q');
	if (!query) {
		return json(
			{ error: 'Missing parameter', message: 'Query parameter "q" is required' },
			{ status: 400, headers: corsHeaders }
		);
	}

	// Validate query length
	if (query.length < 2) {
		return json(
			{ error: 'Query too short', message: 'Query must be at least 2 characters' },
			{ status: 400, headers: corsHeaders }
		);
	}

	if (query.length > 200) {
		return json(
			{ error: 'Query too long', message: 'Query cannot exceed 200 characters' },
			{ status: 400, headers: corsHeaders }
		);
	}

	// Validate and sanitize limit parameter
	const limitParam = url.searchParams.get('limit') || '5';
	const limitNum = parseInt(limitParam);
	if (isNaN(limitNum) || limitNum < 1 || limitNum > 10) {
		return json(
			{ error: 'Invalid limit', message: 'Limit must be between 1 and 10' },
			{ status: 400, headers: corsHeaders }
		);
	}

	const language = url.searchParams.get('language') || 'de';
	const autocomplete = url.searchParams.get('autocomplete') || 'true';

	// Check cache BEFORE rate limiting (cached responses shouldn't count against limit)
	const cacheKey = createCacheKey(query, limitNum, language, autocomplete);
	const cachedData = geocodingCache.get(cacheKey);

	if (cachedData) {
		return json(cachedData, {
			headers: {
				...corsHeaders,
				'X-Cache': 'HIT',
				'Cache-Control': 'public, max-age=300' // 5 minutes
			}
		});
	}

	// Rate limiting checks (only for non-cached requests)
	const clientIP = getClientIP(request);

	if (clientIP === UNKNOWN_CLIENT) {
		incrementUnknown();
	}

	// Check per-minute limit
	const minuteLimit = geocodingRateLimiter.check(clientIP);
	if (!minuteLimit.allowed) {
		const resetIn = Math.ceil((minuteLimit.resetAt - Date.now()) / 1000);
		return json(
			{
				error: 'Rate limit exceeded',
				message: `Too many requests. Try again in ${resetIn} seconds.`,
				retryAfter: resetIn
			},
			{
				status: 429,
				headers: {
					...corsHeaders,
					'Retry-After': resetIn.toString()
				}
			}
		);
	}

	// Check daily limit
	const dayLimit = dailyRateLimiter.check(clientIP);
	if (!dayLimit.allowed) {
		const resetIn = Math.ceil((dayLimit.resetAt - Date.now()) / 1000 / 60); // minutes
		return json(
			{
				error: 'Daily limit exceeded',
				message: `Daily limit of 500 requests reached. Resets in ${resetIn} minutes.`
			},
			{
				status: 429,
				headers: {
					...corsHeaders,
					'X-RateLimit-Reset': new Date(dayLimit.resetAt).toISOString()
				}
			}
		);
	}

	if (!MAPTILER_API_KEY) {
		console.error('[Geocoding] MAPTILER_API_KEY is not configured');
		return json(
			{ error: 'Configuration error', message: 'Geocoding service is not configured' },
			{ status: 500, headers: corsHeaders }
		);
	}

	try {
		// Build MapTiler API URL
		const maptilerUrl = new URL(
			`https://api.maptiler.com/geocoding/${encodeURIComponent(query)}.json`
		);
		maptilerUrl.searchParams.set('key', MAPTILER_API_KEY);
		maptilerUrl.searchParams.set('limit', limitNum.toString());
		maptilerUrl.searchParams.set('language', language);
		maptilerUrl.searchParams.set('autocomplete', autocomplete);

		// Fetch from MapTiler API with timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		let response: Response;
		try {
			response = await fetch(maptilerUrl.toString(), { signal: controller.signal });
		} finally {
			clearTimeout(timeoutId);
		}

		if (!response.ok) {
			const statusText = response.statusText || 'Unknown error';
			console.error(`[Geocoding] MapTiler API error: ${response.status} ${statusText}`);
			return json(
				{ error: 'Geocoding failed', message: 'External geocoding service error' },
				{ status: response.status, headers: corsHeaders }
			);
		}

		const data = await response.json();

		// Store in cache (5 minutes)
		geocodingCache.set(cacheKey, data);

		// Anonymized warning logs (GDPR-safe)
		if (minuteLimit.remaining < 5) {
			console.warn(
				`[Geocoding] Client approaching minute limit: ${minuteLimit.remaining} remaining`
			);
		}
		if (dayLimit.remaining < 50) {
			console.warn(`[Geocoding] Client approaching daily limit: ${dayLimit.remaining} remaining`);
		}

		return json(data, {
			headers: {
				...corsHeaders,
				'X-Cache': 'MISS',
				'X-RateLimit-Limit-Minute': '20',
				'X-RateLimit-Remaining-Minute': minuteLimit.remaining.toString(),
				'X-RateLimit-Limit-Day': '500',
				'X-RateLimit-Remaining-Day': dayLimit.remaining.toString(),
				'X-RateLimit-Reset': new Date(minuteLimit.resetAt).toISOString()
			}
		});
	} catch (err) {
		// Handle timeout errors specifically
		if (err instanceof Error && err.name === 'AbortError') {
			console.error('[Geocoding] Request timeout after 10 seconds');
			return json(
				{ error: 'Timeout', message: 'Geocoding service took too long to respond' },
				{ status: 504, headers: corsHeaders }
			);
		}

		// Sanitized error logging (no sensitive data)
		console.error(
			'[Geocoding] Request processing error:',
			err instanceof Error ? err.message : 'Unknown error'
		);
		return json(
			{ error: 'Internal error', message: 'Failed to process geocoding request' },
			{ status: 500, headers: corsHeaders }
		);
	}
};

// Handle OPTIONS request for CORS preflight
export const OPTIONS: RequestHandler = async ({ request }) => {
	// Feature toggle: Check if geocoding API is enabled
	if (env.PUBLIC_ENABLE_MAP_SEARCH === 'false') {
		return new Response(null, { status: 503 });
	}

	const origin = request.headers.get('origin');

	if (origin && ALLOWED_ORIGINS.includes(origin)) {
		return new Response(null, {
			status: 204,
			headers: {
				'Access-Control-Allow-Origin': origin,
				'Access-Control-Allow-Methods': 'GET, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
				'Access-Control-Max-Age': '86400' // 24 hours
			}
		});
	}

	return new Response(null, { status: 403 });
};
