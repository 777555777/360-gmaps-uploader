# Rate Limiting Implementation

## Overview

This application implements server-side rate limiting to protect external API services (MapTiler Geocoding) from abuse and to stay within free-tier limits.

## Implementation

### Server-Side (`src/lib/server/rate-limiter.ts`)

- **In-Memory Store**: Simple Map-based storage (suitable for single-server deployments)
- **IP-Based Tracking**: Identifies users by their IP address
- **Automatic Cleanup**: Expired entries are cleaned up every 5 minutes to prevent memory leaks

### Geocoding Endpoint Rate Limit

- **Limit**: 20 requests per minute per IP address
- **Window**: 60 seconds (sliding window)
- **Response on Limit Exceeded**: HTTP 429 with retry-after information

```typescript
// Rate limit exceeded response
{
  "message": "Rate limit exceeded. Try again in 45 seconds.",
  "retryAfter": 45
}
```

### Response Headers

All successful geocoding responses include these headers:

```
X-RateLimit-Limit: 20
X-RateLimit-Remaining: 15
X-RateLimit-Reset: 2026-01-12T10:30:00.000Z
```

## Client-Side Protection

Additional client-side safeguards (UX layer, not security):

1. **Debouncing**: 500ms delay before making requests
2. **Request Cancellation**: Previous requests are aborted
3. **Consent Check**: Search disabled without cookie consent

## IP Address Detection

The rate limiter checks headers in this order:

1. `X-Forwarded-For` (most common with reverse proxies)
2. `X-Real-IP` (nginx, some other proxies)
3. `CF-Connecting-IP` (Cloudflare)
4. Falls back to "unknown" if none available

## For Production

### Multi-Server Deployments

If you scale to multiple servers, replace the in-memory store with a distributed solution:

- **Redis**: Most popular choice, built for this use case
- **Memcached**: Lighter alternative
- **Database**: Works but adds latency

Example Redis implementation:

```bash
npm install ioredis
```

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function checkRateLimit(ip: string): Promise<boolean> {
	const key = `ratelimit:geocoding:${ip}`;
	const count = await redis.incr(key);

	if (count === 1) {
		await redis.expire(key, 60); // 60 seconds
	}

	return count <= 20;
}
```

### Docker Deployment

If using Docker with nginx reverse proxy (like in this project), ensure the proxy passes the real IP:

```nginx
# In nginx config
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;
```

## Monitoring

You can monitor rate limiting stats (useful for detecting abuse):

```typescript
import { geocodingRateLimiter } from '$lib/server/rate-limiter';

// Get current stats
const stats = geocodingRateLimiter.getStats();
console.log(`Active IPs: ${stats.totalEntries}`);
console.log(`IPs: ${stats.activeIPs.join(', ')}`);
```

## Cost Calculation

With current settings:

- **Max per IP**: 20 requests/minute = 1,200 requests/hour
- **Estimated real usage**: ~3-5 requests/minute per active user
- **MapTiler Free Tier**: 100,000 requests/month
- **Safety Margin**: Very comfortable, even with 100+ concurrent users

## Security Considerations

1. **IP Spoofing**: Mitigated by using trusted proxy headers (X-Forwarded-For)
2. **DDoS Protection**: In-memory store has bounded memory (old entries cleaned up)
3. **Multiple IPs**: Users behind NAT share the same limit (acceptable trade-off)

For high-security scenarios, consider:

- User-based rate limiting (requires authentication)
- Captcha after certain threshold
- CDN-level rate limiting (Cloudflare, etc.)
