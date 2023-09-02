import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MachineSlice, createMachineSlice } from './slices/machineSlice';
import { RegistersSlice, createRegistersSlice } from './slices/registersSlice';
import { TapeSettingsSlice, createTapeSettingsSlice } from './slices/tapeSettingsSlice';
import { Utilities, createUtilitiesSlice } from './slices/utilitiesSlice';
import replacer from './utilities/replacer';
import reviver from './utilities/reviver';

export type StoreType = MachineSlice &
	TapeSettingsSlice &
	RegistersSlice &
	Utilities;

export const useStore = create<StoreType>()(
	persist(
		(...a) => ({
			...createMachineSlice(...a),
			...createTapeSettingsSlice(...a),
			...createRegistersSlice(...a),
			...createUtilitiesSlice(...a),
		}),
		{
			name: 'turing-machine',
			storage: createJSONStorage(() => localStorage, {
				reviver,
				replacer,
			})
		}
	)
);