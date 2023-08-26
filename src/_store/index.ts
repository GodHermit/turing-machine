import TuringMachine from '@/lib/turingMachine';
import { StateMap, StateMapKey } from '@/lib/turingMachine/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MachineStateSlice, createMachineStateSlice } from './slices/machineStateSlice';
import { TapeSettingsSlice, createTapeSettingsSlice } from './slices/tapeSettingsSlice';

type StoreUtils = {
	resetAll: () => void;
};

type StoreType = TapeSettingsSlice & MachineStateSlice & StoreUtils;

export const useStore = create<StoreType>()(
	persist(
		(...a) => ({
			...createTapeSettingsSlice(...a),
			...createMachineStateSlice(...a),
			resetAll: () => {
				const [set, get, store] = a;

				store.persist.clearStorage();
				window.location.reload();
			}
		}),
		{
			name: 'turing-machine',
			storage: createJSONStorage(() => localStorage, {
				reviver: (key, value) => {
					if (key === 'machine') {
						const newMachine = new TuringMachine(
							(value as any).input,
							(value as any).instructions,
							(value as any).options
						);
						newMachine.setCurrentCondition((value as any).current);

						return newMachine;
					}

					if (key === 'states') {
						return (value as Array<[StateMapKey, string]>)
							.reduce((acc, [key, value]) => {
								acc.set(key, value);
								return acc;
							}, new Map<StateMapKey, string>());
					}

					return value;
				},
				replacer: (key, value) => {
					if (key === 'states') {
						return [...(value as StateMap).entries()];
					}

					return value;
				}
			})
		}
	)
);