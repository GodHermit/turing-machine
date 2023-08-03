'use client';

import { useStore } from '@/_store';
import TuringMachine from '@/lib/turingMachine';
import { useEffect, useMemo, useRef, useState } from 'react';

const objToStr = (obj: Object) => JSON.stringify(Object.values(obj));

export default function MachineControls() {
	const [machineState, setMachineState] = useStore(state => [state.machineState, state.setMachineState]);
	/**
	 * Machine instance
	 */
	const { current: machine } = useRef(
		new TuringMachine(
			machineState.currentTapeValue,
			machineState.instructions,
			machineState.options
		)
	);
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
		return machineState.currentState === machine.getOptions().finalState;
	}, [machineState.currentState, machine]);
	/**
	 * Whether reset button should be disabled
	 */
	const isResetDisabled = useMemo(() => {
		return currentCondition.step === 0;
	}, [currentCondition.step]);

	/**
	 * Update machine instance when input has changed
	 */
	useEffect(() => {
		if (
			machine.getCurrentCondition().step === 0 && // If machine is not running
			machineState.currentTapeValue !== machine.getInput() && // If input has changed
			machineState.input === machineState.currentTapeValue // If input is equal to current tape value
		) {
			machine.setInput(machineState.currentTapeValue);
			machine.reset();
		}
	}, [machine, machineState.input, machineState.currentTapeValue]);

	/**
	 * Update machine instance when instructions has changed
	 */
	useEffect(() => {
		if (
			objToStr(machineState.instructions) !== objToStr(machine.getInstructions())
		) {
			machine.setInstructions(machineState.instructions);
		}
	}, [machine, machineState.instructions]);

	/**
	 * Update machine instance when options has changed
	 */
	useEffect(() => {
		if (
			objToStr(machineState.options) !== objToStr(machine.getOptions()) // If options has changed
		) {
			machine.setOptions(machineState.options);
		}

		if (
			// If initial head position has changed
			machineState.options.initialPosition !== machine.getCurrentCondition().headPosition &&
			// If head position is not equal to current head position
			machineState.currentHeadPos !== machine.getCurrentCondition().headPosition
		) {
			machine.setCurrentCondition({
				headPosition: machineState.currentHeadPos,
			});
		}
	}, [machine, machineState.options, machineState.currentHeadPos]);

	/**
	 * Handle action button click
	 * @param action run machine or make step
	 */
	const handleAction = (action: 'run' | 'step') => {
		if (isControlsDisabled) {
			return;
		}

		try {
			if (machineState.currentState === machine.getOptions().finalState) {
				throw new Error('Machine has already finished');
			}

			const tapeValue = machine[action]();
			const { headPosition, state } = machine.getCurrentCondition();
			setMachineState({
				currentTapeValue: tapeValue,
				currentHeadPos: headPosition,
				currentState: state
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
		machine.reset();
		setMachineError({
			isError: false,
			message: '',
		});
		setMachineState({
			currentTapeValue: machineState.input,
			currentHeadPos: machineState.options.initialPosition,
			currentState: machineState.options.initialState,
		});
	};

	return (
		<>
			<p className='form-label'>Machine:</p>
			<div className='mb-2'>
				<button
					className='btn btn-primary me-2'
					onClick={() => handleAction('run')}
					disabled={isControlsDisabled}
				>
					Run
				</button>
				<button
					className='btn btn-secondary me-2'
					onClick={() => handleAction('step')}
					disabled={isControlsDisabled}
				>
					Make step
				</button>
				<button
					className='btn btn-secondary'
					onClick={handleReset}
					disabled={isResetDisabled}
				>
					Reset
				</button>
			</div>
			{machineState.currentState === machine.getOptions().finalState && (
				<div className='alert alert-success mb-2' role='alert'>
					<b>Success!</b> Amount of iterations: {currentCondition.step}
				</div>
			)}
			{machineError.isError && (
				<div className='alert alert-danger' role='alert'>
					<b>Error!</b> {machineError.message}
				</div>
			)}
		</>
	);
}