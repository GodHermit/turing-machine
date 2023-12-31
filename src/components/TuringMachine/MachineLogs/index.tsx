'use client';

import { useStore } from '@/_store';
import clsx from 'clsx';

export default function MachineLogs() {
	const [machine, registers] = useStore(state => [state.machine, state.registers]);

	const moveDirection = (move?: string) => {
		switch (move) {
			case 'L':
				return 'left';
			case 'R':
				return 'right';
			case 'N':
				return 'no';
		}
	};

	if (registers.logs.length <= 0) {
		return;
	}

	return (
		<details open>
			<summary className='mb-2'>
				Machine Logs:
			</summary>
			<ul className='list-group'>
				{[...registers.logs].reverse().map((log, i) => {
					if (log instanceof Error) {
						return (
							<li key={`error-${i}`} className='list-group-item text-danger'>
								<b>Error:</b> {log.message}
							</li>
						);
					}

					const isFinalState = log.instruction?.newStateIndex === machine.getOptions().finalStateIndex;
					return (
						<li key={log.step} className='list-group-item'>
							<b>Step {log.step + 1}:</b> 〈{log.symbol}, {log.stateName}〉&rarr;〈{log.instruction?.newSymbol}, {log.instruction?.newStateName}〉
							({clsx(
								`Write «${log.instruction?.newSymbol}», `,
								log.instruction?.move !== 'N' && `shift ${moveDirection(log.instruction?.move)}, `,
								isFinalState ? 'final state reached' : `go to state ${log.instruction?.newStateName}`
							)})
						</li>
					);
				})}
			</ul>
		</details>
	);
}