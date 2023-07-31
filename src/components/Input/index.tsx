'use client';

import clsx from 'clsx';
import { ChangeEvent, useEffect, useId, useState } from 'react';

interface InputProps {
	label?: string;
	value?: string;
	isInvalid?: boolean;
	invalidFeedback?: string;
	onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function Input(props: InputProps) {
	const id = useId();
	const [value, setValue] = useState(props.value || '');

	useEffect(() => {
		setValue(props.value || '');
	}, [props.value]);

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setValue(value);
		props.onChange?.(e);
	};

	return (
		<>
			{props.label && (
				<label htmlFor={id} className='form-label'>{props.label}</label>
			)}
			<div className={
				clsx(
					'input-group',
					props.isInvalid && 'is-invalid',
				)
			}>
				<input
					type='text'
					id={id}
					className={clsx(
						'form-control',
						props.isInvalid && 'is-invalid',
					)}
					value={value}
					onChange={handleChange}
				/>
				<span className='input-group-text'>{value.length}</span>
			</div>
			{props.invalidFeedback && (
				<div className='invalid-feedback position-absolute w-auto'>
					{props.invalidFeedback}
				</div>
			)}
		</>
	);
}