import TuringMachine from '@/lib/turingMachine';
import { Instruction, TuringMachineExtendedCondition } from '@/lib/turingMachine/types';
import { StateCreator } from 'zustand';

export interface MachineState {
	/**
	 * The alphabet of the Turing machine.
	 */
	alphabet: string[];
	/**
	 * Array of states of the Turing machine.
	 */
	states: string[];
	/**
	 * Array of conditions of the Turing machine.
	 */
	logs: Array<TuringMachineExtendedCondition | Error>;
}

interface MachineActions {
	setMachineState: (settings: Partial<MachineState>) => void;
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
	renameState: (name: string, newName: string) => void;
	/**
	 * Delete a state
	 * @param stateName Name of the state to delete 
	 */
	deleteState: (name: string) => void;
}

export const initialMachineState: MachineState = {
	alphabet: [],
	states: ['q0'],
	logs: []
};

export type MachineStateSlice = {
	machine: TuringMachine;
	machineState: MachineState
} & MachineActions;

export const createMachineStateSlice: StateCreator<MachineStateSlice> = (set) => ({
	machine: new TuringMachine(),
	machineState: initialMachineState,
	setMachineState: (state) => set(s => ({ machineState: { ...s.machineState, ...state } })),
	setMachineAlphabet: (alphabet) => set(s => {
		let instructions = s.machine.getInstructions();

		// Remove instructions that are not in the new alphabet
		instructions = instructions.filter(instruction => {
			const { symbol, newSymbol } = instruction;

			return alphabet.includes(symbol) && alphabet.includes(newSymbol);
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
		let newState = `q${s.machineState.states.length}`; // New state name

		// If the new state name is already in use, leave it empty
		if (s.machineState.states.includes(newState)) {
			newState = '';
		}

		const newMachine = new TuringMachine(s.machine);
		const options = newMachine.getOptions();
		if (!options.initialState) {
			newMachine.setOptions({ initialState: newState });
		}

		const currentCondition = newMachine.getCurrentCondition();
		if (!currentCondition.state) {
			newMachine.setCurrentCondition({ state: newState });
		}

		return {
			machine: newMachine,
			machineState: {
				...s.machineState,
				states: [...s.machineState.states, newState]
			}
		};
	}),
	renameState: (name: string, newName: string) => set(s => {
		// If the new name is already in use, don't change anything
		if ([...s.machineState.states, s.machine.getOptions().finalState].includes(newName)) return {};

		const newMachine = new TuringMachine(s.machine);

		// Update the state name in the instructions
		const newInstructions = newMachine.getInstructions()
			.map(instruction => {
				if (instruction.state === name) instruction.state = newName;
				if (instruction.newState === name) instruction.newState = newName;
				return instruction;
			});
		newMachine.setInstructions(newInstructions);

		// Update state name in the options
		const options = newMachine.getOptions();
		newMachine.setOptions({
			initialState: options.initialState === name ? newName : options.initialState,
			finalState: options.finalState === name ? newName : options.finalState,
		});

		// Update state name in the current condition
		const currentCondition = newMachine.getCurrentCondition();
		newMachine.setCurrentCondition({
			state: currentCondition.state === name ? newName : currentCondition.state,
		});

		return {
			machine: newMachine,
			machineState: {
				...s.machineState,
				states: s.machineState.states.map(state => state === name ? newName : state)
			}
		}
	}),
	deleteState: (name: string) => set(s => {
		const newStates = s.machineState.states.filter(state => state !== name);
		const newMachine = new TuringMachine(s.machine);

		// Delete instructions that use the state
		const newInstructions = newMachine.getInstructions()
			.filter(instruction =>
				instruction.state !== name &&
				instruction.newState !== name
			);
		newMachine.setInstructions(newInstructions);

		const fallbackState = newStates[0];

		// Update state name in the options
		const options = newMachine.getOptions();
		newMachine.setOptions({
			initialState: options.initialState === name ? fallbackState : options.initialState,
			finalState: options.finalState === name ? fallbackState : options.finalState,
		});

		// Update state name in the current condition
		const currentCondition = newMachine.getCurrentCondition();
		newMachine.setCurrentCondition({
			state: currentCondition.state === name ? fallbackState : currentCondition.state,
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