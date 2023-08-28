import { useStore } from '@/_store';
import { defaultOptions } from '@/lib/turingMachine';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { number } from 'yup';

const schema = number()
	.required()
	.integer()
	.positive()
	.max(Number.MAX_SAFE_INTEGER)
	.default(defaultOptions.maxSteps)
	.label('Maximum amount of steps');

export default function MaxStepsInput() {
	const [machine, setOptions] = useStore(state => [state.machine, state.setOptions]);
	const [value, setValue] = useState<string>(machine.getOptions().maxSteps.toString());
	const maxSteps = machine.getOptions().maxSteps;

	/**
	 * Syncs the value of the input with the state
	 */
	useEffect(() => {
		setValue(maxSteps.toString());
	}, [maxSteps]);

	const isInputInvalid = useMemo((): { value: boolean, feedback: string } => {
		if (value.trim() === '') {
			return {
				value: true,
				feedback: 'This field is required'
			}
		}

		if (isNaN(Number(value))) {
			return {
				value: true,
				feedback: 'Invalid number'
			}
		}

		try {
			schema.validateSync(value);
		} catch (error) {
			return {
				value: true,
				feedback: (error as Error).message
			}
		}

		return {
			value: false,
			feedback: '',
		}
	}, [value]);

	/**
	 * Handles change of initial position input
	 * @param e change event
	 */
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);

		if (
			!schema.isValidSync(e.target.valueAsNumber) ||
			isInputInvalid.value
		) {
			return;
		}

		setOptions({
			maxSteps: e.target.valueAsNumber
		});
	};

	return (
		<>
			<label htmlFor='max-steps' className='form-label'>Maximum amount of steps:</label>
			<input
				type='number'
				id='max-steps'
				className={clsx(
					'form-control',
					isInputInvalid.value && 'is-invalid'
				)}
				min={1}
				max={Number.MAX_SAFE_INTEGER}
				placeholder={defaultOptions.maxSteps.toString()}
				value={value}
				onChange={handleChange}
			/>
			{isInputInvalid.feedback.length > 0
				? (
					<div className='invalid-feedback'>
						{isInputInvalid.feedback}
					</div>
				)
				: (
					<div className='form-text'>
						<b>Note:</b> «Make step» button has no limit on the amount of steps.
					</div>
				)}
		</>
	);
}