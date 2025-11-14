# File Store Implementierung - Svelte 5 Best Practices

## Zusammenfassung

Der File Store wurde mit **SvelteSet** implementiert, einer reaktiven Version des nativen JavaScript `Set`.

## Warum SvelteSet statt normalem Set?

### Vorteile von SvelteSet:

1. **Automatische Reaktivität**
   - Methoden wie `.add()`, `.delete()`, `.clear()` triggern automatisch UI-Updates
   - Kein manuelles Tracking notwendig

2. **Perfekt für deinen Use-Case**
   - Batch-Upload von Einzelbildern
   - Automatische Deduplikation (Set verhindert Duplikate)
   - Effiziente Operationen für große Mengen

3. **Svelte 5 Best Practice**
   - Nutzt das neue Reaktivitätssystem
   - Konsistent mit anderen reaktiven Strukturen (SvelteMap, SvelteDate, etc.)

### Vergleich: Normales Set vs. SvelteSet

```ts
// ❌ FALSCH: Normales Set mit $state
let files = $state(new Set<File>());
files.add(file); // ⚠️ UI wird NICHT automatisch aktualisiert!

// ✅ RICHTIG: SvelteSet
import { SvelteSet } from 'svelte/reactivity';
let files = new SvelteSet<File>();
files.add(file); // ✅ UI wird automatisch aktualisiert!
```

### Alternativen und wann sie Sinn ergeben:

**Option 1: Array mit $state (Wrapped State Proxy)**

```ts
let files = $state<File[]>([]);
files.push(file); // Funktioniert, aber keine Duplikat-Prävention
```

- ✅ Gut für: Reihenfolge wichtig, Duplikate erlaubt
- ❌ Schlecht für: Manuelle Duplikat-Checks nötig

**Option 2: Objekt/Map mit $state**

```ts
let files = $state(new Map<string, File>());
files.set(file.name, file); // Funktioniert, aber nicht ideal
```

- ✅ Gut für: Key-basierter Zugriff
- ❌ Schlecht für: Komplexer für einfache Listen

**Option 3: SvelteSet (GEWÄHLT)**

```ts
import { SvelteSet } from 'svelte/reactivity';
let files = new SvelteSet<File>();
files.add(file); // Perfekt!
```

- ✅ Automatische Duplikat-Prävention
- ✅ Optimale Performance
- ✅ Einfachste API

## Implementierung

### file-state.svelte.ts

```typescript
import { SvelteSet } from 'svelte/reactivity';

class FileState {
	// Public reactive set - kann direkt verwendet werden
	files = new SvelteSet<File>();

	// Convenience-Methoden
	addFile(file: File): void {
		this.files.add(file);
	}

	addFiles(files: File[] | FileList): void {
		for (const file of files) {
			this.files.add(file);
		}
	}

	removeFile(file: File): void {
		this.files.delete(file);
	}

	clearFiles(): void {
		this.files.clear();
	}

	// Getter für einfachen Array-Zugriff
	get fileList(): File[] {
		return Array.from(this.files);
	}

	get count(): number {
		return this.files.size;
	}
}

export const fileState = new FileState();
```

### Warum diese Struktur?

1. **Singleton-Pattern**: Eine globale Instanz für die gesamte App
2. **Public `files`**: Direkter Zugriff möglich für fortgeschrittene Nutzung
3. **Convenience-Methoden**: Vereinfachen häufige Operationen
4. **Getter**: Reactive Derived Values (automatisch aktualisiert)

## Verwendung in Komponenten

### Schreiben (Upload-Area)

```svelte
<script>
	import { fileState } from '$lib/file-state.svelte';

	function processFiles(files: FileList) {
		fileState.addFiles(files);
		console.log(`Total files: ${fileState.count}`);
	}
</script>
```

### Lesen (Uploaded-Files)

```svelte
<script>
	import { fileState } from '$lib/file-state.svelte';
</script>

<!-- Automatisch reaktiv - kein $derived nötig! -->
{#if fileState.count > 0}
	<h3>Files: {fileState.count}</h3>

	{#each fileState.fileList as file}
		<li>{file.name}</li>
	{/each}
{/if}
```

### Wichtig zu verstehen:

- **`fileState.count`** und **`fileState.fileList`** sind Getter → automatisch reaktiv
- **`fileState.files.size`** ist direkter Zugriff auf SvelteSet → ebenfalls reaktiv
- **`#each fileState.fileList`** re-rendert automatisch bei Änderungen

## Weitere Best Practices

### ✅ Do's

```typescript
// Direkter Zugriff auf SvelteSet
if (fileState.files.has(someFile)) { ... }

// Iteration
for (const file of fileState.files) { ... }

// In $derived verwenden
let totalSize = $derived(
  fileState.fileList.reduce((sum, f) => sum + f.size, 0)
);
```

### ❌ Don'ts

```typescript
// Nicht: Set ersetzen
fileState.files = new SvelteSet(); // ❌ Bricht Reaktivität!

// Stattdessen: clear() verwenden
fileState.clearFiles(); // ✅
```

## Nächste Schritte für deine App

1. **Metadata Extraction**: EXIF-Daten (GPS) aus Bildern lesen
2. **Preview Generation**: Thumbnails generieren
3. **Upload Queue**: Batch-Upload mit Progress
4. **State Persistence**: Optional in localStorage speichern

### Beispiel: Erweitern für Upload-Status

```typescript
class FileState {
	files = new SvelteSet<File>();
	uploadStatus = $state<Map<File, 'pending' | 'uploading' | 'done' | 'error'>>(new Map());

	addFile(file: File) {
		this.files.add(file);
		this.uploadStatus.set(file, 'pending');
	}
}
```

## Dokumentation

- [Svelte 5 $state](https://svelte.dev/docs/svelte/$state)
- [Svelte 5 Reactivity](https://svelte.dev/docs/svelte/svelte-reactivity)
- [SvelteSet API](https://svelte.dev/docs/svelte/svelte-reactivity#SvelteSet)
