'use client';

import { useStore } from '@/_store';
import TuringMachine from '@/lib/turingMachine';
import clsx from 'clsx';
import { MdClose } from 'react-icons/md';
import { useDebounce } from 'usehooks-ts';
import styles from '../InstructionInput.module.scss';
import TableViewCell from './TableCell';

export default function TableView() {
	const [
		machineState,
		addState,
		renameState,
		deleteState,
	] = useStore(state => [
		state.machineState,
		state.addState,
		state.renameState,
		state.deleteState,
	]);
	const debouncedMachineState = useDebounce(machineState, 500);
	const alphabet = [...debouncedMachineState.alphabet, TuringMachine.BLANK_SYMBOL];
	const states = [...machineState.states].filter(state => state[0] !== '!')

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
						{states.length <= 0 && (
							<tr>
								<td
									colSpan={alphabet.length + 1}
									className='text-center text-muted'>
									No states
								</td>
							</tr>
						)}
						{states.map((state, i) => (
							<tr key={i}>
								<th
									scope='row'
									className='p-0 align-middle'
								>
									<input
										type='text'
										className={clsx(
											'form-control fw-bold text-center d-block h-100 border-0',
											[...machineState.states.values()]
												.filter(s => s === state[1]).length > 1 && 'is-invalid',
										)}
										value={state[1]}
										onChange={e => renameState(state[0], e.target.value)}
										placeholder='Enter state'
									/>
									<button
										type='button'
										className={`btn btn-danger ${styles.DeleteRowButton}`}
										aria-label='Delete row'
										onClick={() => deleteState(state[0])}
									>
										<MdClose />
									</button>
								</th>
								{alphabet.map((symbol) => (
									<TableViewCell
										key={i + symbol}
										instructionStateIndex={state[0]}
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