import Input from '@/components/Input';
import Tape from '@/components/Tape';

export default function Page() {
	return (
		<>
			<div className='row'>
				<div className='col'>
					<Tape value='111 011' />
				</div>
			</div>
			<div className='row'>
				<div className='col text-start'>
					<div className='mb-4'>
						<Input label='Alphabet:'/>
					</div>
					<div className='mb-4'>
						<Input label='Input:'/>
					</div>
				</div>
				<div className='col'>
					{/* // TODO: add the instruction table */}
				</div>
			</div>
		</>
	)
}