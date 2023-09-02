import { StoreType } from '..';

/**
 * Custom replacer function for JSON.stringify
 * @param key 
 * @param value 
 * @returns 
 */
export default function replacer(key: string, value: unknown) {
	switch (key) {
		case 'states':
			// Convert Map to array of entries
			return [...(value as StoreType['registers']['states']).entries()];

		case 'logs':
			// Convert instances of Error to plain objects
			return (value as StoreType['registers']['logs'])
				.map(log => {
					if (log instanceof Error) {
						return {
							type: 'error',
							message: log.message,
							cause: log.cause,
						};
					}

					return log;
				});

		default:
			// Return value as is
			return value;
	}
}