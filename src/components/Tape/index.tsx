'use client';

import { useStore } from '@/_store';
import clsx from 'clsx';
import { useEffect, useRef, useState } from 'react';
import { MdArrowBackIosNew, MdArrowForwardIos } from 'react-icons/md';
import { useWindowSize } from 'usehooks-ts';
import styles from './Tape.module.scss';

interface TapeProps {
	value: string;
}

export default function Tape(props: TapeProps) {
	const [visibleCells, setVisibleCells] = useState(1); // must be odd
	const [offsetLeft, setOffsetLeft] = useState(0);
	const settings = useStore((state) => state.tapeSettings);
	const tapeRef = useRef<HTMLDivElement>(null);
	const windowSize = useWindowSize();
	const middleCellIndex = Math.floor(visibleCells / 2);

	useEffect(() => {
		if (tapeRef.current) {
			const tapeWidth = (tapeRef.current as HTMLDivElement).clientWidth;
			const minCellWidth = parseInt(styles.cellSize);
			let visibleCells = Math.floor(tapeWidth / minCellWidth) - 2; // -2 for buttons
			if (visibleCells % 2 === 0) visibleCells--; // must be odd
			setVisibleCells(Math.max(visibleCells, 1)); // min 1 cell
		}
	}, [windowSize]);

	const handleTapeMove = (direction: 'left' | 'right') => {
		direction = settings.naturalScrolling // If natural scrolling is enabled
			? direction === 'left' ? 'right' : 'left' // Reverse direction
			: direction; // Otherwise use direction as is

		switch (direction) {
			case 'left':
				setOffsetLeft(offsetLeft + 1);
				break;
			case 'right':
				setOffsetLeft(offsetLeft - 1);
				break;
		}
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
					const value = i >= middleCellIndex + offsetLeft
						? props.value[i - middleCellIndex - offsetLeft]
						: '';

					return (
						<input
							key={crypto.randomUUID()}
							type='text'
							className={clsx(
								'form-control',
								'fs-4',
								styles.cell,
								i === middleCellIndex && styles.active,
							)}
							maxLength={1}
							defaultValue={value}
							readOnly
							placeholder={settings.showBlankSymbol ? settings.blankSymbol : ''}
							onClick={() => setOffsetLeft(
								offsetLeft + middleCellIndex - i // Set offset to make clicked cell middle
							)}
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