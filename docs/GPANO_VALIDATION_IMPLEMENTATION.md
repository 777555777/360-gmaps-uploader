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

## ⚠️ Critical: Clean XMP Requirement

**Google Street View API rejects images with mixed XMP namespaces!**

This was discovered through extensive testing (Jan 2026). The API returns "The image is not a 360 photo" error even when all GPano fields are present, if the XMP contains other namespaces.

### What Works ✅

```xml
<rdf:Description rdf:about=""
  xmlns:GPano="http://ns.google.com/photos/1.0/panorama/"
  GPano:UsePanoramaViewer="True"
  GPano:ProjectionType="equirectangular"
  GPano:FullPanoWidthPixels="11904"
  .../>
```

### What Fails ❌

```xml
<rdf:Description rdf:about=""
  xmlns:GPano="http://ns.google.com/photos/1.0/panorama/"
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"
  xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/"
  GPano:ProjectionType="equirectangular"
  dc:format="image/tiff"
  photoshop:DateCreated="2026-01-06"
  ...>
  <xmpMM:History>...</xmpMM:History>
</rdf:Description>
```

### Key Findings

| Image Source                 | XMP Content                    | Result   |
| ---------------------------- | ------------------------------ | -------- |
| Insta360 Studio              | GPano only                     | ✅ Works |
| Lightroom/Photoshop export   | GPano + dc + photoshop + xmpMM | ❌ Fails |
| Our auto-fix (merged)        | GPano merged into existing     | ❌ Fails |
| Our auto-fix (clean replace) | GPano only, replaces existing  | ✅ Works |

### Implementation

The `injectGPanoMetadata()` function now:

1. **Finds** existing XMP APP1 segment (if any)
2. **Replaces** it entirely with clean GPano-only XMP
3. Does NOT merge into existing metadata

This means some original metadata (dc:creator, photoshop:DateCreated, etc.) is lost, but this is necessary for Street View compatibility.

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
- XMP segment is found and replaced in-place (not prepended)

## XMP Injection

The `injectGPanoMetadata()` function:

1. Reads full file into `ArrayBuffer`
2. Finds existing XMP APP1 segment (starts with `http://ns.adobe.com/xap/1.0/`)
3. Builds **clean** XMP packet with **only** GPano namespace
4. **Replaces** existing XMP segment (or inserts after SOI if none exists)
5. Returns new `File` object

## References

- [Photo Sphere XMP Specification](https://developers.google.com/streetview/spherical-metadata)
- [Street View Publish API](https://developers.google.com/streetview/publish/reference/rest)
