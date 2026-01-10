## Accordion Usage

```svelte
<script>
	import AccordionItem from '$lib/components/util/accordion-item.svelte';
	import { FileImage } from '@lucide/svelte';
</script>

<AccordionItem name="group-1" summaryTitle="File Details">
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
</AccordionItem>
```

### Props

| Prop           | Type      | Required | Description                                                 |
| -------------- | --------- | -------- | ----------------------------------------------------------- |
| `summaryTitle` | `string`  | Yes      | The title displayed in the accordion header                 |
| `name`         | `string`  | No       | Groups accordions together (only one can be open at a time) |
| `header`       | `Snippet` | No       | Header snippet displayed before the title                   |
| `content`      | `Snippet` | Yes      | The main content shown when accordion is expanded           |
| `open`         | `boolean` | No       | Whether the accordion is open by default                    |
