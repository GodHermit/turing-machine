import TuringMachine from '@/lib/turingMachine';
import { StateMapKey } from '@/lib/turingMachine/types';

/**
 * Reviver function for JSON.parse
 * @param key
 * @param value  
 * @returns 
 */
export default function reviver(key: string, value: unknown) {
	switch (key) {
		case 'machine':
			// Convert object to instance of TuringMachine
			const newMachine = new TuringMachine(
				(value as any).input,
				(value as any).instructions,
				(value as any).options
			);
			newMachine.setCurrentCondition((value as any).current);

			return newMachine;

		case 'states':
			// Convert array of entries to Map
			return (value as Array<[StateMapKey, string]>)
				.reduce((acc, [key, value]) => {
					acc.set(key, value);
					return acc;
				}, new Map<StateMapKey, string>());

		case 'logs':
			// Convert objects with type 'error' to instances of Error
			return (value as Array<any>)
				.map(log => {
					if (log.type === 'error') {
						return new Error(log.message, {
							cause: log.cause,
						});
					}

					return log;
				});
		case 'blankSymbol':
			if (value !== TuringMachine.BLANK_SYMBOL) {
				TuringMachine.setBlankSymbol(value as string);
			}
			return value;

		default:
			// Return value as is
			return value;
	}
}