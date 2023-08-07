import { useStore } from '@/_store';
import TuringMachine from '@/lib/turingMachine';
import { Direction, Instruction } from '@/lib/turingMachine/types';
import clsx from 'clsx';
import { ChangeEvent, useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';

/**
 * Function to validate an instruction
 * @param instruction Instruction to validate
 * @param alphabet alphabet including the blank symbol
 * @param states states including the final state
 * @returns true if the instruction is valid, false otherwise
 */
function isInstructionValid(instruction: Instruction, alphabet: string[], states: string[]): boolean {
	// If move doesn't exist
	if (
		![TuringMachine.LEFT, TuringMachine.RIGHT, TuringMachine.NONE].includes(instruction.move)
	) {
		return false;
	}

	// If newSymbol is invalid
	if (!alphabet.includes(instruction.newSymbol)) {
		return false;
	}

	// If newState is invalid
	if (!states.includes(instruction.newState)) {
		return false;
	}

	return true;
}

interface TableViewCellProps {
	instructionState: string;
	instructionSymbol: string;
}

export default function TableViewCell(props: TableViewCellProps) {
	const [machineState, setMachineState] = useStore(state => [state.machineState, state.setMachineState]);
	const instruction = machineState.instructions.find(instruction => (
		instruction.state === props.instructionState &&
		instruction.symbol === props.instructionSymbol
	));
	const defaultValue = instruction ? `${instruction.newSymbol} ${instruction.move} ${instruction.newState}` : '';
	const [value, setValue] = useState<string>(defaultValue);
	const [isInvalid, setIsInvalid] = useState<boolean>(false);
	const debouncedIsInvalid = useDebounce(isInvalid, 1000);
	const debouncedMachineState = useDebounce(machineState, 500);
	const alphabet = [...debouncedMachineState.alphabet, TuringMachine.BLANK_SYMBOL];
	const states = [...debouncedMachineState.states, '!'];

	/**
	 * Update value when state name changes
	 */
	useEffect(() => {
		// If the value is empty
		if (value.length <= 0) {
			return;
		}

		// If the value is invalid
		if (isInvalid) {
			return;
		}

		const [newSymbol, move, newState] = value.split(' ');
		if (newState) {

			if (instruction && instruction.newState !== newState) {
				setValue(`${newSymbol} ${move} ${instruction.newState}`);
			}
		}
	}, [
		value,
		isInvalid,
		instruction,
		debouncedMachineState.instructions
	]);

	/**
	 * Add instruction to the machine state
	 * @param instruction Instruction to add
	 */
	const addInstruction = (instruction: Instruction) => {
		setIsInvalid(false);
		setMachineState({
			instructions: [
				...machineState.instructions.filter(instruction => !(
					instruction.state === props.instructionState &&
					instruction.symbol === props.instructionSymbol
				)),
				instruction
			]
		});
	};

	/**
	 * Remove instruction from the machine state
	 */
	const removeInstruction = () => {
		setIsInvalid(false);
		setMachineState({
			instructions: machineState.instructions.filter(instruction => !(
				instruction.state === props.instructionState &&
				instruction.symbol === props.instructionSymbol
			))
		});
	};

	/**
	 * Handle value change
	 * @param e Change event
	 */
	const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);

		// If the value is empty
		if (e.target.value.length <= 0) {
			removeInstruction();
			return;
		}

		// If the value is shortened instruction
		switch (e.target.value) {
			case machineState.options.finalState:
				addInstruction({
					state: props.instructionState,
					symbol: props.instructionSymbol,
					move: TuringMachine.NONE,
					newSymbol: props.instructionSymbol,
					newState: machineState.options.finalState
				});
				return;

			case TuringMachine.LEFT:
			case TuringMachine.RIGHT:
			case TuringMachine.NONE:
				addInstruction({
					state: props.instructionState,
					symbol: props.instructionSymbol,
					move: e.target.value as Direction,
					newSymbol: props.instructionSymbol,
					newState: props.instructionState
				});
				return;
		}

		let [newSymbol, move, newState] = e.target.value.split(' ');

		let instruction = {
			state: props.instructionState,
			symbol: props.instructionSymbol,
			move: move as Direction,
			newSymbol: newSymbol,
			newState: newState
		};

		if (!isInstructionValid(instruction, alphabet, states)) {
			setIsInvalid(true);
			return;
		}

		addInstruction(instruction);
	};

	return (
		<td className='p-0'>
			<input
				type='text'
				className={clsx(
					'form-control text-center rounded-0 border-0',
					debouncedIsInvalid && 'is-invalid'
				)}
				placeholder='N'
				value={value}
				onChange={handleValueChange}
			/>
		</td>
	)
}