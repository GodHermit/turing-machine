import { create } from 'zustand';
import { TapeSettingsSlice, createTapeSettingsSlice } from './tapeSettingsSlice';

export const useStore = create<TapeSettingsSlice>()((...a) => ({
	...createTapeSettingsSlice(...a),
}));