# Geocoding Feature Toggle

## Setup in `.env`

```bash
# Map Search aktivieren (Standard)
PUBLIC_ENABLE_MAP_SEARCH=true

# Map Search deaktivieren
PUBLIC_ENABLE_MAP_SEARCH=false
```

## Server-seitig (API Endpoint)

Die API wird automatisch deaktiviert und gibt `503 Service Unavailable` zurück:

```typescript
// src/routes/api/geocoding/+server.ts
import { env } from '$env/dynamic/public';

if (env.PUBLIC_ENABLE_MAP_SEARCH === 'false') {
	return json(
		{ error: 'Service disabled', message: 'Geocoding service is currently disabled' },
		{ status: 503 }
	);
}
```

## Client-seitig (UI Component)

**Option 1: Mit `$env/dynamic/public` (Runtime)**

```svelte
<script lang="ts">
	import { env } from '$env/dynamic/public';

	const searchEnabled = env.PUBLIC_ENABLE_MAP_SEARCH !== 'false';
</script>

{#if searchEnabled}
	<input type="search" placeholder="Ort suchen..." />
{/if}
```

**Option 2: Mit `$env/static/public` (Build-Zeit, empfohlen)**

```svelte
<script lang="ts">
	import { PUBLIC_ENABLE_MAP_SEARCH } from '$env/static/public';

	const searchEnabled = PUBLIC_ENABLE_MAP_SEARCH !== 'false';
</script>

{#if searchEnabled}
	<input type="search" placeholder="Ort suchen..." />
{/if}
```

## Unterschied static vs dynamic

| Import                | Verfügbarkeit  | Optimierung          | Use Case            |
| --------------------- | -------------- | -------------------- | ------------------- |
| `$env/static/public`  | Zur Build-Zeit | Tree-shaking möglich | Produktions-Build   |
| `$env/dynamic/public` | Zur Laufzeit   | Kein Tree-shaking    | Development/Testing |

**Empfehlung:** Nutze `$env/static/public` im Production-Code für bessere Performance.

## Warum `PUBLIC_` Prefix?

SvelteKit unterscheidet zwischen:

- **Private ENV** (nur server-seitig): `MAPTILER_API_KEY`
- **Public ENV** (client + server): `PUBLIC_ENABLE_MAP_SEARCH`

Public-Variablen brauchen das `PUBLIC_` Prefix als Sicherheitswarnung, da sie im Client-Bundle landen.

## Best Practice

```svelte
<!-- src/lib/components/map/search-field.svelte -->
<script lang="ts">
	import { PUBLIC_ENABLE_MAP_SEARCH } from '$env/static/public';

	// Feature-Flag nur einmal evaluieren
	const FEATURE_ENABLED = PUBLIC_ENABLE_MAP_SEARCH !== 'false';
</script>

{#if FEATURE_ENABLED}
	<div class="search-container">
		<!-- Dein Suchfeld -->
	</div>
{/if}
```

Dies entfernt den gesamten Search-Code aus dem Bundle wenn `PUBLIC_ENABLE_MAP_SEARCH=false`.
