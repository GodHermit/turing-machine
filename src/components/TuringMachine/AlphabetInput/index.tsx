'use client';

import { useStore } from '@/_store';
import Input from '@/components/Input';
import { useMemo } from 'react';

export default function AlphabetInput() {
	const [machineState, setMachineState] = useStore(state => [state.machineState, state.setMachineState]);

	/**
	 * Rules for invalid input:
	 */
	const isInputInvalid = useMemo(
		(): { value: boolean, feedback: string } => {
			// If alphabet has duplicate characters
			if (
				machineState.alphabet.length > 0 &&
				new Set(machineState.alphabet).size !== machineState.alphabet.length
			) {
				return {
					value: true,
					feedback: 'Alphabet cannot have duplicate characters.',
				}
			}
			return {
				value: false,
				feedback: '',
			};
		},
		[
			machineState.alphabet
		]
	);

	return (
		<div className='mb-4'>
			<Input
				label='Alphabet:'
				value={machineState.alphabet.join('')}
				isInvalid={isInputInvalid.value}
				invalidFeedback={isInputInvalid.feedback}
				onChange={e => setMachineState({ alphabet: e.target.value.split('') })}
			/>
		</div>
	);
}