## Accordion Usage

Collapsible container for content with optional grouping.

```svelte
<script>
	import Accordion from '$lib/components/util/accordion.svelte';
	import { FileImage } from '@lucide/svelte';
</script>

<Accordion name="group-1" summaryTitle="File Details">
	{#snippet header()}
		<FileImage size={16} />
	{/snippet}
	{#snippet content()}
		<p>Your accordion content goes here.</p>
		<ul>
			<li>Item 1</li>
			<li>Item 2</li>
		</ul>
	{/snippet}
</Accordion>
```

### Props

| Prop           | Type      | Required | Description                                                 |
| -------------- | --------- | -------- | ----------------------------------------------------------- |
| `summaryTitle` | `string`  | Yes      | The title displayed in the accordion header                 |
| `name`         | `string`  | No       | Groups accordions together (only one can be open at a time) |
| `header`       | `Snippet` | No       | Header snippet displayed before the title                   |
| `content`      | `Snippet` | Yes      | The main content shown when accordion is expanded           |
| `open`         | `boolean` | No       | Whether the accordion is open by default                    |

---

## Badge Usage

Colored label with optional icon and popover support.

```svelte
<script>
	import Badge from '$lib/components/util/badge.svelte';
	import { AlertCircle } from '@lucide/svelte';
</script>

<Badge message="3 Errors" level="danger">
	{#snippet icon()}
		<AlertCircle size={14} />
	{/snippet}
</Badge>
```

### Props

| Prop            | Type                                                        | Required | Description                                      |
| --------------- | ----------------------------------------------------------- | -------- | ------------------------------------------------ |
| `message`       | `string`                                                    | Yes      | The text displayed in the badge                  |
| `icon`          | `Snippet`                                                   | No       | Icon snippet displayed before the message        |
| `level`         | `'success' \| 'warning' \| 'danger' \| 'info' \| 'neutral'` | No       | Badge color level (default: `'neutral'`)         |
| `anchorName`    | `string`                                                    | No       | CSS anchor name for popover positioning          |
| `popoverTarget` | `string`                                                    | No       | Popover ID to open on click                      |
| `title`         | `string`                                                    | No       | Tooltip text                                     |
| `disabled`      | `boolean`                                                   | No       | Disables click functionality (only with popover) |

---

## Dialog Usage

Modal dialog with title, body, and close button.

```svelte
<script>
	import Dialog from '$lib/components/util/dialog.svelte';
	import { DIALOG_IDS } from '$lib/globals';
</script>

<button commandfor={DIALOG_IDS.EXAMPLE} command="show-modal">Open Dialog</button>

<Dialog dialogId={DIALOG_IDS.EXAMPLE} title="Confirm Action">
	{#snippet body()}
		<p>Are you sure you want to continue?</p>
		<button commandfor={DIALOG_IDS.EXAMPLE} command="close">Cancel</button>
		<button onclick={handleConfirm}>Confirm</button>
	{/snippet}
</Dialog>
```

### Props

| Prop        | Type         | Required | Description                                    |
| ----------- | ------------ | -------- | ---------------------------------------------- |
| `dialogId`  | `string`     | No       | Unique ID for the dialog (default: `'dialog'`) |
| `title`     | `string`     | No       | Title displayed in the dialog header           |
| `body`      | `() => any`  | Yes      | Body snippet with dialog content               |
| `onDismiss` | `() => void` | No       | Callback when dialog is closed                 |

---

## DropZone Usage

Drag-and-drop area for file uploads with optional processing state.

```svelte
<script>
	import DropZone from '$lib/components/util/drop-zone.svelte';
	import { Upload } from '@lucide/svelte';

	let isProcessing = $state(false);

	async function handleFiles(files: FileList) {
		isProcessing = true;
		// Process files...
		isProcessing = false;
	}
</script>

<DropZone onfiles={handleFiles} {isProcessing} accept="image/jpeg,image/jpg" multiple={true}>
	{#snippet idle()}
		<Upload size={48} />
		<p>Drop images here or click to select</p>
	{/snippet}
	{#snippet processing()}
		<p>Processing files...</p>
	{/snippet}
</DropZone>
```

### Props

| Prop           | Type                                         | Required | Description                                       |
| -------------- | -------------------------------------------- | -------- | ------------------------------------------------- |
| `onfiles`      | `(files: FileList) => void \| Promise<void>` | Yes      | Callback when files are selected or dropped       |
| `idle`         | `Snippet`                                    | Yes      | Content to display when idle                      |
| `processing`   | `Snippet`                                    | No       | Content to display when processing                |
| `isProcessing` | `boolean`                                    | No       | Whether files are currently being processed       |
| `accept`       | `string`                                     | No       | File input accept attribute (default: `'*/*'`)    |
| `multiple`     | `boolean`                                    | No       | Whether to allow multiple files (default: `true`) |
| `disabled`     | `boolean`                                    | No       | Whether the drop zone is disabled                 |
| `class`        | `string`                                     | No       | Custom CSS class for the drop zone                |

---

## Dropdown Usage

Dropdown menu with CSS Anchor Positioning and Popover API.

```svelte
<script>
	import Dropdown from '$lib/components/util/dropdown.svelte';
	import { MoreVertical, Edit, Trash } from '@lucide/svelte';
</script>

<Dropdown>
	{#snippet trigger()}
		<MoreVertical size={20} />
	{/snippet}
	{#snippet content()}
		<button onclick={handleEdit}>
			<Edit size={16} />
			Edit
		</button>
		<button onclick={handleDelete}>
			<Trash size={16} />
			Delete
		</button>
	{/snippet}
</Dropdown>
```

### Props

| Prop         | Type      | Required | Description                                 |
| ------------ | --------- | -------- | ------------------------------------------- |
| `dropdownId` | `string`  | No       | Unique ID for the dropdown (auto-generated) |
| `trigger`    | `Snippet` | Yes      | Trigger button content                      |
| `content`    | `Snippet` | Yes      | Dropdown menu content                       |
