import { Direction, Instruction, TuringMachineOptions } from './types';

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
	 * The input of the machine
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
		initialState: 'q0',
		initialPosition: 0,
		finalState: '!',
		maxSteps: 1000
	};
	/**
	 * The current state of the machine
	 */
	private current = {
		tapeValue: '',
		state: 'q0', // Default
		position: 0 // Default
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
	constructor(input: string, instructions: Instruction[], options?: Partial<TuringMachineOptions>) {
		this.input = input;
		this.current.tapeValue = input;
		this.instructions = instructions;

		if (options) {
			if (options.initialState) this.current.state = options.initialState;
			if (options.initialPosition) this.current.position = options.initialPosition;

			this.options = {
				...this.options,
				...options
			};
		}
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
	public run(): string {
		let result = this.current.tapeValue;
		for (var i = 0; i < this.options.maxSteps; i++) {
			result = this.step();
			if (this.current.state === this.options.finalState) {
				break;
			}
		}
		return result;
	}

	/**
	 * Resets the machine to the initial state
	 */
	public reset() {
		this.current = {
			tapeValue: this.input,
			state: 'q0',
			position: 0
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
		let { state, position } = this.current;
		let symbol = this.input[position] || TuringMachine.BLANK_SYMBOL;

		if (this.current.state === this.options.finalState) {
			return this.current.tapeValue;
		}

		// Get instruction
		let currentInstruction: Instruction | undefined;
		for (const instruction of this.instructions) {
			if (instruction.state === state && instruction.symbol === symbol) {
				currentInstruction = instruction;
				break;
			}
		}
		if (!currentInstruction) {
			throw new Error(`No instruction found for state '${state}' and symbol '${symbol}'`);
		}

		return this.executeInstruction(currentInstruction);
	}

	/**
	 * Executes an instruction
	 * @param instruction The instruction to execute
	 * @returns The new tape value
	 */
	private executeInstruction(instruction: Instruction): string {
		const { state, move, newState, newSymbol } = instruction;

		if (state === this.options.finalState) {
			return this.current.tapeValue;
		}

		this.current.tapeValue = this.current.tapeValue.substring(0, this.current.position) + newSymbol + this.current.tapeValue.substring(this.current.position + 1);
		this.current.state = newState;
		this.current.position = this.getNewHeadPosition(move);

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
				return this.current.position - 1;
			case TuringMachine.RIGHT:
				return this.current.position + 1;
			case TuringMachine.NONE:
				return this.current.position;
			default:
				throw new Error(`Invalid move '${direction}'`);
		}
	}
}