'use client';

import { useStore } from '@/_store';
import Input from '@/components/Input';
import { createAlphabet, validateString } from '@/lib/alphabet';
import TuringMachine from '@/lib/turingMachine';
import { useMemo, useState } from 'react';

export default function TapeInput() {
	const [machineState, setMachineState] = useStore(state => [state.machineState, state.setMachineState]);
	const [value, setValue] = useState(machineState.input);

	/**
	 * Alphabet with blank symbol
	 */
	const alphabet = useMemo(() => (
		[...machineState.alphabet, TuringMachine.BLANK_SYMBOL]
	), [machineState.alphabet]);

	/**
	 * Rules for invalid input:
	 */
	const isInputInvalid = useMemo(
		(): { value: boolean, feedback: string } => {
			// If input does not match the alphabet
			if (
				machineState.alphabet.length > 0 &&
				!validateString(value, alphabet)
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
			value,
			machineState.alphabet,
			alphabet
		]
	);

	/**
	 * Rules for disabling the 'Write to tape' button:
	 */
	const isWriteToTapeDisabled = useMemo(
		() => (
			isInputInvalid?.value || // If input does not match the alphabet
			machineState.currentTapeValue === value || // If input is already written to the tape
			new Set(machineState.alphabet).size !== machineState.alphabet.length // If alphabet has duplicate characters (this is the same rule as in AlphabetInput
		),
		[
			isInputInvalid,
			machineState.currentTapeValue,
			value,
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
				alphabet: createAlphabet(value),
			});
		}

		if (
			machineState.alphabet.length > 0 && // If alphabet is created
			!validateString(value, alphabet) // If input does not match the alphabet
		) {
			return;
		}

		setMachineState({
			input: value,
			currentTapeValue: value,
			currentHeadPos: 0,
		});
	};

	return (
		<div className='row mb-4'>
			<div className='col-9'>
				<Input
					label='Input:'
					value={value}
					isInvalid={isInputInvalid?.value}
					invalidFeedback={isInputInvalid?.feedback}
					onChange={e => setValue(e.target.value)}
				/>
			</div>
			<div className='col-3 d-grid align-items-end'>
				<button
					className='btn btn-secondary'
					onClick={handleWriteToTape}
					disabled={isWriteToTapeDisabled}
				>
					{(value.length <= 0 && !isWriteToTapeDisabled) ?
						'Clear tape' :
						'Write to tape'
					}
				</button>
			</div>
		</div>
	);
}