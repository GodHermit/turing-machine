'use client';

import { useStore } from '@/_store';
import clsx from 'clsx';

export default function MachineLogs() {
	const [machine, machineState] = useStore(state => [state.machine, state.machineState]);

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

	if (machineState.logs.length <= 0) {
		return;
	}

	return (
		<details open>
			<summary className='mb-2'>
				Machine Logs:
			</summary>
			<ul className='list-group'>
				{[...machineState.logs].reverse().map((log, i) => {
					if(log instanceof Error) {
						return (
							<li key={`error-${i}`} className='list-group-item text-danger'>
								<b>Error:</b> {log.message}
							</li>
						);
					}

					const isFinalState = log.instruction?.newState === machine.getOptions().finalState;
					return (
						<li key={log.step} className='list-group-item'>
							<b>Step {log.step + 1}:</b> 〈{log.symbol}, {log.state}〉&rarr;〈{log.instruction?.newSymbol}, {log.instruction?.newState}〉
							({clsx(
								`Write «${log.instruction?.newSymbol}», `,
								log.instruction?.move !== 'N' && `shift ${moveDirection(log.instruction?.move)}, `,
								isFinalState ? 'final state reached' : `go to state ${log.instruction?.newState}`
							)})
						</li>
					);
				})}
			</ul>
		</details>
	);
}