import { useStore } from '@/_store';
import TuringMachine from '@/lib/turingMachine';
import { Direction, Instruction } from '@/lib/turingMachine/types';
import clsx from 'clsx';
import { ChangeEvent, useEffect, useState } from 'react';
import { useDebounce } from 'usehooks-ts';

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
	 * Handle value change
	 * @param e Change event
	 */
	const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);

		// If the value is empty, remove the instruction
		if (e.target.value.length <= 0) {
			setIsInvalid(false);
			setMachineState({
				instructions: machineState.instructions.filter(instruction => !(
					instruction.state === props.instructionState &&
					instruction.symbol === props.instructionSymbol
				))
			});
			return;
		}

		// If the value is final state symbol
		if (e.target.value === '!') {
			// Add final state instruction
			addInstruction({
				state: props.instructionState,
				symbol: props.instructionSymbol,
				move: TuringMachine.NONE,
				newSymbol: props.instructionSymbol,
				newState: '!'
			});
			return;
		}

		const values = e.target.value.split(' '); // Get the values

		let newSymbol: string | undefined,
			move: Direction | undefined,
			newState: string | undefined;

		switch (values.length) {
			case 1: // If only one symbol is provided, it's the shorthand for the move
				move = values[0] as Direction;
				break;

			default: // If more than one symbol is provided, it's the full instruction
				[newSymbol, move, newState] = values as [string, Direction, string];
				break;
		}

		if (
			!move || // If move doesn't exist
			![TuringMachine.LEFT, TuringMachine.RIGHT, TuringMachine.NONE].includes(move) // If move is invalid
		) {
			setIsInvalid(true);
			return;
		}

		// If newSymbol or newState are invalid
		if (newSymbol && !alphabet.includes(newSymbol)) {
			setIsInvalid(true);
			return;
		}
		if (newState && !states.includes(newState)) {
			setIsInvalid(true);
			return;
		}

		// Create the new instruction
		const newInstruction: Instruction = {
			state: props.instructionState,
			symbol: props.instructionSymbol,
			move: move as Direction,
			newSymbol: newSymbol || TuringMachine.BLANK_SYMBOL,
			newState: newState || props.instructionState
		};
		addInstruction(newInstruction);
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