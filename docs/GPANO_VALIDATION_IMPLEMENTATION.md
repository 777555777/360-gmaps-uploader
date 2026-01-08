# GPano Metadata Auto-Fix

Google Street View requires specific XMP metadata (GPano namespace) to recognize 360° photos. This feature validates and auto-fixes missing metadata client-side.

## How It Works

### Upload Flow

```
User drops files → validateStreetViewImage() → gpanoFixState.processValidationResults()
                                                         ↓
                    ┌──────────────────────────────────────────────────────────────┐
                    │                   Categorize files:                          │
                    │  • isValid=true → validFiles[] (add directly)                │
                    │  • canAutoFix=true → filesToFix Map (show fix dialog)        │
                    │  • else → rejectedFiles[] (show error dialog)                │
                    └──────────────────────────────────────────────────────────────┘
                                                         ↓
                    If fixable/rejected files exist → Show GPanoFixDialog
                                                         ↓
                    User clicks "Add all" → injectGPanoMetadata() → fileState.addFiles()
```

### File Categorization

| Validation Result                      | Category        | Dialog Action         |
| -------------------------------------- | --------------- | --------------------- |
| All checks pass                        | `validFiles`    | Auto-added, no dialog |
| Missing GPano but 2:1 ratio + JPEG     | `filesToFix`    | Can be auto-fixed     |
| Wrong projection type, bad ratio, etc. | `rejectedFiles` | Cannot be fixed       |

## Key Files

| File                                                                                 | Purpose                             |
| ------------------------------------------------------------------------------------ | ----------------------------------- |
| [gpano-helpers.ts](../src/lib/utils/gpano-helpers.ts)                                | Extract, validate, inject GPano XMP |
| [gpano-fix-state.svelte.ts](../src/lib/gpano-fix-state.svelte.ts)                    | Reactive state for fix dialog       |
| [gpano-fix-dialog.svelte](../src/lib/components/upload-list/gpano-fix-dialog.svelte) | UI for fixing/rejecting files       |
| [upload-area.svelte](../src/lib/components/upload-list/upload-area.svelte)           | Entry point, triggers validation    |

## Required GPano Fields

```
GPano:ProjectionType              = "equirectangular"
GPano:UsePanoramaViewer           = "True"
GPano:FullPanoWidthPixels         = <image width>
GPano:FullPanoHeightPixels        = <image height>
GPano:CroppedAreaImageWidthPixels = <image width>
GPano:CroppedAreaImageHeightPixels= <image height>
GPano:CroppedAreaLeftPixels       = "0"
GPano:CroppedAreaTopPixels        = "0"
```

## Auto-Fix Logic

**Can auto-fix when:**

- Image is valid JPEG with 2:1 aspect ratio
- Only missing GPano metadata (not wrong values)

**Cannot auto-fix when:**

- `ProjectionType` is not "equirectangular"
- Metadata dimensions don't match actual image dimensions
- Basic validation fails (wrong format, ratio, size)

## Performance

- Only reads first **2 MB** for XMP extraction (metadata is always at JPEG start)
- Only reads first **1 MB** for JPEG dimension parsing (SOF marker)
- Injection prepends new APP1 segment, preserves existing EXIF

## XMP Injection

The `injectGPanoMetadata()` function:

1. Reads full file into `ArrayBuffer`
2. Builds XMP packet with GPano namespace
3. Creates APP1 segment: `0xFFE1 [length] [namespace] [XMP]`
4. Inserts after SOI marker (byte 2), before rest of file
5. Returns new `File` object

## References

- [Photo Sphere XMP Specification](https://developers.google.com/streetview/spherical-metadata)
- [Street View Publish API](https://developers.google.com/streetview/publish/reference/rest)
