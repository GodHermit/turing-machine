export type Direction = 'L' | 'R' | 'N';
export type StateMapKey = string | number;
export type StateMap = Map<StateMapKey, string>;

export type Instruction = {
	/**
	 * The Turing machine state index
	 */
	stateIndex: StateMapKey;
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
	 * The new Turing machine state index after the instruction is executed
	 */
	newStateIndex: StateMapKey;
};

export interface ExtendedInstruction extends Instruction {
	/**
	 * The state name based on the `stateIndex`
	 */
	readonly stateName: string;
	/**
	 * The new state name based on the `newStateIndex`
	 */
	readonly newStateName: string;
}

export type TuringMachineOptions = {
	/**
	 * The Turing machine state index to use as halt
	 * @default '!'
	 * @description If the machine reaches this state, it will stop
	 */
	finalStateIndex: StateMapKey;
	/**
	 * The Turing machine initial state index
	 * @default 0
	 */
	initialStateIndex: StateMapKey;
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
	 * The Turing machine current state index
	 */
	stateIndex: StateMapKey;
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
	 * The current state name based on the `stateIndex`
	 */
	readonly stateName: string;
	/**
	 * The current instruction of the machine
	 * @description Calculated from the current state and the current symbol
	 */
	readonly instruction: ExtendedInstruction | null;
	/**
	 * The variable to check if the machine is in a final condition
	 * @description Calculated from the current state and the final state
	 */
	readonly isFinalCondition: boolean;
}