import { StateCreator } from 'zustand';
import { StoreType } from '..';
import replacer from '../utilities/replacer';
import reviver from '../utilities/reviver';

export interface Utilities {
	/**
	 * Reset the store to its initial state
	 */
	resetAll: () => void;
	/**
	 * Export the store as JSON
	 * @param downloadFile Whether to download the JSON file
	 * @returns The store as JSON string
	 */
	exportJSON: (downloadFile?: boolean) => string;
	/**
	 * Import JSON into the store
	 * @param json The JSON string to import (If not provided, the user will be prompted to select a file)
	 */
	importJSON: (json?: string) => void;
}

export const createUtilitiesSlice: StateCreator<
	StoreType,
	[['zustand/persist', unknown]],
	[],
	Utilities
> = (set, get, store) => ({
	resetAll: () => {
		store.persist.clearStorage();
		window.location.reload();
	},
	exportJSON: (downloadFile = false) => {
		try {
			// Convert the store to JSON
			const res = JSON.stringify(get(), replacer);

			// If the file needs to be downloaded
			if (downloadFile) {
				// Generate a Blob from the JSON string
				const file = new Blob([res], { type: 'application/json' });

				// Create a temporary URL for the Blob
				const url = URL.createObjectURL(file);

				// Create a temporary <a> element to download the file
				const el = document.createElement('a');
				el.href = url;
				el.download = 'turing-machine.json';
				el.click();

				// Revoke the temporary URL
				URL.revokeObjectURL(url);
				// Remove the temporary <a> element
				el.remove();
			}

			return res;
		} catch (error) {
			// Add the error to the logs
			set(s => ({
				registers: {
					...s.registers,
					logs: [
						...s.registers.logs,
						error as Error,
					],
				},
			}));

			return '';
		}
	},
	importJSON: (json) => {
		try {
			if (json !== undefined) {
				// Parse the JSON
				const parsed = JSON.parse(json, reviver);

				// Set the store to the parsed JSON
				set(parsed);

				return;
			}

			// Create a temporary <input> element to select the file
			const el = document.createElement('input');
			el.type = 'file';
			el.accept = 'application/json';
			el.onchange = () => {
				if (el.files === null) return;

				// Read the file
				const reader = new FileReader();
				reader.onload = () => {
					try {
						if (typeof reader.result !== 'string') return;

						// Parse the JSON
						const parsed = JSON.parse(reader.result, reviver);

						// Check if keys are valid
						Object
							.keys(parsed)
							.forEach(key => {
								// If the key is not in the store
								if (!(key in get())) {
									throw new Error(`Import failed: Invalid key "${key}"`);
								}
							});

						// Set the store to the parsed JSON
						set(parsed);
					} catch (error) {
						// Add the error to the logs
						set(s => ({
							registers: {
								...s.registers,
								logs: [
									...s.registers.logs,
									error as Error,
								],
							},
						}));
					}
				};
				reader.readAsText(el.files[0]);

				// Remove the temporary <input> element
				el.remove();
			};

			// Click the temporary <input> element
			el.click();

		} catch (error) {
			// Add the error to the logs
			set(s => ({
				registers: {
					...s.registers,
					logs: [
						...s.registers.logs,
						error as Error,
					],
				},
			}));
		}
	},
});