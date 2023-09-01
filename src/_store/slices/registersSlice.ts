import TuringMachine, { defaultOptions } from '@/lib/turingMachine';
import { StateMap, StateMapKey, TuringMachineExtendedCondition } from '@/lib/turingMachine/types';
import { StateCreator } from 'zustand';
import { StoreType } from '..';

export interface Registers {
	/**
	 * The alphabet of the Turing machine.
	 */
	alphabet: string[];
	/**
	 * Map of states of the Turing machine.
	 */
	states: StateMap;
	/**
	 * Array of conditions of the Turing machine.
	 */
	logs: Array<TuringMachineExtendedCondition | Error>;
}

interface RegistersActions {
	/**
	 * Set the registers of the machine
	 * @param registers Registers to set
	*/
	setRegisters: (registers: Partial<Registers>) => void;
	/**
	 * Set the alphabet of the machine
	 * @param alphabet The new alphabet
	 */
	setAlphabet: (alphabet: string[]) => void;
	/**
	 * Add a new state to the machine
	 */
	addState: () => void;
	/**
	 * Rename a state
	 * @param name Current name of the state
	 * @param newName New name of the state
	 */
	renameState: (key: StateMapKey, newName: string) => void;
	/**
	 * Delete a state
	 * @param stateName Name of the state to delete 
	 */
	deleteState: (key: StateMapKey) => void;
}

export const initialRegisters: Registers = {
	alphabet: [],
	states: new Map().set(defaultOptions.finalStateIndex, '!').set(0, 'q0'),
	logs: []
};

export type RegistersSlice = {
	registers: Registers
} & RegistersActions;

export const createRegistersSlice: StateCreator<
	StoreType,
	[],
	[],
	RegistersSlice
> = (set) => ({
	registers: initialRegisters,
	setRegisters: (state) => set(s => ({ registers: { ...s.registers, ...state } })),
	setAlphabet: (alphabet) => set(s => {
		let instructions = s.machine.getInstructions();
		const extendedAlphabet = [...alphabet, ...TuringMachine.BLANK_SYMBOL];

		// Remove instructions that are not in the new alphabet
		instructions = instructions.filter(instruction => {
			const { symbol, newSymbol } = instruction;

			return extendedAlphabet.includes(symbol) && extendedAlphabet.includes(newSymbol);
		});

		const newMachine = new TuringMachine(s.machine);
		newMachine.setInstructions(instructions);

		return {
			machine: newMachine,
			registers: {
				...s.registers,
				alphabet: alphabet,
			}
		};
	}),
	addState: () => set(s => {
		let newStateKey = Date.now();
		let newState = `q${s.registers.states.size - 1}`; // New state name

		// If the new state name is already in use, increment the number
		if ([...s.registers.states.values()].includes(newState)) {
			newState = '';
		}

		const newMachine = new TuringMachine(s.machine);
		const options = newMachine.getOptions();
		// If there is no initial state, set the new state as initial state
		if (options.initialStateIndex === undefined) {
			newMachine.setOptions({ initialStateIndex: newStateKey });
		}

		// If there is no final state, set the default final state
		if (options.finalStateIndex === undefined) {
			newMachine.setOptions({ finalStateIndex: defaultOptions.finalStateIndex });
		}

		// If there is no current state, set the new state as current state
		const currentCondition = newMachine.getCurrentCondition();
		if (currentCondition.stateIndex === undefined) {
			newMachine.setCurrentCondition({ stateIndex: newStateKey });
		}

		return {
			machine: newMachine,
			registers: {
				...s.registers,
				states: new Map(s.registers.states).set(newStateKey, newState)
			}
		};
	}),
	renameState: (key: StateMapKey, newName: string) => set(s => {
		return {
			registers: {
				...s.registers,
				states: new Map(s.registers.states).set(key, newName)
			}
		}
	}),
	deleteState: (key: StateMapKey) => set(s => {
		const newStates = new Map(s.registers.states);
		newStates.delete(key);

		const newMachine = new TuringMachine(s.machine);

		// Delete instructions that use the state
		const newInstructions = newMachine.getInstructions()
			.filter(instruction =>
				instruction.stateIndex !== key &&
				instruction.newStateIndex !== key
			);
		newMachine.setInstructions(newInstructions);

		const states = [...newStates].filter(state => state[0] !== defaultOptions.finalStateIndex);
		// Get the first state as fallback
		const fallbackStateIndex = states.length > 0 ? states[0][0] : undefined;

		// Update state name in the options
		const options = newMachine.getOptions();
		newMachine.setOptions({
			initialStateIndex: options.initialStateIndex === key ? fallbackStateIndex : options.initialStateIndex,
			finalStateIndex: options.finalStateIndex === key ? fallbackStateIndex : options.finalStateIndex,
		});

		// Update state name in the current condition
		const currentCondition = newMachine.getCurrentCondition();
		newMachine.setCurrentCondition({
			stateIndex: currentCondition.stateIndex === key ? fallbackStateIndex : currentCondition.stateIndex,
		});

		return {
			machine: newMachine,
			registers: {
				...s.registers,
				states: newStates
			}
		};
	}),
});