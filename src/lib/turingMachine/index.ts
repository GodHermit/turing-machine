import { useStore } from '@/_store';
import { Direction, ExtendedInstruction, Instruction, StateMapKey, TuringMachineCondition, TuringMachineExtendedCondition, TuringMachineOptions } from './types';

export const defaultOptions: TuringMachineOptions = {
	initialStateIndex: 0,
	initialPosition: 0,
	finalStateIndex: '!',
	maxSteps: 1000
};

/**
 * A Turing Machine simulator
 */
export default class TuringMachine {
	/**
	 * The direction to move the head to the left
	 */
	public static readonly LEFT: Direction = 'L';
	/**
	 * The direction to move the head to the right
	 */
	public static readonly RIGHT: Direction = 'R';
	/**
	 * Lack of direction to stay in the same position
	 */
	public static readonly NONE: Direction = 'N';
	/**
	 * The symbol to use as blank
	 */
	public static BLANK_SYMBOL = 'λ';
	/**
	 * The input tape value
	 */
	private input: string;
	/**
	 * The instructions of the machine
	 */
	private instructions: Instruction[];
	/**
	 * The options of the machine
	 */
	private options: TuringMachineOptions = {
		initialStateIndex: defaultOptions.initialStateIndex,
		initialPosition: defaultOptions.initialPosition,
		finalStateIndex: defaultOptions.finalStateIndex,
		maxSteps: defaultOptions.maxSteps
	};
	/**
	 * The current condition of the machine
	 */
	private current: TuringMachineCondition = {
		/**
		 * The current tape value
		 */
		tapeValue: '',
		/**
		 * The current state
		 */
		stateIndex: this.options.initialStateIndex,
		/**
		 * The current head position relative to the tape value
		 * @description The head position can be negative, but only blank symbols exist before 0
		 */
		headPosition: this.options.initialPosition,
		/**
		 * The current iteration of the machine
		 */
		step: 0
	}

	/**
	 * Creates a new Turing Machine simulator
	 * @param input input tape value
	 * @param instructions instructions of the machine
	 * @param options options of the machine
	 * @example
	 * ```ts
	 * // Change first 1 to 0
	 * const machine = new TuringMachine('101', [{
	 * 		state: 'q1',
	 * 		symbol: '1',
	 * 		move: TuringMachine.HALT,
	 * 		newSymbol: '0',
	 * 		newState: 'q0'
	 * 	}]
	 * });
	 * ```
	 */
	constructor(input?: string | TuringMachine, instructions: Instruction[] = [], options?: Partial<TuringMachineOptions>) {
		// If input is a TuringMachine, copy its properties
		if (input instanceof TuringMachine) {
			this.input = input.getInput(); // Copy input
			this.instructions = input.getInstructions(); // Copy instructions
			this.options = input.getOptions(); // Copy options

			const currentCondition = input.getCurrentCondition(); // Copy current condition
			this.current.tapeValue = currentCondition.tapeValue;
			this.current.stateIndex = currentCondition.stateIndex;
			this.current.headPosition = currentCondition.headPosition;
			this.current.step = currentCondition.step;

			return;
		}

		this.input = input || '';
		this.current.tapeValue = input || '';
		this.instructions = instructions;

		if (options) {
			if (options.initialStateIndex) this.current.stateIndex = options.initialStateIndex;
			if (options.initialPosition) this.current.headPosition = options.initialPosition;
			this.setOptions(options);
		}
	}

	public setInput(input: string) {
		this.input = input;
	}

	public getInput(): string {
		return this.input;
	}

	public setInstructions(instructions: Instruction[]) {
		this.instructions = instructions;
	}

	public getInstructions(): Instruction[] {
		return this.instructions;
	}

	public setOptions(options: Partial<TuringMachineOptions>) {
		this.options = {
			...this.options,
			...options
		};
	}

	public getOptions(): TuringMachineOptions {
		return this.options;
	}

	public setCurrentCondition(condition: Partial<typeof this.current>) {
		this.current = {
			...this.current,
			...condition
		};
	}

	/**
	 * Gets the extended current condition of the machine
	 * @returns The extended current condition of the machine
	 */
	public getCurrentCondition(): TuringMachineExtendedCondition {
		const symbol = this.current.tapeValue[this.current.headPosition] || TuringMachine.BLANK_SYMBOL;

		let instruction: ExtendedInstruction | null = null;
		try {
			let res = this.getInstruction(this.current.stateIndex, symbol);
			instruction = {
				...res,
				stateName: useStore.getState().machineState.states.get(res.stateIndex) || '',
				newStateName: useStore.getState().machineState.states.get(res.newStateIndex) || ''
			};
		} catch { }

		return {
			...this.current,
			symbol,
			stateName: useStore.getState().machineState.states.get(this.current.stateIndex) || '',
			instruction,
			isFinalCondition: this.current.stateIndex === this.options.finalStateIndex
		};
	}

	/**
	 * Sets the blank symbol
	 * @param symbol The symbol to use as blank
	 */
	static setBlankSymbol(symbol: string) {
		TuringMachine.BLANK_SYMBOL = symbol;
	}

