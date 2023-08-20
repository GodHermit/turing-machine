'use client';

import { useStore } from '@/_store';
import { useMemo } from 'react';

export default function MachineControls() {
	const [
		machine,
		machineState,
		executeMachine,
		resetMachine,
	] = useStore(state => [
		state.machine,
		state.machineState,
		state.executeMachine,
		state.resetMachine
	]);
	/**
	 * Machine current condition
	 */
	const currentCondition = machine.getCurrentCondition();
	/**
	 * Error state
	 */
	const machineError = useMemo(() => {
		const lastLogEntry = machineState.logs[machineState.logs.length - 1];
		return {
			isError: lastLogEntry instanceof Error,
			message: lastLogEntry instanceof Error ? lastLogEntry.message : '',
		};
	}, [machineState]);
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
					className='col btn btn-secondary'
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
		</>
	);
}