import InputPlaceholder from '@/components/Input/Placeholder';

export default function TapeInputPlaceholder() {
	return (
		<div className='row row-cols-1 row-cols-md-2 row-gap-2 mb-4'>
			<div className='col col-md-8'>
				<InputPlaceholder
					label='Input:'
				/>
			</div>
			<div className='col col-md-4 d-grid align-items-end'>
				<button
					className='btn btn-secondary placeholder'
				>
					Write to tape
				</button>
			</div>
		</div>
	);
}