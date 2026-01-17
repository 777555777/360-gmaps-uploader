# Pano Publisher - AI Coding Instructions

## Architecture Overview

**Pano Publisher** is a SvelteKit 5 app for uploading 360° equirectangular images to Google Street View. All image processing happens client-side until publish.

### Core Architecture Patterns

1. **State Management**: Global reactive state using Svelte 5 runes (`$state`, `$derived`, `$effect`)
   - State files: `*-state.svelte.ts` (use `.svelte.ts` extension for reactive classes)
   - Use `SvelteSet` and `SvelteMap` for reactive collections (auto-triggers UI updates)
   - Example: [file-state.svelte.ts](src/lib/file-state.svelte.ts) manages files with `new SvelteSet<File>()`

2. **Worker Pool for Performance**: Thumbnail generation uses Web Worker pool pattern
   - [thumbnail-pool.ts](src/lib/workers/thumbnail-pool.ts): Manages 2-4 workers based on CPU cores
   - [thumbnail.worker.ts](src/lib/workers/thumbnail.worker.ts): Runs in separate thread using `OffscreenCanvas`
   - Import workers with Vite's `?worker` suffix: `import Worker from './file.worker?worker'`
   - Prevents UI blocking for large batch uploads (10+ 60MB images)

3. **Async Metadata Extraction**: Files added synchronously, metadata loaded in background
   - Queue system with max 3 concurrent extractions to prevent memory overload
   - See [file-state.svelte.ts](src/lib/file-state.svelte.ts) `extractMetadataAsync()` method

4. **GPano XMP Metadata**: Critical for Google Street View API acceptance
   - Required fields: `ProjectionType`, `UsePanoramaViewer`, `FullPanoWidthPixels`, etc.
   - [gpano-helpers.ts](src/lib/utils/gpano-helpers.ts): Extract/validate/inject GPano metadata
   - Only reads first 2MB of JPEG (metadata always at start) for performance
   - Auto-fix dialog: [gpano-fix-dialog.svelte](src/lib/components/upload-list/gpano-fix-dialog.svelte)

5. **Google OAuth with GIS**: Uses Authorization Code Flow (NOT deprecated Implicit Flow)
   - [auth-state.svelte.ts](src/lib/auth-state.svelte.ts): Token management with expiry tracking
   - Scopes: `streetviewpublish`, `userinfo.email`, `userinfo.profile`
   - See [GOOGLE_AUTH_SETUP.md](docs/GOOGLE_AUTH_SETUP.md) for OAuth setup

6. **Street View Upload Flow** (3-step process):

   ```typescript
   // 1. Request upload URL
   const { uploadUrl } = await startUpload(accessToken);
   // 2. Upload raw JPEG bytes
   await uploadPhotoBytes(uploadUrl, file);
   // 3. Publish with metadata (makes it LIVE)
   await publishPhoto(accessToken, uploadUrl, pose, captureTime);
   ```

   - Implementation: [streetview-api.ts](src/lib/utils/streetview-api.ts)
   - Dry-run mode: Set `PUBLIC_DRY_RUN=true` in `.env` to skip step 3

## Key Component Patterns

- **Dialog Management**: Use `commandfor` attribute with dialog IDs from [globals.ts](src/lib/globals.ts)

  ```svelte
  <button commandfor="publish-dialog" command="show-modal">Open</button>
  ```

  - Helper functions: [dialog-helpers.ts](src/lib/utils/dialog-helpers.ts)

- **Map Integration**: Leaflet map with custom marker icons and popups
  - [map-state.svelte.ts](src/lib/map-state.svelte.ts): Manages map instance and markers
  - [map.svelte](src/lib/components/map.svelte): Map component with coordinate picking mode
  - Marker colors: blue (default), green (selected), gray (published)

- **Reactive Selections**: Use `SvelteSet` for selected files
  ```typescript
  selectedFiles = new SvelteSet<File>();
  selectedFiles.add(file); // Automatically reactive
  ```

## Development Workflow

### Commands

```bash
npm run dev              # Start dev server (port 5173)
npm run build            # Build for production (outputs to build/)
npm run preview          # Test production build
npm run check            # Type check with svelte-check
npm run lint             # ESLint + Prettier check
npm run format           # Auto-format with Prettier
npm run deploy           # Deploy to server (requires DEPLOY_SERVER_PATH in .env)
```

### Environment Setup

Copy `.env-template` → `.env` and set:

- `PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `PUBLIC_DRY_RUN=true`: Test mode (skips actual publish to Google)

### Deployment

- Uses `@sveltejs/adapter-node` for Node.js server
- [deploy.sh](deploy.sh): Builds locally, SCPs to server, runs Docker
- Docker setup: [docker/Dockerfile](docker/Dockerfile) + nginx reverse proxy

## Project-Specific Conventions

1. **File Naming**:
   - Reactive state files: `*-state.svelte.ts` (contains `$state`, `$derived`, etc.)
   - Components: `kebab-case.svelte`
   - Utils: `kebab-case.ts`

2. **Import Aliases**: Use `$lib` for `src/lib/`

   ```typescript
   import { fileState } from '$lib/file-state.svelte';
   import Map from '$lib/components/map.svelte';
   ```

3. **Error Handling**: Store errors in reactive state maps

   ```typescript
   metadataErrors = new SvelteMap<File, string>();
   metadataErrors.set(file, 'Error message');
   ```

4. **CSS Variables**: Use custom properties from [app.css](src/app.css) and [colors.css](src/colors.css)
   - Example: `--marker-default`, `--marker-selected`, `--surface-base`

5. **Constants**: Define in [globals.ts](src/lib/globals.ts)
   - Max file size: 75MB
   - Max concurrent uploads: 4
   - Supported formats: JPEG only

## Critical Dependencies

- **Svelte 5**: Uses new runes syntax (`$state`, `$derived`, `$effect`)
- **SvelteKit 2**: File-based routing, server-side rendering
- **Leaflet**: Map rendering (`L.map`, `L.marker`, `L.divIcon`)
- **@photo-sphere-viewer/core**: 360° panorama viewer
- **exifr**: EXIF/XMP metadata extraction (used for GPS and GPano data)
- **@lucide/svelte**: Icon library

## Testing & Debugging

- **Dry-Run Mode**: Set `PUBLIC_DRY_RUN=true` to test without publishing to Google
- **Browser DevTools**: Check Web Worker performance in Performance tab
- **Metadata Validation**: Use GPano fix dialog to inspect missing XMP fields
- **Console Logs**: Auth/upload errors logged with structured messages

## Documentation References

- [WORKER_POOL_ARCHITECTURE.md](docs/WORKER_POOL_ARCHITECTURE.md): Worker pool design and performance
- [FILE_STORE_EXPLANATION.md](docs/FILE_STORE_EXPLANATION.md): Why `SvelteSet` over arrays/objects
- [GPANO_VALIDATION_IMPLEMENTATION.md](docs/GPANO_VALIDATION_IMPLEMENTATION.md): GPano metadata requirements
- [GOOGLE_AUTH_SETUP.md](docs/GOOGLE_AUTH_SETUP.md): OAuth client ID setup guide
