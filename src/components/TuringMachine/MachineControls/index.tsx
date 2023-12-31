'use client';

import { useStore } from '@/_store';
import { useMemo } from 'react';
import { Dropdown } from 'react-bootstrap';
import { MdDelete, MdDownload, MdMoreVert, MdSettings, MdTune, MdUpload } from 'react-icons/md';
import { useBoolean } from 'usehooks-ts';
import OptionsModal from '../OptionsModal';
import TapeSettingsModal from '../TapeSettingsModal';

export default function MachineControls() {
	const [
		machine,
		registers,
		executeMachine,
		resetMachine,
		resetAll,
		exportJSON,
		importJSON
	] = useStore(state => [
		state.machine,
		state.registers,
		state.executeMachine,
		state.resetMachine,
		state.resetAll,
		state.exportJSON,
		state.importJSON
	]);
	/**
	 * Machine current condition
	 */
	const currentCondition = machine.getCurrentCondition();
	/**
	 * Error state
	 */
	const machineError = useMemo(() => {
		const lastLogEntry = registers.logs[registers.logs.length - 1];
		return {
			isError: lastLogEntry instanceof Error,
			message: lastLogEntry instanceof Error ? lastLogEntry.message : '',
		};
	}, [registers]);
	/**
	 * Whether action buttons should be disabled
	 */
	const isControlsDisabled = useMemo(() => {
		return machine.getCurrentCondition().isFinalCondition;
	}, [machine]);
	/**
	 * Whether reset button should be disabled
	 */
	const isResetDisabled = useMemo(() => {
		return currentCondition.step === 0 &&
			machineError.isError === false
	}, [currentCondition.step, machineError]);

	/**
	 * Value and handlers for `OptionsModal` visibility
	 */
	const {
		value: isOptionModalVisible,
		setTrue: showOptionsModal,
		setFalse: hideOptionsModal
	} = useBoolean(false);

	/**
	 * Value and handlers for `TapeSettingsModal` visibility
	 */
	const {
		value: isTapeSettingsModalVisible,
		setTrue: showTapeSettingsModal,
		setFalse: hideTapeSettingsModal
	} = useBoolean(false);

	/**
	 * Handle action button click
	 * @param action run machine or make step
	 */
	const handleAction = (action: 'run' | 'step') => {
		if (isControlsDisabled) {
			return;
		}

		executeMachine(action);
	};

	/**
	 * Handle reset button click
	 */
	const handleReset = () => {
		if (isResetDisabled) {
			return;
		}

		resetMachine();
	};

	/**
	 * Handle full reset button click
	 */
	const handleFullReset = () => {
		if (confirm('Are you really want to reset the machine?')) {
			resetAll();
		}
	};

	return (
		<>
			<p className='form-label'>Machine:</p>
			<div className='row gap-2 m-0'>
				<button
					className='col-12 col-md-4 btn btn-primary'
					onClick={() => handleAction('run')}
					disabled={isControlsDisabled}
				>
					Run
				</button>
				<button
					className='col-12 col-md-4 btn btn-secondary'
					onClick={() => handleAction('step')}
					disabled={isControlsDisabled}
				>
					Make step
				</button>
				<button
					className='col btn btn-secondary'
					onClick={handleReset}
					disabled={isResetDisabled}
				>
					Reset
				</button>
				<Dropdown className='col-2 col-md-1 p-0 dropdown-without-caret'>
					<Dropdown.Toggle
						className='w-100 h-100 p-1'
						variant='secondary'
						id='dropdown-basic'
					>
						<MdMoreVert />
					</Dropdown.Toggle>
					<Dropdown.Menu align='end'>
						<Dropdown.Item
							as='button'
							onClick={showOptionsModal}
						>
							<MdSettings />Options
						</Dropdown.Item>
						<Dropdown.Item
							as='button'
							onClick={showTapeSettingsModal}
						>
							<MdTune />Tape Settings
						</Dropdown.Item>
						<Dropdown.Divider />
						<Dropdown.Item
							as='button'
							onClick={() => importJSON()}
						>
							<MdUpload />Import
						</Dropdown.Item>
						<Dropdown.Item
							as='button'
							onClick={() => exportJSON(true)}
						>
							<MdDownload />Export
						</Dropdown.Item>
						<Dropdown.Divider />
						<Dropdown.Item
							as='button'
							onClick={handleFullReset}
						>
							<MdDelete />Full reset
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			</div>
			{machine.getCurrentCondition().isFinalCondition && (
				<div className='alert alert-success mt-2 mb-0' role='alert'>
					<b>Success!</b> Amount of iterations: {currentCondition.step}
				</div>
			)}
			{machineError.isError && (
				<div className='alert alert-danger mt-2 mb-0' role='alert'>
					<b>Error!</b> {machineError.message}
				</div>
			)}
			<OptionsModal
				show={isOptionModalVisible}
				onShow={showOptionsModal}
				onHide={hideOptionsModal}
			/>
			<TapeSettingsModal
				show={isTapeSettingsModalVisible}
				onShow={showTapeSettingsModal}
				onHide={hideTapeSettingsModal}
			/>
		</>
	);
}