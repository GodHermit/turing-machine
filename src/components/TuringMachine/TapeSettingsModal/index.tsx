import { Button, Modal, ModalProps } from 'react-bootstrap';
import BlankSymbolInput from './BlankSymbolInput';
import NaturalScrollingSwitch from './NaturalScrollingSwitch';
import ShowBlankSymbolSwitch from './ShowBlankSymbolSwitch';

export default function TapeSettingsModal(props: ModalProps) {
	return (
		<Modal
			show={props.show}
			onHide={props.onHide}
			centered
			scrollable
			fullscreen='sm-down'
		>
			<Modal.Header>
				<Modal.Title>Tape Settings</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className='mb-3'>
					<NaturalScrollingSwitch />
				</div>
				<div className='mb-3'>
					<ShowBlankSymbolSwitch />
				</div>
				<div>
					<BlankSymbolInput />
				</div>
			</Modal.Body>
			<Modal.Footer className='row gap-2 gap-md-3 m-0'>
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