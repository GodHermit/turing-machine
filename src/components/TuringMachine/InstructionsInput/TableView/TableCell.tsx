import { useStore } from '@/_store';
import TuringMachine from '@/lib/turingMachine';
import { Direction, Instruction, StateMap } from '@/lib/turingMachine/types';
import clsx from 'clsx';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'usehooks-ts';

/**
 * Function to validate an instruction
 * @param instruction Instruction to validate
 * @param alphabet alphabet including the blank symbol
 * @param states states including the final state
 * @returns true if the instruction is valid, false otherwise
 */
function isInstructionValid(instruction: Instruction, alphabet: string[], states: StateMap): boolean {
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
	if (!states.has(instruction.newStateIndex)) {
		return false;
	}

	return true;
}

interface TableViewCellProps {
	instructionStateIndex: Instruction['stateIndex'];
	instructionSymbol: string;
}

export default function TableViewCell(props: TableViewCellProps) {
	const [
		machine,
		registers,
		setInstructions,
	] = useStore(state => [
		state.machine,
		state.registers,
		state.setInstructions,
	]);
	const debouncedMachineState = useDebounce(registers, 500);

	const instruction = useMemo<Instruction | undefined>(
		() => machine.getInstructions().find(instruction => (
			instruction.stateIndex === props.instructionStateIndex &&
			instruction.symbol === props.instructionSymbol
		)),
		[machine, props.instructionStateIndex, props.instructionSymbol]
	);
	const defaultValue = instruction
		? `${instruction.newSymbol} ${instruction.move} ${registers.states.get(instruction.newStateIndex)}`
		: '';

	const [value, setValue] = useState<string>(defaultValue);

	const [isInvalid, setIsInvalid] = useState<boolean>(false);
	const debouncedIsInvalid = useDebounce(isInvalid, 1000);

	/**
	 * Check if the instruction in the cell is active
	 */
	const isActive = useMemo<boolean>(() => {
		const currentCondition = machine.getCurrentCondition();

		return (
			// currentCondition.step > 0 &&
			currentCondition.stateIndex === props.instructionStateIndex &&
			currentCondition.symbol === props.instructionSymbol
		);
	}, [machine, props.instructionStateIndex, props.instructionSymbol]);

	const alphabet = useMemo(
		() => [...debouncedMachineState.alphabet, TuringMachine.BLANK_SYMBOL],
		[debouncedMachineState.alphabet]
	);
	const states = useMemo(
		() => debouncedMachineState.states,
		[debouncedMachineState.states]
	);

	/**
	 * Sync input value with the instruction from the store
	 */
	useEffect(() => {
		// If value is invalid
		if (isInvalid) return;

		// If value is same as default value
		if (value === defaultValue) return;

		setValue(defaultValue);
	}, [defaultValue, value, isInvalid]);

	/**
	 * Add instruction to the machine state
	 * @param instruction Instruction to add
	 */
	const addInstruction = (instruction: Instruction) => {
		setIsInvalid(false);
		setInstructions([
			...machine.getInstructions().filter(instruction => !(
				instruction.stateIndex === props.instructionStateIndex &&
				instruction.symbol === props.instructionSymbol
			)),
			instruction
		]);
	};

	/**
	 * Remove instruction from the machine state
	 */
	const removeInstruction = () => {
		setIsInvalid(false);
		setInstructions(machine.getInstructions().filter(instruction => !(
			instruction.stateIndex === props.instructionStateIndex &&
			instruction.symbol === props.instructionSymbol
		)));
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
			case machine.getOptions().finalStateIndex:
				setValue(`${props.instructionSymbol} ${TuringMachine.NONE} ${registers.states.get(machine.getOptions().finalStateIndex)}`);
				addInstruction({
					stateIndex: props.instructionStateIndex,
					symbol: props.instructionSymbol,
					move: TuringMachine.NONE,
					newSymbol: props.instructionSymbol,
					newStateIndex: machine.getOptions().finalStateIndex
				});
				return;

			case TuringMachine.LEFT:
			case TuringMachine.RIGHT:
			case TuringMachine.NONE:
				setValue(`${props.instructionSymbol} ${e.target.value} ${registers.states.get(props.instructionStateIndex)}`);
				addInstruction({
					stateIndex: props.instructionStateIndex,
					symbol: props.instructionSymbol,
					move: e.target.value as Direction,
					newSymbol: props.instructionSymbol,
					newStateIndex: props.instructionStateIndex
				});
				return;
		}

		let [newSymbol, move, newState] = e.target.value.split(' ');

		let newStateIndex = [...registers.states].find(state => state[1] === newState);
		if (!newStateIndex) {
			setIsInvalid(true);
			return;
		}

		let instruction: Instruction = {
			stateIndex: props.instructionStateIndex,
			symbol: props.instructionSymbol,
			move: move as Direction,
			newSymbol: newSymbol,
			newStateIndex: newStateIndex[0]
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
					debouncedIsInvalid && 'is-invalid',
					isActive && 'bg-body-secondary',
				)}
				placeholder='N'
				value={value}
				onChange={handleValueChange}
			/>
		</td>
	);
}