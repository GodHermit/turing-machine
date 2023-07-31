import { StateCreator } from 'zustand';

export interface TapeSettingsState {
	naturalScrolling: boolean;
	showBlankSymbol: boolean;
	blankSymbol: string;
}

interface TapeSettingsActions {
	setTapeSettings: (settings: Partial<TapeSettingsState>) => void;
}

export const initialTapeSettings: TapeSettingsState = {
	naturalScrolling: false,
	showBlankSymbol: false,
	blankSymbol: 'λ'
};

export type TapeSettingsSlice = { tapeSettings: TapeSettingsState } & TapeSettingsActions;

export const createTapeSettingsSlice: StateCreator<TapeSettingsSlice> = (set) => ({
	tapeSettings: initialTapeSettings,
	setTapeSettings: (state) => set((s) => ({ tapeSettings: { ...s.tapeSettings, ...state } }))
});