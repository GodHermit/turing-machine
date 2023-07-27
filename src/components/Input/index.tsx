'use client';

import { ChangeEvent, useState, useId } from 'react';

interface InputProps {
	label?: string;
	value?: string;
	onChange?: (value: string) => void;
}

export default function Input(props: InputProps) {
	const id = useId();
	const [value, setValue] = useState(props.value || '');

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setValue(value);
		props.onChange?.(value);
	};

	return (
		<>
			{props.label && (
				<label htmlFor={id} className='form-label'>{props.label}</label>
			)}
			<div className='input-group'>
				<input
					type='text'
					id={id}
					className='form-control'
					value={value}
					onChange={handleChange}
				/>
				<span className='input-group-text'>{value.length}</span>
			</div>
		</>
	);
}