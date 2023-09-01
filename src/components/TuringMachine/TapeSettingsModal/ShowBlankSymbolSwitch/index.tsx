import { useStore } from '@/_store';

export default function ShowBlankSymbolSwitch() {
	const [
		tapeSettings,
		setTapeSettings
	] = useStore(state => [state.tapeSettings, state.setTapeSettings]);

	return (
		<div className='form-check form-switch form-check-reverse'>
			<label
				className='form-check-label w-100 text-start'
				htmlFor='show-blank-symbol'
			>
				Show blank symbol
			</label>
			<input
				className='form-check-input'
				type='checkbox'
				role='switch'
				id='show-blank-symbol'
				checked={tapeSettings.showBlankSymbol}
				onChange={(e) => setTapeSettings({
					showBlankSymbol: e.target.checked
				})}
			/>
		</div>
	);
}