import { useStore } from '@/_store';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { number } from 'yup';

const schema = number()
	.required()
	.integer()
	.min(Number.MIN_SAFE_INTEGER)
	.max(Number.MAX_SAFE_INTEGER)
	.label('Initial head position');

export default function InitialPositionInput() {
	const [machine, setOptions] = useStore(state => [state.machine, state.setOptions]);
	const [value, setValue] = useState<string>(machine.getOptions().initialPosition.toString());
	const initialPosition = machine.getOptions().initialPosition;

	/**
	 * Syncs the value of the input with the state
	 */
	useEffect(() => {
		setValue(initialPosition.toString());
	}, [initialPosition]);

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
			feedback: ''
		}
	}, [value])

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
			console.log('invalid');

			return;
		}

		setOptions({
			initialPosition: e.target.valueAsNumber
		});
	};

	return (
		<>
			<label htmlFor='initial-position' className='form-label'>Initial head position:</label>
			<input
				type='number'
				id='initial-position'
				className={clsx(
					'form-control',
					isInputInvalid.value && 'is-invalid'
				)}
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
						Relative to the start of the tape value string.
					</div>
				)
			}
		</>
	);
}