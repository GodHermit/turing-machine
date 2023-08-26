export default function MachineControlsPlaceholder() {
	return (
		<>
			<p className='form-label placeholder'>Machine:</p>
			<div className='row gap-2 m-0'>
				<button
					className='col-12 col-md-4 btn btn-primary disabled placeholder'
				></button>
				<button
					className='col-12 col-md-4 btn btn-secondary disabled placeholder'
				></button>
				<button
					className='col btn btn-secondary disabled placeholder'
				></button>
				<button
					className='col-2 col-md-1 btn btn-secondary disabled placeholder'
				></button>
			</div>
		</>
	);
}