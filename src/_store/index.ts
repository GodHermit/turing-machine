import { create } from 'zustand';
import { MachineStateSlice, createMachineStateSlice } from './slices/machineStateSlice';
import { TapeSettingsSlice, createTapeSettingsSlice } from './slices/tapeSettingsSlice';

type StoreType = TapeSettingsSlice & MachineStateSlice;

export const useStore = create<StoreType>()((...a) => ({
	...createTapeSettingsSlice(...a),
	...createMachineStateSlice(...a),
}));