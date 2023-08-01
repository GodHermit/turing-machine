import { Instruction } from '@/lib/turingMachine/types';
import { StateCreator } from 'zustand';

export interface MachineState {
	/**
	 * The alphabet of the Turing machine.
	 */
	alphabet: string[];
	/**
	 * The input tape value.
	 */
	input: string;
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
	 * The instructions of the Turing machine.
	 */
	instructions: Instruction[];
}

interface MachineActions {
	setMachineState: (settings: Partial<MachineState>) => void;
}

export const initialMachineState: MachineState = {
	alphabet: [],
	input: '',
	currentTapeValue: '',
	currentHeadPos: 0,
	instructions: []
};

export type MachineStateSlice = { machineState: MachineState } & MachineActions;

export const createMachineStateSlice: StateCreator<MachineStateSlice> = (set) => ({
	machineState: initialMachineState,
	setMachineState: (state) => set((s) => ({ machineState: { ...s.machineState, ...state } }))
});