'use client';

import { useStore } from '@/_store';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import { useWindowSize } from 'usehooks-ts';
import styles from './Tape.module.scss';

export default function Tape() {
	const [visibleCells, setVisibleCells] = useState(1); // must be odd
	const [machineState, setMachineState] = useStore(state => [state.machineState, state.setMachineState]);
	const settings = useStore((state) => state.tapeSettings);
	const tapeRef = useRef<HTMLDivElement>(null);
	const windowSize = useWindowSize();
	const middleCellIndex = Math.floor(visibleCells / 2);

	/**
	 * Recalculate the number of visible cells when the window size changes.
	 */
	useEffect(() => {
		if (tapeRef.current) {
			const tapeWidth = (tapeRef.current as HTMLDivElement).clientWidth; // Get tape width
			const minCellWidth = parseInt(styles.cellSize); // Get cell min width

			// Calculate number of visible cells (minus 2 for the buttons)
			let visibleCells = Math.floor(tapeWidth / minCellWidth) - 2;

			// Make sure the number of visible cells odd
			if (visibleCells % 2 === 0) visibleCells--;

			// Set the number of visible cells (minimum 1)
			setVisibleCells(Math.max(visibleCells, 1));
		}
	}, [windowSize]);

	/**
	 * Handles tape movement.
	 */
	const handleTapeMove = (direction: 'left' | 'right') => {
		let step = 0;
		switch (direction) {
			case 'left':
				step = -1;
				break;
			case 'right':
				step = 1;
				break;
		}

		// Reverse step if natural scrolling is enabled
		const naturalDirection = settings.naturalScrolling ? -1 : 1;

		const newHeadPos = machineState.currentHeadPos + step * naturalDirection;

		setMachineState({
			currentHeadPos: newHeadPos,
			options: {
				...machineState.options,
				initialPosition: newHeadPos,
			}
		});
	}

	return (
		<>
			<div
				className={clsx(
					'input-group',
					'pt-4',
					'pb-4',
					styles.tape
				)}
				ref={tapeRef}
			>
				<button
					className={clsx(
						'btn',
						'btn-secondary',
						styles.tapeButton,
					)}
					onClick={() => handleTapeMove('left')}
				>
					<MdArrowBackIosNew />
				</button>
				{[...Array(visibleCells)].map((_, i) => {
					// Get cell value (or empty string if not defined)
					const value = machineState.currentTapeValue[
						i - middleCellIndex + machineState.currentHeadPos
					] || '';

					// Calculate cell id
					const cellId = i - middleCellIndex + machineState.currentHeadPos;

					return (
						<input
							key={cellId}
							type='text'
							className={clsx(
								'form-control',
								'fs-4',
								styles.cell,
								i === middleCellIndex && styles.active,
							)}
							maxLength={1}
							value={value}
							readOnly
							placeholder={settings.showBlankSymbol ? settings.blankSymbol : ''}
							onClick={() => setMachineState({
								currentHeadPos: cellId,
								options: {
									...machineState.options,
									initialPosition: cellId,
								}
							})}
						/>
					)
				})}
				<button
					className={clsx(
						'btn',
						'btn-secondary',
						styles.tapeButton,
					)}
					onClick={() => handleTapeMove('right')}
				>
					<MdArrowForwardIos />
				</button>
			</div>
		</>
	);
}