import TuringMachine, { defaultOptions } from '@/lib/turingMachine';
import { Instruction, TuringMachineOptions } from '@/lib/turingMachine/types';
import { StateCreator } from 'zustand';
import { StoreType } from '..';

export interface Machine {
	/**
	 * The Turing machine.
	 */
	machine: TuringMachine;
}

interface MachineActions {
	/**
	 * Set the Turing machine.
	 * @param machine The new Turing machine.
	 */
	setMachine: (machine: TuringMachine) => void;
	/**
	 * Set the instructions of the machine
	 * @param instructions Array of instructions
	 */
	setInstructions: (instructions: Instruction[]) => void;
	/**
	 * Set the head position of the machine
	 * @param position New position of the head
	 * @param isInitial Whether the position should be set as initial position
	 */
	setHeadPosition: (position: number, isInitial?: boolean) => void;
	/**
	 * Set the options of the machine
	 * @param options Options to set
	 */
	setOptions: (options: Partial<TuringMachineOptions>) => void;
	/**
	 * Execute the machine
	 * @param action Action to execute (run or step)
	 */
	executeMachine: (action: 'run' | 'step') => void;
	/**
	 * Reset the machine to its initial state
	 */
	resetMachine: () => void;
}

export const initialMachine = {
	machine: new TuringMachine()
};

export type MachineSlice = Machine & MachineActions;

export const createMachineSlice: StateCreator<
	StoreType,
	[],
	[],
	MachineSlice
> = (set) => ({
	...initialMachine,
	setMachine: (machine: TuringMachine) => set(() => ({ machine })),
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
	setOptions: (options: Partial<TuringMachineOptions>) => set(s => {
		const newMachine = new TuringMachine(s.machine);

		// If provided initial state is not valid
		if (options.initialStateIndex !== undefined && !s.registers.states.get(options.initialStateIndex)) {
			const states = [...s.registers.states].filter(([key]) => key !== defaultOptions.finalStateIndex);
			// Get the first state as fallback
			const fallbackStateIndex = states.length > 0 ? states[0][0] : undefined;

			// Set fallback state as initial state
			options.initialStateIndex = fallbackStateIndex;
		}

		// Set options
		newMachine.setOptions(options);

		// If machine is not running, set current condition
		if (newMachine.getCurrentCondition().step === 0) {
			const currentCondition = newMachine.getCurrentCondition();

			newMachine.setCurrentCondition({
				stateIndex: options.initialStateIndex ?? currentCondition.stateIndex,
				headPosition: options.initialPosition ?? currentCondition.headPosition
			});
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
		const newLogs = s.registers.logs;

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
			registers: {
				...s.registers,
				logs: newLogs
			}
		};
	}),
	resetMachine: () => set(s => {
		const newMachine = new TuringMachine(s.machine);
		newMachine.reset();

		return {
			machine: newMachine,
			registers: {
				...s.registers,
				logs: []
			}
		};
	}),
});