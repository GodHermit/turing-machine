import { useStore } from '@/_store';
import clsx from 'clsx';
import { useMemo } from 'react';

export default function InitialStateSelect() {
	const [machine, machineState, setOptions] = useStore(state => [state.machine, state.machineState, state.setOptions]);
	const initialStateIndex = machine.getOptions().initialStateIndex;
	const states = [...machineState.states].filter(([key]) => key !== '!');

	/**
	 * Value of initial state select
	 */
	const value = useMemo(() => {
		if (states.length <= 0) {
			return '';
		}

		return initialStateIndex;
	}, [initialStateIndex, states]);

	const isSelectInvalid = useMemo((): { value: boolean, feedback: string } => {
		if (states.length <= 0) {
			return {
				value: true,
				feedback: 'Select an initial state'
			};
		}

		return {
			value: false,
			feedback: ''
		}
	}, [states]);

	/**
	 * Handles change of initial state select
	 * @param e change event
	 */
	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newStateIndex = [...machineState.states].find(([key]) => key == e.target.value)?.[0] ??
			machine.getOptions().initialStateIndex;

		setOptions({
			initialStateIndex: newStateIndex
		});
	};

	return (
		<>
			<label htmlFor='initial-state' className='form-label'>Initial state:</label>
			<select
				id='initial-state'
				className={clsx(
					'form-select',
					isSelectInvalid.value && 'is-invalid'
				)}
				value={value}
				onChange={handleChange}
				required
			>
				<option value='' disabled hidden>Select an initial state...</option>
				{states.length <= 0 && (
					<option value='' disabled>No states</option>
				)}
				{states.map(([key, value]) => (
					<option key={key} value={key}>{value}</option>
				))}
			</select>
			{isSelectInvalid.feedback.length >= 0 && (
				<div className='invalid-feedback'>
					{isSelectInvalid.feedback}
				</div>
			)}
		</>
	);
}