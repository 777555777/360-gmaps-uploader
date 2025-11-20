# Thumbnail Worker Pool System

## 🏗️ Architektur

Das System besteht aus drei Hauptkomponenten:

### 1. **thumbnail.worker.ts** (Worker)

- Läuft in separatem Thread
- Generiert Thumbnails mit `OffscreenCanvas`
- Keine DOM-Blockierung

### 2. **thumbnail-pool.ts** (Pool Manager)

- Singleton Pattern
- Verwaltet Worker-Pool (2-8 Workers basierend auf CPU-Kernen)
- Queue-basierte Job-Verteilung
- Promise-basierte API

### 3. **worker-lifecycle.ts** (Lifecycle)

- Svelte Action für automatisches Cleanup
- Integration mit App-Lifecycle

## 📊 Performance-Vorteile

| Szenario        | Ohne Workers     | Mit Workers             | Verbesserung    |
| --------------- | ---------------- | ----------------------- | --------------- |
| 10x 60MB        | UI friert ~15s   | UI bleibt reaktiv       | ⭐⭐⭐⭐⭐      |
| Parallele Jobs  | 1 (Main Thread)  | N (CPUs)                | ~4-8x schneller |
| Memory Pressure | Hoch (Main Heap) | Verteilt (Worker Heaps) | Besser          |

## 🔄 Flow-Diagramm

```
User drops 10 images
     ↓
getThumbnail(file) × 10
     ↓
Worker Pool Queue
     ↓
┌────────┬────────┬────────┐
│Worker 1│Worker 2│Worker 3│ (parallel)
└───┬────┴───┬────┴───┬────┘
    ↓        ↓        ↓
Thumbnail 1-3 ready (Base64)
     ↓
UI updates (reactive)
```

## 🎯 Konfiguration

```typescript
// Automatisch: navigator.hardwareConcurrency
// Oder manuell:
const pool = new ThumbnailWorkerPool(4); // 4 workers
```

## 🧪 Fallback

Bei fehlender Worker-Unterstützung (z.B. alte Browser) fällt das System automatisch auf Main-Thread-Generierung zurück:

```typescript
getThumbnail(file, useWorker: false) // Force Main Thread
```

## 🔧 API

```typescript
import { getThumbnailWorkerPool } from '$lib/workers/thumbnail-pool';

const pool = getThumbnailWorkerPool();
const thumbnail = await pool.generateThumbnail(file, 512);
```

## 🧹 Cleanup

Automatisch durch Svelte Lifecycle in `+layout.svelte`:

```typescript
useWorkerPoolCleanup(); // Beendet Workers bei App-Shutdown
```
