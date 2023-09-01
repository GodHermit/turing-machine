'use client';

import { useStore } from '@/_store';
import Input from '@/components/Input';
import { useEffect, useMemo, useState } from 'react';

export default function AlphabetInput() {
	const [machineState, setMachineAlphabet] = useStore(state => [state.machineState, state.setMachineAlphabet]);
	const blankSymbol = useStore(state => state.tapeSettings.blankSymbol);
	const [alphabet, setAlphabet] = useState(machineState.alphabet.join(''));

	useEffect(() => {
		setAlphabet(machineState.alphabet.join(''));
	}, [machineState.alphabet]);

	/**
	 * Rules for invalid input:
	 */
	const isInputInvalid = useMemo(
		(): { value: boolean, feedback: string } => {
			// If alphabet has duplicate characters
			if (
				alphabet.length > 0 &&
				new Set(alphabet).size !== alphabet.length
			) {
				return {
					value: true,
					feedback: 'Alphabet cannot have duplicate characters.',
				}
			}

			if (alphabet.includes(blankSymbol)) {
				return {
					value: true,
					feedback: `Blank symbol (${blankSymbol}) already exists in alphabet.`,
				}
			}
			return {
				value: false,
				feedback: '',
			};
		},
		[
			alphabet,
			blankSymbol
		]
	);

	const handleAlphabetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		let value = e.target.value;
		setAlphabet(value);

		if (
			new Set(value.split('')).size !== value.length || // If alphabet has duplicate characters
			value.includes(blankSymbol) // If alphabet has blank symbol
		) {
			return;
		}

		setMachineAlphabet(value.split(''));
	};

	return (
		<div className='mb-4'>
			<Input
				label='Alphabet:'
				value={alphabet}
				onChange={handleAlphabetChange}
				isInvalid={isInputInvalid.value}
				invalidFeedback={isInputInvalid.feedback}
			/>
		</div>
	);
}