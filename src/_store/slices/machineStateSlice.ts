import { Instruction } from '@/lib/turingMachine/types';
import { StateCreator } from 'zustand';

export interface MachineState {
	alphabet: string[];
	input: string;
	currentTapeValue: string;
	instructions: Instruction[];
}

interface MachineActions {
	setMachineState: (settings: Partial<MachineState>) => void;
}

export const initialMachineState: MachineState = {
	alphabet: [],
	input: '',
	currentTapeValue: '',
	instructions: []
};

export type MachineStateSlice = { machineState: MachineState } & MachineActions;

export const createMachineStateSlice: StateCreator<MachineStateSlice> = (set) => ({
	machineState: initialMachineState,
	setMachineState: (state) => set((s) => ({ machineState: { ...s.machineState, ...state } }))
});