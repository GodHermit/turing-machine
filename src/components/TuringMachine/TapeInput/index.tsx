'use client';

import { useStore } from '@/_store';
import Input from '@/components/Input';
import { createAlphabet, validateString } from '@/lib/alphabet';
import TuringMachine from '@/lib/turingMachine';
import { useEffect, useMemo, useState } from 'react';

export default function TapeInput() {
	const [
		machine,
		registers,
		blankSymbol,
		setRegisters,
		setHeadPosition
	] = useStore(state => [
		state.machine,
		state.registers,
		state.tapeSettings.blankSymbol,
		state.setRegisters,
		state.setHeadPosition,
	]);
	const [value, setValue] = useState(machine.getInput());
	const machineInput = machine.getInput();

	/**
	 * Syncs the value with the machine input.
	 */
	useEffect(() => {
		setValue(machineInput);
	}, [machineInput])

	/**
	 * Alphabet with blank symbol
	 */
	const alphabet = useMemo(() => (
		[...registers.alphabet, blankSymbol]
	), [registers.alphabet, blankSymbol]);

	/**
	 * Rules for invalid input:
	 */
	const isInputInvalid = useMemo(
		(): { value: boolean, feedback: string } => {
			// If input does not match the alphabet
			if (
				registers.alphabet.length > 0 &&
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
			registers.alphabet,
			alphabet
		]
	);

	/**
	 * Rules for disabling the 'Write to tape' button:
	 */
	const isWriteToTapeDisabled = useMemo(
		() => (
			isInputInvalid?.value || // If input does not match the alphabet
			machine.getCurrentCondition().tapeValue === value || // If input is already written to the tape
			new Set(registers.alphabet).size !== registers.alphabet.length // If alphabet has duplicate characters (this is the same rule as in AlphabetInput
		),
		[
			machine,
			isInputInvalid,
			value,
			registers.alphabet
		]
	);

	/**
	 * Handles writing the input to the tape.
	 */
	const handleWriteToTape = () => {
		// If alphabet is not yet created, create it
		if (registers.alphabet.length === 0) {
			setRegisters({
				alphabet: createAlphabet(value),
			});
		}

		if (
			isWriteToTapeDisabled
		) {
			return;
		}

		const newMachine = new TuringMachine(machine);
		newMachine.setInput(value);
		newMachine.reset();
		useStore.setState({
			machine: newMachine,
		});
		setHeadPosition(0, true);
	};

	return (
		<div className='row row-cols-1 row-cols-md-2 row-gap-2 mb-4'>
			<div className='col col-md-8'>
				<Input
					label='Input:'
					value={value}
					isInvalid={isInputInvalid?.value}
					invalidFeedback={isInputInvalid?.feedback}
					onChange={e => setValue(e.target.value)}
				/>
			</div>
			<div className='col col-md-4 d-grid align-items-end'>
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