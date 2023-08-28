import { useStore } from '@/_store';
import { defaultOptions } from '@/lib/turingMachine';
import { Button, Modal, ModalProps } from 'react-bootstrap';
import InitialPositionInput from './InitialPositionInput';
import InitialStateSelect from './InitialStateSelect';
import MaxStepsInput from './MaxStepsInput';

export default function OptionsModal(props: ModalProps) {
	const [setOptions] = useStore(state => [state.setOptions]);

	return (
		<Modal
			show={props.show}
			onHide={props.onHide}
			centered
			scrollable
			fullscreen='sm-down'
		>
			<Modal.Header>
				<Modal.Title>Turing Machine Options</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className='mb-3'>
					<InitialStateSelect />
				</div>
				<div className='mb-3'>
					<InitialPositionInput />
				</div>
				<div>
					<MaxStepsInput />
				</div>
			</Modal.Body>
			<Modal.Footer className='row gap-2 gap-md-3 m-0'>
				<Button
					variant='secondary'
					className='col-12 col-md'
					onClick={() => setOptions(defaultOptions)}
				>
					Reset to default
				</Button>
				<Button
					variant='primary'
					className='col-12 col-md'
					onClick={props.onHide}
				>
					Done
				</Button>
			</Modal.Footer>
		</Modal>
	);
}