'use client';

import { useStore } from '@/_store';
import TuringMachine from '@/lib/turingMachine';
import { useEffect, useMemo, useRef, useState } from 'react';

const objToStr = (obj: Object) => JSON.stringify(Object.values(obj));

export default function MachineControls() {
	const [machine] = useStore(state => [state.machine]);
	/**
	 * Machine current condition
	 */
	const currentCondition = machine.getCurrentCondition();
	/**
	 * Error state
	 */
	const [machineError, setMachineError] = useState({
		isError: false,
		message: '',
	});
	/**
	 * Whether action buttons should be disabled
	 */
	const isControlsDisabled = useMemo(() => {
		return machine.getCurrentCondition().finalCondition;
	}, [machine]);
	/**
	 * Whether reset button should be disabled
	 */
	const isResetDisabled = useMemo(() => {
		return currentCondition.step === 0;
	}, [currentCondition.step]);

	/**
	 * Handle action button click
	 * @param action run machine or make step
	 */
	const handleAction = (action: 'run' | 'step') => {
		if (isControlsDisabled) {
			return;
		}

		try {
			if (machine.getCurrentCondition().finalCondition) {
				throw new Error('Machine has already finished');
			}
			const newMachine = new TuringMachine(machine);
			newMachine[action]();
			useStore.setState({
				machine: newMachine,
			});
		} catch (error: any) {
			setMachineError({
				isError: true,
				message: error.message,
			});
		}
	};

	/**
	 * Handle reset button click
	 */
	const handleReset = () => {
		const newMachine = new TuringMachine(machine);
		newMachine.reset();
		useStore.setState({
			machine: newMachine,
		});

		setMachineError({
			isError: false,
			message: '',
		});
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
			{machine.getCurrentCondition().finalCondition && (
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