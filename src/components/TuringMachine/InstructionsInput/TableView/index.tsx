'use client';

import { useStore } from '@/_store';
import TuringMachine from '@/lib/turingMachine';
import { MdClose } from 'react-icons/md';
import { useDebounce } from 'usehooks-ts';
import styles from '../InstructionInput.module.scss';
import TableViewCell from './TableCell';

export default function TableView() {
	const [machineState, setMachineState] = useStore(state => [state.machineState, state.setMachineState]);
	const debouncedMachineState = useDebounce(machineState, 500);
	const alphabet = [...debouncedMachineState.alphabet, TuringMachine.BLANK_SYMBOL];

	/**
	 * Add a new state to the machine
	 */
	const addState = () => {
		let newState = `q${machineState.states.length}`; // New state name

		// If the new state name is already in use, leave it empty
		if (machineState.states.includes(newState)) {
			newState = '';
		}
		setMachineState({
			states: [...machineState.states, newState],
		});
	};

	/**
	 * Rename a state
	 * @param name Current name of the state
	 * @param newName New name of the state
	 */
	//FIXME: use state index instead of name
	const renameState = (name: string, newName: string) => {
		// If the new name is already in use, don't change anything
		if (machineState.states.includes(newName)) return;

		// Update the state name in the instructions
		const newInstructions = machineState.instructions
			.map(instruction => {
				if (instruction.state === name) instruction.state = newName;
				if (instruction.newState === name) instruction.newState = newName;
				return instruction;
			});

		setMachineState({
			states: machineState.states.map(state => state === name ? newName : state),
			instructions: newInstructions,
		});
	};

	/**
	 * Delete a state
	 * @param stateName Name of the state to delete 
	 */
	const deleteState = (stateName: string) => {
		setMachineState({
			states: machineState.states.filter(state => state !== stateName),
		});
	};

	return (
		<>
			<div className='overflow-auto border rounded mb-4' style={{ maxHeight: '80vh' }}>
				<table className={`table m-0 text-center ${styles.InstructionsTable}`}>
					<thead>
						<tr>
							<th scope='row col'></th>
							{alphabet.map((symbol) => (
								<th scope='col' key={symbol}>{symbol}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{machineState.states.length <= 0 && (
							<tr>
								<td
									colSpan={alphabet.length + 1}
									className='text-center text-muted'>
									No states
								</td>
							</tr>
						)}
						{machineState.states.map((state, i) => (
							<tr key={i}>
								<th
									scope='row'
									className='p-0 align-middle'
								>
									<input
										type='text'
										className='form-control fw-bold text-center d-block h-100 border-0'
										value={state}
										onChange={e => renameState(state, e.target.value)}
										placeholder='Enter state'
									/>
									<button
										type='button'
										className={`btn btn-danger ${styles.DeleteRowButton}`}
										aria-label='Delete row'
										onClick={() => deleteState(state)}
									>
										<MdClose />
									</button>
								</th>
								{alphabet.map((symbol) => (
									<TableViewCell
										key={i + symbol}
										instructionState={state}
										instructionSymbol={symbol}
									/>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<div className='d-grid'>
				<button
					className='btn btn-secondary'
					onClick={addState}
				>
					Add state
				</button>
			</div>
		</>
	);
}