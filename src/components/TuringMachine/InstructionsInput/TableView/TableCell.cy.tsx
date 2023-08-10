import { useStore } from '@/_store';
import { initialMachineState } from '@/_store/slices/machineStateSlice';
import '@/app/globals.scss';
import TuringMachine, { defaultOptions } from '@/lib/turingMachine';
import { Instruction } from '@/lib/turingMachine/types';
import TableViewCell from './TableCell';

const
	testAlphabet = ['0', '1'],
	testStates = ['q0', 'q1'],
	testMoveDirections: Instruction['move'][] = ['L', 'R', 'N'],
	testNewStates = ['q0', 'q1', defaultOptions.finalState],
	testNewSymbols = ['0', '1', TuringMachine.BLANK_SYMBOL];

const testInstruction: Instruction = {
	state: testStates[0],
	symbol: testAlphabet[0],
	move: testMoveDirections[0],
	newState: testNewStates[0],
	newSymbol: testNewSymbols[0],
};

/**
 * Mount the component with a table
 * @returns The component mount
 */
const mountWithTable = () => {
	return cy.mount(
		<table className='table table-bordered'>
			<tbody>
				<tr>
					<TableViewCell
						instructionState={testInstruction.state}
						instructionSymbol={testInstruction.symbol}
					/>
				</tr>
			</tbody>
		</table>
	);
};

beforeEach(() => {
	useStore.getState().setMachineState({
		...initialMachineState,
		alphabet: testAlphabet,
		states: testStates,
	}); // Reset the machine state

	mountWithTable();
});

describe('<TableViewCell />', () => {
	context('Without instructions', () => {
		it('should render a cell with placeholder', () => {
			cy
				.findByPlaceholderText(TuringMachine.NONE)
				.should('exist')
				.and('be.empty');
		});
	});

	context('With instructions', () => {
		beforeEach(() => {
			useStore.getState().setMachineState({ // Add the test instruction
				instructions: [testInstruction],
			});

			mountWithTable();
		});

		it('should render a cell with the instruction', () => {
			cy
				.findByDisplayValue(`${testInstruction.newSymbol} ${testInstruction.move} ${testInstruction.newState}`)
				.should('exist');
		});
	});
});

describe('<TableViewCell /> work with instructions in the store (add, update, delete) ', () => {
	it('should add instruction to the store', () => {
		const value = `${testInstruction.newSymbol} ${testInstruction.move} ${testInstruction.newState}`;
		cy
			.get('.form-control')
			.type(value);

		cy
			.findByDisplayValue(value)
			.then(() => {
				expect(useStore.getState().machineState.instructions).to.deep.equal([testInstruction]);
			});
	});

	it('should update instruction in the store', () => {
		cy.log('**Add instruction**');
		cy
			.get('.form-control')
			.type(`${testInstruction.newSymbol} ${testInstruction.move} ${testInstruction.newState}`)
			.then(() => {
				expect(useStore.getState().machineState.instructions).to.deep.equal([testInstruction]);
			});

		cy.log('**Update newState**');
		testNewStates.forEach((newState, i) => {
			cy
				.findByDisplayValue(`${testInstruction.newSymbol} ${testInstruction.move} ${testNewStates[i - 1] || testInstruction.newState}`)
				.type(`{backspace}{backspace}${newState}`)
				.then(() => {
					expect(useStore.getState().machineState.instructions).to.deep.equal([{
						...testInstruction,
						newState,
					}]);
				});
		});

		cy.log('**Update move direction**');
		const lastState = testNewStates[testNewStates.length - 1];
		cy
			.get('.form-control')
			.type(Array(lastState.length + 1).fill('{leftArrow}').join('')); // Move cursor to skip newState
		testMoveDirections.forEach((move, i) => {
			cy
				.findByDisplayValue(`${testInstruction.newSymbol} ${testMoveDirections[i - 1] || testInstruction.move} ${lastState}`)
				.type(`{backspace}${move}`)
				.then(() => {
					expect(useStore.getState().machineState.instructions).to.deep.equal([{
						...testInstruction,
						newState: lastState,
						move,
					}]);
				});
		});

		cy.log('**Update newSymbol**');
		const lastMove = testMoveDirections[testMoveDirections.length - 1];
		cy
			.get('.form-control')
			.type(Array(lastMove.length + 1).fill('{leftArrow}').join('')); // Move cursor to skip move direction
		testNewSymbols.forEach((newSymbol, i) => {
			cy
				.findByDisplayValue(`${testNewSymbols[i - 1] || testInstruction.newSymbol} ${lastMove} ${lastState}`)
				.type(`{backspace}${newSymbol}`)
				.then(() => {
					expect(useStore.getState().machineState.instructions).to.deep.equal([{
						...testInstruction,
						newState: lastState,
						move: lastMove,
						newSymbol,
					}]);
				});
		});
	});

	it('should delete instruction from the store', () => {
		cy.log('**Add instruction**');
		cy
			.get('.form-control')
			.type(`${testInstruction.newSymbol} ${testInstruction.move} ${testInstruction.newState}`)
			.then(() => {
				expect(useStore.getState().machineState.instructions).to.deep.equal([testInstruction]);
			});

		cy
			.findByDisplayValue(`${testInstruction.newSymbol} ${testInstruction.move} ${testInstruction.newState}`)
			.clear();

		cy
			.findByPlaceholderText(TuringMachine.NONE)
			.should('be.empty')
			.then(() => {
				expect(useStore.getState().machineState.instructions).to.be.empty;
			});
	});
});

