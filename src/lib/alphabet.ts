import TuringMachine from './turingMachine';

/**
 * Creates an alphabet from a string
 * @param input
 * @returns array of unique characters
 */
export function createAlphabet(input: string): string[] {
	return [
		...new Set(
			input
				.split('')
				.filter((char) => char !== TuringMachine.BLANK_SYMBOL)
				.sort()
		)
	];
}

/**
 * Validates a string against an alphabet
 * @param input 
 * @param alphabet array of unique characters 
 * @returns true if all characters in input are in alphabet
 */
export function validateString(input: string, alphabet: string[]) {
	return input.split('').every((char) => alphabet.includes(char));
}