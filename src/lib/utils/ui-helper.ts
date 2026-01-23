export function stopEventPropagation(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.stopPropagation();
	}
}