	public setBlankSymbol(newBlankSymbol: string) {
		const oldBlankSymbol = TuringMachine.BLANK_SYMBOL;

		// Replace blank symbols in input
		this.input = this.input.replaceAll(oldBlankSymbol, newBlankSymbol);

		// Replace blank symbols in instructions
		this.instructions = this.instructions.map(instruction => ({
			...instruction,
			symbol: instruction.symbol === oldBlankSymbol ? newBlankSymbol : instruction.symbol,
			newSymbol: instruction.newSymbol === oldBlankSymbol ? newBlankSymbol : instruction.newSymbol
		}));

		// Replace blank symbols in current tape value
		this.current.tapeValue = this.current.tapeValue.replaceAll(oldBlankSymbol, newBlankSymbol);

		// Change blank symbol in static property
		TuringMachine.setBlankSymbol(newBlankSymbol);
	}

	/**
	 * Runs the machine
	 * @returns The final tape value
	 */
	public run() {
		// this.current.step = 0;
		let result = this.current.tapeValue;
		let logs: Array<TuringMachineExtendedCondition | Error> = [];

		for (var i = 0; i < this.options.maxSteps; i++) {
			logs.push(this.getCurrentCondition());
			result = this.step();
			// Check if final state reached
			if (this.current.stateIndex === this.options.finalStateIndex) {
				break;
			}
			// Check if maximum number of steps reached
			if (i === this.options.maxSteps - 1) {
				throw new Error(`Maximum number of steps reached (${this.options.maxSteps})`);
			}
		}
		return {
			result,
			logs
		};
	}

	/**
	 * Resets the machine to the initial state
	 */
	public reset() {
		this.current = {
			tapeValue: this.input,
			stateIndex: this.options.initialStateIndex,
			headPosition: this.options.initialPosition,
			step: 0
		};
	}

	/**
	 * Executes a single step of the machine
	 * @returns The new tape value
	 */
	public step(): string {
		let { stateIndex: state, headPosition, tapeValue } = this.current;

		// If final state reached
		if (state === this.options.finalStateIndex) {
			return tapeValue;
		}

		// If head position is negative
		if (headPosition < 0) {
			tapeValue = tapeValue.padStart( // Pad start with blank symbols
				tapeValue.length + Math.abs(headPosition),
				TuringMachine.BLANK_SYMBOL
			);
			headPosition = 0; // Set head position to 0 (only blank symbols exist before 0)

			this.current.tapeValue = tapeValue;
			this.current.headPosition = headPosition;
		}

		// Get symbol
		let symbol = tapeValue[headPosition] || TuringMachine.BLANK_SYMBOL;

		// Get instruction
		let currentInstruction = this.getInstruction(state, symbol);

		return this.executeInstruction(currentInstruction);
	}

	/**
	 * Executes an instruction
	 * @param instruction The instruction to execute
	 * @returns The new tape value
	 */
	private executeInstruction(instruction: Instruction): string {
		const { move, newStateIndex: newState } = instruction;
		let { newSymbol } = instruction;

		let virtualTape = this.current.tapeValue;

		// If next head position is negative
		if (this.getNewHeadPosition(move) < 0) {
			virtualTape = TuringMachine.BLANK_SYMBOL + virtualTape; // Pad start with blank symbol
			this.current.headPosition = 1; // Offset head position by 1 to account for new blank symbol
		}

		this.current = {
			tapeValue: virtualTape.substring(0, this.current.headPosition) + newSymbol + virtualTape.substring(this.current.headPosition + 1),
			stateIndex: newState,
			headPosition: this.getNewHeadPosition(move),
			step: this.current.step + 1
		};

		return this.current.tapeValue;
	}

	/**
	 * Gets the new head position
	 * @param direction The direction to move the head
	 * @returns The new head position
	 */
	private getNewHeadPosition(direction: Direction): number {
		switch (direction) {
			case TuringMachine.LEFT:
				return this.current.headPosition - 1;
			case TuringMachine.RIGHT:
				return this.current.headPosition + 1;
			case TuringMachine.NONE:
				return this.current.headPosition;
			default:
				throw new Error(`Invalid move '${direction}'`);
		}
	}

	/**
	 * Gets the instruction for a given state and symbol
	 * @param stateIndex 
	 * @param symbol  
	 * @returns The instruction for the given state and symbol
	 * @throws Will throw an error if no state is found for the given state index
	 * @throws Will throw an error if no instruction is found
	 */
	private getInstruction(stateIndex: StateMapKey, symbol: string): Instruction {
		const states = useStore.getState().machineState.states;

		// If no state found for the given state index
		if (!states.has(stateIndex)) {
			throw new Error(`No state found for index '${stateIndex}'`);
		}

		// Get instruction
		const instruction = this.instructions.find(instruction => (
			instruction.stateIndex === stateIndex && instruction.symbol === symbol
		));

		// If instruction is undefined
		if (!instruction) {
			let stateName = states.get(stateIndex);
			throw new Error(`No instruction found for state '${stateName}' and symbol '${symbol}'`);
		}

		return instruction;
	}
}