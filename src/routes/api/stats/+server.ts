// src/routes/api/stats/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRateLimiterStats, getUnknownStats } from '$lib/server/rate-limiter';
import { dev } from '$app/environment';
import { STATS_API_TOKEN } from '$env/static/private';

/**
 * Monitoring endpoint for rate limiter statistics
 *
 * Returns anonymized metrics about:
 * - Active rate-limited clients (no IPs exposed)
 * - Cache performance
 * - System health
 *
 * GDPR-compliant: No personal data included
 *
 * Security: In production, protect this endpoint with authentication
 * or restrict to internal network only
 *
 *  example:
 *  curl -H "Authorization: Bearer STATS_API_TOKEN" https://panopublisher.net/api/stats
 */
export const GET: RequestHandler = async ({ request }) => {
	// In production: Add authentication or IP whitelist
	if (!dev) {
		const authHeader = request.headers.get('authorization');
		const expectedToken = STATS_API_TOKEN;

		if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
	}

	const stats = getRateLimiterStats();

	return json(
		{
			...stats,
			uptime: process.uptime(),
			memory: {
				heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
				heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) // MB
			},
			...getRateLimiterStats(),
			unknown: getUnknownStats()
		},
		{
			headers: {
				'Cache-Control': 'private, no-cache'
			}
		}
	);
};
