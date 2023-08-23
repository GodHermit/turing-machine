import AlpahbetInputPlaceholder from '@/components/TuringMachine/AlphabetInput/Placeholder';
import InstructionsInputPlaceholder from '@/components/TuringMachine/InstructionsInput/Placeholder';
import MachineControlsPlaceholder from '@/components/TuringMachine/MachineControls/Placeholder';
import TapePlaceholder from '@/components/TuringMachine/Tape/Placeholder';
import TapeInputPlaceholder from '@/components/TuringMachine/TapeInput/Placeholder';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

const AlphabetInput = dynamic(() => import('@/components/TuringMachine/AlphabetInput'), { ssr: false, loading: AlpahbetInputPlaceholder });
const InstructionsInput = dynamic(() => import('@/components/TuringMachine/InstructionsInput'), { ssr: false, loading: InstructionsInputPlaceholder });
const MachineControls = dynamic(() => import('@/components/TuringMachine/MachineControls'), { ssr: false, loading: MachineControlsPlaceholder });
const MachineLogs = dynamic(() => import('@/components/TuringMachine/MachineLogs'), { ssr: false });
const Tape = dynamic(() => import('@/components/TuringMachine/Tape'), { ssr: false, loading: TapePlaceholder });
const TapeInput = dynamic(() => import('@/components/TuringMachine/TapeInput'), { ssr: false, loading: TapeInputPlaceholder });

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
			<div className='row text-start mb-4'>
				<div className='col'>
					<InstructionsInput />
				</div>
			</div>
			<div className='row text-start'>
				<div className='col'>
					<MachineLogs />
				</div>
			</div>
		</>
	)
}