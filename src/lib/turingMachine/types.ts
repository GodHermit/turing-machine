export type Direction = 'L' | 'R' | 'N';

export type Instruction = {
	/**
	 * The state of the machine to execute the instruction
	 */
	state: string;
	/**
	 * The symbol to read in the cell to execute the instruction
	 */
	symbol: string;
	/**
	 * The movement of the head after the instruction is executed
	 */
	move: Direction;
	/**
	 * The symbol to write in the cell
	 */
	newSymbol: string;
	/**
	 * The new state of the machine after the instruction is executed
	 */
	newState: string;
};

export type TuringMachineOptions = {
	/**
	 * The state to use as halt
	 * @default '!'
	 * @description If the machine reaches this state, it will stop
	 */
	finalState: string;
	/**
	 * The initial state of the machine
	 * @default 'q0'
	 */
	initialState: string;
	/**
	 * The initial position of the head
	 * @description The offset is relative to the first symbol of the input
	 * @default 0
	 */
	initialPosition: number;
	/**
	 * The maximum number of steps to execute
	 * @default 1000
	 */
	maxSteps: number;
};

export type TuringMachineCondition = {
	/**
	 * The tape value of the current condition
	 */
	tapeValue: string;
	/**
	 * The current state of the machine
	 */
	state: string;
	/**
	 * The current head position relative to the tape value
	 * @description The head position can be negative, but only blank symbols exist before 0
	 */
	headPosition: number;
	/**
	 * The current step of the machine
	 * @description The step is incremented after each instruction
	 */
	step: number;
};

export interface TuringMachineExtendedCondition extends TuringMachineCondition {
	/**
	 * The current symbol under the head
	 * @description Calculated from the current head position and the tape value
	 */
	readonly symbol: string;
	/**
	 * The current instruction of the machine
	 * @description Calculated from the current state and the current symbol
	 */
	readonly instruction: Instruction | null;
	/**
	 * The variable to check if the machine is in a final condition
	 * @description Calculated from the current state and the final state
	 */
	readonly isFinalCondition: boolean;
}