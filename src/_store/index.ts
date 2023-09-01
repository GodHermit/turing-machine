import TuringMachine from '@/lib/turingMachine';
import { StateMap, StateMapKey } from '@/lib/turingMachine/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MachineSlice, createMachineSlice } from './slices/machineSlice';
import { MachineStateSlice, createMachineStateSlice } from './slices/machineStateSlice';
import { TapeSettingsSlice, createTapeSettingsSlice } from './slices/tapeSettingsSlice';

type StoreUtils = {
	resetAll: () => void;
};

export type StoreType = MachineSlice &
	TapeSettingsSlice &
	MachineStateSlice &
	StoreUtils;

export const useStore = create<StoreType>()(
	persist(
		(...a) => ({
			...createMachineSlice(...a),
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
					switch (key) {
						case 'machine':
							// Convert object to instance of TuringMachine
							const newMachine = new TuringMachine(
								(value as any).input,
								(value as any).instructions,
								(value as any).options
							);
							newMachine.setCurrentCondition((value as any).current);

							return newMachine;

						case 'states':
							// Convert array of entries to Map
							return (value as Array<[StateMapKey, string]>)
								.reduce((acc, [key, value]) => {
									acc.set(key, value);
									return acc;
								}, new Map<StateMapKey, string>());

						case 'logs':
							// Convert objects with type 'error' to instances of Error
							return (value as Array<any>)
								.map(log => {
									if (log.type === 'error') {
										return new Error(log.message, {
											cause: log.cause,
										});
									}

									return log;
								});
						case 'blankSymbol':
							if (value !== TuringMachine.BLANK_SYMBOL) {
								TuringMachine.setBlankSymbol(value as string);
							}
							return value;

						default:
							// Return value as is
							return value;
					}
				},
				replacer: (key, value) => {
					switch (key) {
						case 'states':
							// Convert Map to array of entries
							return [...(value as StateMap).entries()];

						case 'logs':
							// Convert instances of Error to plain objects
							return (value as StoreType['machineState']['logs'])
								.map(log => {
									if (log instanceof Error) {
										return {
											type: 'error',
											message: log.message,
											cause: log.cause,
										};
									}

									return log;
								});

						default:
							// Return value as is
							return value;
					}
				}
			})
		}
	)
);