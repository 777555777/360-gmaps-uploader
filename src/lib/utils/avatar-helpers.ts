/**
 * Generate initials from a user's name
 * Takes the first letter of the first two words
 */
export function getInitials(name: string | undefined): string {
	if (!name) return '?';

	const words = name.trim().split(/\s+/);
	if (words.length === 1) {
		return words[0].charAt(0).toUpperCase();
	}

	return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
}

/**
 * Generate a deterministic color from a string
 * Uses a simple hash function to pick from a palette of nice colors
 */
export function getAvatarColor(name: string | undefined): string {
	const colors = [
		'#3b82f6', // blue
		'#8b5cf6', // purple
		'#ec4899', // pink
		'#f59e0b', // amber
		'#10b981', // green
		'#06b6d4', // cyan
		'#6366f1', // indigo
		'#f43f5e', // rose
		'#14b8a6', // teal
		'#f97316' // orange
	];

	if (!name) return colors[0];

	// Simple hash function
	let hash = 0;
	for (let i = 0; i < name.length; i++) {
		hash = name.charCodeAt(i) + ((hash << 5) - hash);
	}

	return colors[Math.abs(hash) % colors.length];
}
