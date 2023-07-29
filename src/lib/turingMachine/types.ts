export type Direction = 'L' | 'R' | 'HALT';

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
	 * The direction to move the head
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
	 * @default 'q0'
	 * @description The machine will stop when the state is 'HALT'
	 */
	finalState: string;
	/**
	 * The initial state of the machine
	 * @default 'q1'
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