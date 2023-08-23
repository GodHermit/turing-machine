import TuringMachine from '@/lib/turingMachine';
import { StateMap, StateMapKey } from '@/lib/turingMachine/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MachineStateSlice, createMachineStateSlice } from './slices/machineStateSlice';
import { TapeSettingsSlice, createTapeSettingsSlice } from './slices/tapeSettingsSlice';

type StoreType = TapeSettingsSlice & MachineStateSlice;

export const useStore = create<StoreType>()(
	persist(
		(...a) => ({
			...createTapeSettingsSlice(...a),
			...createMachineStateSlice(...a),
		}),
		{
			name: 'turing-machine',
			storage: createJSONStorage(() => localStorage, {
				reviver: (key, value) => {
					if (key === 'machine') {
						// return new TuringMachine(value);
						console.log('new machine', value);
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