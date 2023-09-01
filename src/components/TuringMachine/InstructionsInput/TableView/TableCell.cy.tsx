import { useStore } from '@/_store';
import { initialRegisters } from '@/_store/slices/registersSlice';
import '@/app/globals.scss';
import TuringMachine, { defaultOptions } from '@/lib/turingMachine';
import { Instruction, StateMap } from '@/lib/turingMachine/types';
import TableViewCell from './TableCell';

const
	testAlphabet = ['0', '1'],
	testStates: StateMap = new Map().set(defaultOptions.finalStateIndex, '!').set(0, 'q0').set(1, 'q1'),
	testMoveDirections: Instruction['move'][] = ['L', 'R', 'N'],
	testNewStates = testStates,
	testNewSymbols = ['0', '1', TuringMachine.BLANK_SYMBOL];

const testInstruction: Instruction = {
	stateIndex: 0,
	symbol: testAlphabet[0],
	move: testMoveDirections[0],
	newStateIndex: 0,
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
						instructionStateIndex={testInstruction.stateIndex}
						instructionSymbol={testInstruction.symbol}
					/>
				</tr>
			</tbody>
		</table>
	);
};

beforeEach(() => {
	useStore.getState().setRegisters({
		...initialRegisters,
		alphabet: testAlphabet,
		states: testStates,
	}); // Reset the machine state

	useStore.setState({
		machine: new TuringMachine(),
	}); // Reset the machine

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
			useStore.getState().setInstructions( // Add the test instruction
				[testInstruction]
			);

			mountWithTable();
		});

		it('should render a cell with the instruction', () => {
			cy
				.findByDisplayValue(`${testInstruction.newSymbol} ${testInstruction.move} ${testStates.get(testInstruction.newStateIndex)}`)
				.should('exist');
		});
	});
});

describe('<TableViewCell /> work with instructions in the store (add, update, delete) ', () => {
	it('should add instruction to the store', () => {
		const value = `${testInstruction.newSymbol} ${testInstruction.move} ${testStates.get(testInstruction.newStateIndex)}`;
		cy
			.get('.form-control')
			.type(value);

		cy
			.findByDisplayValue(value)
			.then(() => {
				expect(useStore.getState().machine.getInstructions()).to.deep.equal([testInstruction]);
			});
	});

	describe('update instruction in the store', () => {
		const value = `${testInstruction.newSymbol} ${testInstruction.move} ${testStates.get(testInstruction.newStateIndex)}`;
		beforeEach(() => {
			cy.log('**Add instruction**');
			cy
				.get('.form-control')
				.type(value)
				.then(() => {
					expect(useStore.getState().machine.getInstructions()).to.deep.equal([testInstruction]);
				});
		});

		it('should update `newStateIndex` in the store', () => {
			cy
				.findByDisplayValue(value)
				.type(`{backspace}{backspace}${testStates.get(1)}`)
				.then(() => {
					expect(useStore.getState().machine.getInstructions()).to.deep.equal([{
						...testInstruction,
						newStateIndex: 1,
					}]);
				});
		});

		it('should update `move` in the store', () => {
			cy
				.get('.form-control')
				.type(
					Array((testStates.get(testInstruction.newStateIndex) || '').length + 1)
						.fill('{leftArrow}').join('')
				); // Move cursor to skip new state

			testMoveDirections.forEach((move, i) => {
				cy
					.findByDisplayValue(`${testInstruction.newSymbol} ${testMoveDirections[i - 1] || testInstruction.move} ${testStates.get(testInstruction.newStateIndex)}`)
					.type(`{backspace}${move}`)
					.then(() => {
						expect(useStore.getState().machine.getInstructions()).to.deep.equal([{
							...testInstruction,
							move,
						}]);
					});
			});
		});

		it('should update `newSymbol` in the store', () => {
			cy
				.get('.form-control')
				.type(
					Array((testStates.get(testInstruction.newStateIndex) || '').length + 1)
						.fill('{leftArrow}').join('')
				) // Move cursor to skip new state
				.type(
					Array(testInstruction.move.length + 1)
						.fill('{leftArrow}')
						.join('')
				); // Move cursor to skip move direction

			const newSymbol = testNewSymbols[1];
			cy
				.findByDisplayValue(value)
				.type(`{backspace}${newSymbol}`)
				.then(() => {
					expect(useStore.getState().machine.getInstructions()).to.deep.equal([{
						...testInstruction,
						newSymbol,
					}]);
				});
		});
	});

	it('should delete instruction from the store', () => {
		cy.log('**Add instruction**');
		const value = `${testInstruction.newSymbol} ${testInstruction.move} ${testStates.get(testInstruction.newStateIndex)}`;
		cy
			.get('.form-control')
			.type(value)
			.then(() => {
				expect(useStore.getState().machine.getInstructions()).to.deep.equal([testInstruction]);
			});

		cy
			.findByDisplayValue(value)
			.clear();

		cy
			.findByPlaceholderText(TuringMachine.NONE)
			.should('be.empty')
			.then(() => {
				expect(useStore.getState().machine.getInstructions()).to.be.empty;
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
				.type(`${testInstruction.newSymbol} ${invalidMoveDirection} ${testInstruction.newStateIndex}`)
				.should('have.class', 'is-invalid');
		});
	});

	context('Type invalid newState', () => {
		it('should be invalid', () => {
			cy
				.get('.form-control')
				.type(`${invalidNewSymbol} ${testInstruction.move} ${testInstruction.newStateIndex}`)
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
				expect(useStore.getState().machine.getInstructions()).to.have.length(0);
			});
	});
});

describe('<TableViewCell /> with shorted instructions', () => {
	context('Type only move direction', () => {
		it(`should add instruction to the store with {newSymbol: ${testInstruction.symbol}, newState: ${testInstruction.stateIndex}}`, () => {
			cy
				.get('.form-control')
				.type(`${testInstruction.move}`)
				.then(() => {
					expect(useStore.getState().machine.getInstructions()).to.deep.equal([{
						...testInstruction,
						move: testInstruction.move,
						newSymbol: testInstruction.symbol,
						newStateIndex: testInstruction.stateIndex,
					}]);
				});
		});
	});

	context('Type only finalState', () => {
		it(`should add instruction to the store with {move: ${TuringMachine.NONE}, newSymbol: ${testInstruction.symbol}}`, () => {
			cy
				.get('.form-control')
				.type(`${defaultOptions.finalStateIndex}`)
				.then(() => {
					expect(useStore.getState().machine.getInstructions()).to.deep.equal([{
						...testInstruction,
						move: TuringMachine.NONE,
						newSymbol: testInstruction.symbol,
						newStateIndex: defaultOptions.finalStateIndex,
					}]);
				});
		});
	});
});