import AlphabetInput from '@/components/TuringMachine/AlphabetInput';
import Tape from '@/components/TuringMachine/Tape';
import TapeInput from '@/components/TuringMachine/TapeInput';

export default function Page() {
	return (
		<>
			<div className='row'>
				<div className='col'>
					<Tape />
				</div>
			</div>
			<div className='row'>
				<div className='col text-start'>
					<AlphabetInput />
					<TapeInput />
				</div>
				<div className='col'>
					{/* // TODO: add the instruction table */}
				</div>
			</div >
		</>
	)
}