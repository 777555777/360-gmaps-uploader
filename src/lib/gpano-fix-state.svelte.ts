import { SvelteMap } from 'svelte/reactivity';
import type { GPanoMetadata, ValidationResult } from './utils/image-helpers';

/**
 * Represents a file that needs GPano metadata fixing
 */
export interface GPanoFixItem {
	file: File;
	missingFields: string[];
	suggestedGPano: GPanoMetadata;
	imageWidth: number;
	imageHeight: number;
}

/**
 * State for managing the GPano metadata fix dialog.
 *
 * This state holds files that passed basic validation (JPEG, size, dimensions, ratio)
 * but are missing required GPano XMP metadata fields.
 */
class GPanoFixState {
	// Files that need fixing - Map for easy lookup and iteration
	filesToFix = new SvelteMap<File, GPanoFixItem>();

	// Files that were completely valid (no fix needed)
	validFiles: File[] = $state([]);

	// Files that have errors that cannot be auto-fixed
	rejectedFiles: { file: File; errors: string[] }[] = $state([]);

	// Track if the fix dialog is active
	isActive = $state(false);

	/**
	 * Process validation results and categorize files.
	 * Call this after validating all files in the upload.
	 */
	processValidationResults(results: { file: File; validation: ValidationResult }[]): void {
		this.clear();

		for (const { file, validation } of results) {
			if (validation.isValid) {
				// Completely valid - no fixes needed
				this.validFiles.push(file);
			} else if (
				validation.canAutoFix &&
				validation.suggestedGPano &&
				validation.imageWidth &&
				validation.imageHeight
			) {
				// Can be auto-fixed
				this.filesToFix.set(file, {
					file,
					missingFields: validation.missingGPanoFields || [],
					suggestedGPano: validation.suggestedGPano,
					imageWidth: validation.imageWidth,
					imageHeight: validation.imageHeight
				});
			} else {
				// Cannot be fixed - has critical errors
				this.rejectedFiles.push({ file, errors: validation.errors });
			}
		}

		// Dialog should show for fixable files OR rejected files (to inform user)
		this.isActive = this.filesToFix.size > 0 || this.rejectedFiles.length > 0;
	}

	/**
	 * Get list of files that need fixing
	 */
	get fixableFiles(): GPanoFixItem[] {
		return Array.from(this.filesToFix.values());
	}

	/**
	 * Get count of files that need fixing
	 */
	get fixableCount(): number {
		return this.filesToFix.size;
	}

	/**
	 * Get count of completely valid files
	 */
	get validCount(): number {
		return this.validFiles.length;
	}

	/**
	 * Get count of rejected files
	 */
	get rejectedCount(): number {
		return this.rejectedFiles.length;
	}

	/**
	 * Check if there are any fixable files
	 */
	get hasFixableFiles(): boolean {
		return this.filesToFix.size > 0;
	}

	/**
	 * Check if there are any rejected files
	 */
	get hasRejectedFiles(): boolean {
		return this.rejectedFiles.length > 0;
	}

	/**
	 * Remove a file from the fix list (e.g., if user wants to skip it)
	 */
	removeFromFix(file: File): void {
		this.filesToFix.delete(file);
		if (this.filesToFix.size === 0) {
			this.isActive = false;
		}
	}

	/**
	 * Clear all state
	 */
	clear(): void {
		this.filesToFix.clear();
		this.validFiles = [];
		this.rejectedFiles = [];
		this.isActive = false;
	}

	/**
	 * Close the fix dialog without applying fixes
	 */
	cancel(): void {
		this.clear();
	}
}

export const gpanoFixState = new GPanoFixState();