describe('<TableViewCell /> with invalid value', () => {
	const invalidMoveDirection = 'HALT',
		invalidNewState = 'A',
		invalidNewSymbol = '∅';

	beforeEach(() => {
		cy
			.get('.form-control')
			.clear();
	});

	context('Type invalid newSymbol', () => {
		it('should be invalid', () => {
			cy
				.get('.form-control')
				.type(`${testInstruction.newSymbol} ${testInstruction.move} ${invalidNewState}`)
				.should('have.class', 'is-invalid');
		});
	});

	context('Type invalid move direction', () => {
		it('should be invalid', () => {
			cy
				.get('.form-control')
				.type(`${testInstruction.newSymbol} ${invalidMoveDirection} ${testInstruction.newState}`)
				.should('have.class', 'is-invalid');
		});
	});

	context('Type invalid newState', () => {
		it('should be invalid', () => {
			cy
				.get('.form-control')
				.type(`${invalidNewSymbol} ${testInstruction.move} ${testInstruction.newState}`)
				.should('have.class', 'is-invalid');
		});
	});

	it('should not add instruction to the store', () => {
		cy
			.get('.form-control')
			.clear()
			.type(`${testInstruction.newSymbol} ${testInstruction.move} ${invalidNewState}`)
			.should('have.class', 'is-invalid')
			.then(() => {
				expect(useStore.getState().machineState.instructions).to.have.length(0);
			});
	});
});

describe('<TableViewCell /> with shorted instructions', () => {
	context('Type only move direction', () => {
		it(`should add instruction to the store with {newSymbol: ${testInstruction.symbol}, newState: ${testInstruction.state}}`, () => {
			cy
				.get('.form-control')
				.type(`${testInstruction.move}`)
				.then(() => {
					expect(useStore.getState().machineState.instructions).to.deep.equal([{
						...testInstruction,
						move: testInstruction.move,
						newSymbol: testInstruction.symbol,
						newState: testInstruction.state,
					}]);
				});
		});
	});

	context('Type only finalState', () => {
		it(`should add instruction to the store with {move: ${TuringMachine.NONE}, newSymbol: ${testInstruction.symbol}}`, () => {
			cy
				.get('.form-control')
				.type(`${defaultOptions.finalState}`)
				.then(() => {
					expect(useStore.getState().machineState.instructions).to.deep.equal([{
						...testInstruction,
						move: TuringMachine.NONE,
						newSymbol: testInstruction.symbol,
						newState: defaultOptions.finalState,
					}]);
				});
		});
	});
});