'use client';

import { useStore } from '@/_store';
import Input from '@/components/Input';
import { createAlphabet, validateString } from '@/lib/alphabet';
import { useMemo } from 'react';

export default function TapeInput() {
	const [machineState, setMachineState] = useStore(state => [state.machineState, state.setMachineState]);

	/**
	 * Rules for invalid input:
	 */
	const isInputInvalid = useMemo(
		(): { value: boolean, feedback: string } => {
			// If input does not match the alphabet
			if (
				machineState.alphabet.length > 0 &&
				!validateString(machineState.input, machineState.alphabet)
			) {
				return {
					value: true,
					feedback: 'Input does not match the alphabet.',
				}
			}
			return {
				value: false,
				feedback: '',
			};
		},
		[
			machineState.input,
			machineState.alphabet
		]
	);

	/**
	 * Rules for disabling the 'Write to tape' button:
	 */
	const isWriteToTapeDisabled = useMemo(
		() => (
			isInputInvalid?.value || // If input does not match the alphabet
			machineState.currentTapeValue === machineState.input && // If input is already written to the tape
			new Set(machineState.alphabet).size === machineState.alphabet.length // If alphabet has duplicate characters (this is the same rule as in AlphabetInput
		),
		[
			isInputInvalid,
			machineState.currentTapeValue,
			machineState.input,
			machineState.alphabet
		]
	);

	/**
	 * Handles writing the input to the tape.
	 */
	const handleWriteToTape = () => {
		// If alphabet is not yet created, create it
		if (machineState.alphabet.length === 0) {
			setMachineState({
				alphabet: createAlphabet(machineState.input),
			});
		}

		if (
			machineState.alphabet.length > 0 && // If alphabet is created
			!validateString(machineState.input, machineState.alphabet) // If input does not match the alphabet
		) {
			return;
		}

		setMachineState({
			currentTapeValue: machineState.input,
		});
	};

	return (
		<div className='row mb-4'>
			<div className='col-9'>
				<Input
					label='Input:'
					value={machineState.input}
					isInvalid={isInputInvalid?.value}
					invalidFeedback={isInputInvalid?.feedback}
					onChange={e => setMachineState({ input: e.target.value })}
				/>
			</div>
			<div className='col-3 d-grid align-items-end'>
				<button
					className='btn btn-secondary'
					onClick={handleWriteToTape}
					disabled={isWriteToTapeDisabled}
				>
					Write to tape
				</button>
			</div>
		</div>
	);
}