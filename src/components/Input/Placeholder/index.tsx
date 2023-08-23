import clsx from 'clsx';
import { useId } from 'react';

interface InputPlaceholderProps {
	label?: string;
	isInvalid?: boolean;
	invalidFeedback?: string;
}

export default function InputPlaceholder(props: InputPlaceholderProps) {
	const id = useId();

	return (
		<>
			{props.label && (
				<label htmlFor={id} className='form-label placeholder'>{props.label}</label>
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
						'placeholder',
						props.isInvalid && 'is-invalid',
					)}
				/>
				<span className='input-group-text placeholder'>{0}</span>
			</div>
			{props.invalidFeedback && (
				<div className='invalid-feedback position-absolute w-auto placeholder'>
					{props.invalidFeedback}
				</div>
			)}
		</>
	);
}