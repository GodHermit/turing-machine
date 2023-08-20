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
});