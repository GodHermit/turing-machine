import AlphabetInput from '@/components/TuringMachine/AlphabetInput';
import InstructionsInput from '@/components/TuringMachine/InstructionsInput';
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
			<div className='row text-start'>
				<div className='col-6'>
					<AlphabetInput />
					<TapeInput />
				</div>
			</div>
			<div className='row text-start'>
				<div className='col'>
					<InstructionsInput />
				</div>
			</div>
		</>
	)
}