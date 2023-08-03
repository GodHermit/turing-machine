import { defaultOptions } from '@/lib/turingMachine';
import { Instruction, TuringMachineOptions } from '@/lib/turingMachine/types';
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
	 * The input tape value.
	 */
	input: string;
	/**
	 * The instructions of the Turing machine.
	 */
	instructions: Instruction[];
	/**
	 * The current tape value.
	 */
	currentTapeValue: string;
	/**
	 * The current head position.
	 * @description The offset is relative to the first symbol of the input
	 * @default 0
	 */
	currentHeadPos: number;
	/**
	 * The current state of the Turing machine.
	 */
	currentState: string;
	/**
	 * The options of the Turing machine.
	 */
	options: TuringMachineOptions;
}

interface MachineActions {
	setMachineState: (settings: Partial<MachineState>) => void;
}

export const initialMachineState: MachineState = {
	alphabet: [],
	states: ['q0'],
	input: '',
	instructions: [],
	currentTapeValue: '',
	currentHeadPos: 0,
	currentState: 'q0',
	options: defaultOptions
};

export type MachineStateSlice = { machineState: MachineState } & MachineActions;

export const createMachineStateSlice: StateCreator<MachineStateSlice> = (set) => ({
	machineState: initialMachineState,
	setMachineState: (state) => set((s) => ({ machineState: { ...s.machineState, ...state } }))
});