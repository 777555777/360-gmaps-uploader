export function closeDialogById(dialogId: string): void {
	if (typeof document === 'undefined') {
		return;
	}

	const dialog = document.getElementById(dialogId);
	if (dialog instanceof HTMLDialogElement) {
		dialog.close();
	}
}
