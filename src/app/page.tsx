import AlphabetInput from '@/components/TuringMachine/AlphabetInput';
import InstructionsInput from '@/components/TuringMachine/InstructionsInput';
import MachineControls from '@/components/TuringMachine/MachineControls';
import Tape from '@/components/TuringMachine/Tape';
import TapeInput from '@/components/TuringMachine/TapeInput';
import { Metadata } from 'next';

const basePath = '/turing-machine';
export const metadata: Metadata = {
	title: 'Turing Machine',
	description: 'A web application that simulates a Turing Machine.',
	themeColor: '#212529',
	icons: {
		icon: [
			{
				url: '/favicon.ico',
			}, {
				url: `${basePath}/assets/favicons/favicon-16x16.png`,
				type: 'image/png',
				sizes: '16x16',
			}, {
				url: `${basePath}/assets/favicons/favicon-32x32.png`,
				type: 'image/png',
				sizes: '32x32',
			}, {
				url: `${basePath}/assets/favicons/android-chrome-192x192.png`,
				type: 'image/png',
				sizes: '192x192',
			}, {
				url: `${basePath}/assets/favicons/android-chrome-512x512.png`,
				type: 'image/png',
				sizes: '512x512',
			}
		],
		apple: `${basePath}/assets/favicons/apple-touch-icon.png`
	},
	manifest: `${basePath}/manifest.json`,
	openGraph: {
		title: 'Turing Machine',
		description: 'A web application that simulates a Turing Machine.',
		url: 'https://godhermit.github.io/turing-machine',
		type: 'website',
		locale: 'en_US',
	}
};

export default function Page() {
	return (
		<>
			<div className='row'>
				<div className='col'>
					<Tape />
				</div>
			</div>
			<div className='row row-cols-1 row-cols-lg-2 row-gap-4 flex-wrap-reverse text-start'>
				<div className='col'>
					<AlphabetInput />
					<TapeInput />
				</div>
				<div className='col'>
					<MachineControls />
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