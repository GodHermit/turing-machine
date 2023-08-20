import { Direction, Instruction, TuringMachineCondition, TuringMachineExtendedCondition, TuringMachineOptions } from './types';

export const defaultOptions: TuringMachineOptions = {
	initialState: 'q0',
	initialPosition: 0,
	finalState: '!',
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
		initialState: defaultOptions.initialState,
		initialPosition: defaultOptions.initialPosition,
		finalState: defaultOptions.finalState,
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
		state: this.options.initialState,
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
			this.current.state = currentCondition.state;
			this.current.headPosition = currentCondition.headPosition;
			this.current.step = currentCondition.step;

			return;
		}

		this.input = input || '';
		this.current.tapeValue = input || '';
		this.instructions = instructions;

		if (options) {
			if (options.initialState) this.current.state = options.initialState;
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

		let instruction: Instruction | null = null;
		try {
			instruction = this.getInstruction(this.current.state, symbol);
		} catch { }

		return {
			...this.current,
			symbol,
			instruction,
			isFinalCondition: this.current.state === this.options.finalState
		};
	}

	/**
	 * Sets the blank symbol
	 * @param symbol The symbol to use as blank
	 */
	static setBlankSymbol(symbol: string) {
		TuringMachine.BLANK_SYMBOL = symbol;
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
			if (this.current.state === this.options.finalState) {
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
			state: this.options.initialState,
			headPosition: this.options.initialPosition,
			step: 0
		}
		TuringMachine.reset();
	}

	/**
	 * Resets static properties
	 */
	private static reset() {
		TuringMachine.BLANK_SYMBOL = 'λ';
	}

	/**
	 * Executes a single step of the machine
	 * @returns The new tape value
	 */
	public step(): string {
		let { state, headPosition, tapeValue } = this.current;

		// If final state reached
		if (state === this.options.finalState) {
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
		const { move, newState } = instruction;
		let { newSymbol } = instruction;

		let virtualTape = this.current.tapeValue;

		// If next head position is negative
		if (this.getNewHeadPosition(move) < 0) {
			virtualTape = TuringMachine.BLANK_SYMBOL + virtualTape; // Pad start with blank symbol
			this.current.headPosition = 1; // Offset head position by 1 to account for new blank symbol
		}

		this.current = {
			tapeValue: virtualTape.substring(0, this.current.headPosition) + newSymbol + virtualTape.substring(this.current.headPosition + 1),
			state: newState,
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
	 * @param state 
	 * @param symbol  
	 * @returns The instruction for the given state and symbol
	 * @throws Will throw an error if no instruction is found
	 */
	private getInstruction(state: string, symbol: string): Instruction {
		const instruction = this.instructions.find(instruction => (
			instruction.state === state && instruction.symbol === symbol
		));

		if (!instruction) {
			throw new Error(`No instruction found for state '${state}' and symbol '${symbol}'`);
		}

		return instruction;
	}
}