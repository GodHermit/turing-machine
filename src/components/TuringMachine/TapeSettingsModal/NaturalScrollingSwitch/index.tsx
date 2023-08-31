import { useStore } from '@/_store';

export default function NaturalScrollingSwitch() {
	const [
		tapeSettings,
		setTapeSettings
	] = useStore(state => [state.tapeSettings, state.setTapeSettings]);

	return (
		<div className='form-check form-switch form-check-reverse'>
			<label
				className='form-check-label w-100 text-start'
				htmlFor='natural-scrolling'
			>
				Natural Scrolling
			</label>
			<input
				className='form-check-input'
				type='checkbox'
				role='switch'
				id='natural-scrolling'
				checked={tapeSettings.naturalScrolling}
				onChange={(e) => setTapeSettings({
					naturalScrolling: e.target.checked
				})}
			/>
		</div>
	);
}