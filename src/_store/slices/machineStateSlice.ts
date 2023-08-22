import TuringMachine, { defaultOptions } from '@/lib/turingMachine';
import { Instruction, StateMap, StateMapKey, TuringMachineExtendedCondition } from '@/lib/turingMachine/types';
import { StateCreator } from 'zustand';

export interface MachineRegisters {
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

interface MachineActions {
	setMachineState: (settings: Partial<MachineRegisters>) => void;
	setMachineAlphabet: (alphabet: string[]) => void;
	setInstructions: (instructions: Instruction[]) => void;
	setHeadPosition: (position: number, isInitial?: boolean) => void;
	executeMachine: (action: 'run' | 'step') => void;
	resetMachine: () => void;

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

export const initialMachineState: MachineRegisters = {
	alphabet: [],
	states: new Map().set(defaultOptions.finalStateIndex, '!').set(0, 'q0'),
	logs: []
};

export type MachineStateSlice = {
	machine: TuringMachine;
	machineState: MachineRegisters
} & MachineActions;

export const createMachineStateSlice: StateCreator<MachineStateSlice> = (set) => ({
	machine: new TuringMachine(),
	machineState: initialMachineState,
	setMachineState: (state) => set(s => ({ machineState: { ...s.machineState, ...state } })),
	setMachineAlphabet: (alphabet) => set(s => {
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
			machineState: {
				...s.machineState,
				alphabet: alphabet,
			}
		};
	}),
	setInstructions: (newInstructions: Instruction[]) => set(s => {
		const newMachine = new TuringMachine(s.machine);
		newMachine.setInstructions(newInstructions);

		return {
			machine: newMachine
		};
	}),
	setHeadPosition: (position: number, isInitial: boolean = false) => set(s => {
		const newMachine = new TuringMachine(s.machine);
		newMachine.setCurrentCondition({ headPosition: position });

		if (isInitial) {
			newMachine.setOptions({ initialPosition: position });
		}

		return {
			machine: newMachine
		};
	}),
	executeMachine: (action: 'run' | 'step') => set(s => {
		if (s.machine.getCurrentCondition().isFinalCondition) {
			throw new Error('Machine has already finished');
		}

		const newMachine = new TuringMachine(s.machine);
		const newLogs = s.machineState.logs;

		try {
			switch (action) {
				case 'run':
					let runResult = newMachine.run();
					newLogs.push(...runResult.logs);
					break;
				case 'step':
					newLogs.push(newMachine.getCurrentCondition());
					newMachine.step();
					break;
				default:
					throw new Error('Invalid action');
			}
		} catch (e) {
			newLogs.pop();
			newLogs.push(e as Error);
		}

		return {
			machine: newMachine,
			machineState: {
				...s.machineState,
				logs: newLogs
			}
		};
	}),
	resetMachine: () => set(s => {
		const newMachine = new TuringMachine(s.machine);
		newMachine.reset();

		return {
			machine: newMachine,
			machineState: {
				...s.machineState,
				logs: []
			}
		};
	}),
	addState: () => set(s => {
		let newStateKey = Date.now();
		let newState = `q${s.machineState.states.size - 1}`; // New state name

		// If the new state name is already in use, increment the number
		if ([...s.machineState.states.values()].includes(newState)) {
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
			machineState: {
				...s.machineState,
				states: new Map(s.machineState.states).set(newStateKey, newState)
			}
		};
	}),
	renameState: (key: StateMapKey, newName: string) => set(s => {
		return {
			machineState: {
				...s.machineState,
				states: new Map(s.machineState.states).set(key, newName)
			}
		}
	}),
	deleteState: (key: StateMapKey) => set(s => {
		const newStates = new Map(s.machineState.states);
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
			machineState: {
				...s.machineState,
				states: newStates
			}
		};
	}),
});