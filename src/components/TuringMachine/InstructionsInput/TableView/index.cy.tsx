import { useStore } from '@/_store';
import { initialMachineState } from '@/_store/slices/machineStateSlice';
import '@/app/globals.scss';
import TuringMachine from '@/lib/turingMachine';
import { Instruction } from '@/lib/turingMachine/types';
import TableView from './index';

const testAlphabet = ['0', '1'];

describe('<TableView />', () => {
	beforeEach(() => {
		cy.mount(<TableView />);
		useStore.getState().setMachineState({
			...initialMachineState,
			alphabet: testAlphabet,
		});
	});

	describe('Table rendering', () => {
		it('Table header should contain all symbols from the alphabet', () => {
			const alphabet = [...useStore.getState().machineState.alphabet, TuringMachine.BLANK_SYMBOL];
			cy.get('thead').should('contain.text', alphabet.join(''));
		});

		it('Table header should updates when the alphabet in the store changes', () => {
			useStore.getState().setMachineState({
				...useStore.getState().machineState,
				alphabet: ['a', 'b', 'c'],
			});
			const alphabet = [...useStore.getState().machineState.alphabet, TuringMachine.BLANK_SYMBOL];
			cy.get('thead').should('contain.text', alphabet.join(''));
		});

		it('Table should contain all states from the store', () => {
			cy.get('tbody tr').should('have.length', useStore.getState().machineState.states.size - 1); // -1 for final state
			cy.get('tbody tr th input').each((th, i) => {
				expect(th).to.have.value([...useStore.getState().machineState.states.values()][i + 1]); // +1 for final state
			});
		});

		it('Table should updates when the states in the store changes', () => {
			useStore.getState().setMachineState({
				...useStore.getState().machineState,
				states: new Map().set(0, 'q0').set(1, 'q1').set(2, 'q2'),
			});
			cy.get('tbody tr').should('have.length', useStore.getState().machineState.states.size);
			cy.get('tbody tr th input').each((th, i) => {
				expect(th).to.have.value([...useStore.getState().machineState.states.values()][i]);
			});
		});

		it('Table should have the correct number of cells', () => {
			useStore.getState().setMachineState({
				...useStore.getState().machineState,
				states: new Map().set(0, 'q0').set(1, 'q1').set(2, 'q2'),
			});

			const alphabet = [...useStore.getState().machineState.alphabet, TuringMachine.BLANK_SYMBOL];
			const states = useStore.getState().machineState.states;
			cy
				.get('tbody tr td')
				.should('have.length', alphabet.length * states.size);
		});

		it('Table should display all instructions from the state', () => {
			useStore.getState().setMachineState({
				...useStore.getState().machineState,
				states: new Map().set(0, 'q0').set(1, 'q1').set(2, 'q2'),
			});
			useStore.getState().setInstructions([
				{
					stateIndex: 'q0',
					symbol: '0',
					move: 'R',
					newSymbol: '1',
					newStateIndex: 'q0',
				},
				{
					stateIndex: 'q0',
					symbol: '1',
					move: 'L',
					newSymbol: '0',
					newStateIndex: 'q0',
				},
			]);
			cy.wait(1000);

			const alphabet = [...useStore.getState().machineState.alphabet, TuringMachine.BLANK_SYMBOL];
			const states = useStore.getState().machineState.states;
			const instructions = useStore.getState().machine.getInstructions();
			cy
				.get('tbody tr td input')
				.each((input, i) => {
					const state = [...states.keys()][Math.floor(i / alphabet.length)];
					const symbol = alphabet[i % alphabet.length];
					const instruction = instructions.find(i => i.stateIndex === state && i.symbol === symbol);
					const value = instruction ? `${instruction.newSymbol} ${instruction.move} ${instruction.newStateIndex}` : '';
					expect(input).to.have.value(value);
				});
		});
	});

	describe('Overflow behavior', () => {
		beforeEach(() => {
			cy.viewport(500, 500);

			useStore.getState().setMachineState({
				...useStore.getState().machineState,
				alphabet: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd'],
				states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19']
					.map((s, i) => [i, s])
					.reduce((map, [k, v]) => map.set(k, v), new Map()),
			});

			cy.wait(1000); // Wait for the debounce
		});

		context('X-axis scrolling', () => {
			it('Column with states should be visible', () => {
				cy.get('table').parent().scrollTo('topRight');

				cy
					.get('tbody tr') // Get rows of the table body
					.first() // Get first row
					.find('th[scope="row"]') // Get first cell (state cell)
					.should('be.visible');
			});
		});

		context('Y-axis scrolling', () => {
			it('Row with alphabet symbols should be visible', () => {
				cy.get('table').parent().scrollTo('bottomLeft');

				cy
					.get('thead tr') // Get rows of the table header
					.first() // Get first row
					.find('th:nth-child(2)') // Get second cell (alphabet cell)
					.should('be.visible');
			});
		});
	});

	describe('addState()', () => {
		it('should add a new state to the store', () => {
			cy
				.get('tbody tr')
				.should('have.length', 1);

			cy
				.get('button')
				.contains('Add state')
				.click()
				.then(() => {
					expect([...useStore.getState().machineState.states.values()]).to.deep.eq(['!', 'q0', 'q1']);
				});

			cy
				.get('tbody tr')
				.should('have.length', 2);
		});

		it('should leave state name empty, if auto-generated name is already taken', () => {
			cy
				.findByDisplayValue('q0')
				.type('{backspace}1');

			cy
				.get('button')
				.contains('Add state')
				.click()
				.then(() => {
					expect([...useStore.getState().machineState.states.values()]).to.deep.eq(['!', 'q1', '']);
				});

			cy
				.findAllByDisplayValue('q1')
				.should('have.length', 1);
		});
	});

	describe('renameState()', () => {
		it('should rename a state in the store', () => {
			cy
				.findByDisplayValue('q0')
				.type('{backspace}1')
				.then(() => {
					expect([...useStore.getState().machineState.states.values()]).to.deep.eq(['!', 'q1']);
				});

			cy
				.get('tbody tr th input')
				.first()
				.should('have.value', 'q1');
		});

		it('should rename state in the instructions array', () => {
			const testInstructions: Instruction[] = [{
				stateIndex: 0, // This property should be changed
				symbol: '0',
				move: 'R',
				newSymbol: '1',
				newStateIndex: 1, // This property should not be changed
			},
			{
				stateIndex: 1, // This property should not be changed
				symbol: '1',
				move: 'L',
				newSymbol: '0',
				newStateIndex: 0, // This property should be changed
			}];
			useStore.getState().setMachineState({
				alphabet: testAlphabet,
				states: new Map().set(0, 'q0').set(1, 'q1')
			});
			useStore.getState().setInstructions(testInstructions);

			const newState = 'test';

			cy.wait(1000);
			cy
				.findByDisplayValue('q0')
				.type(`{selectAll}{backspace}${newState}`);

			cy
				.findAllByDisplayValue(`${testInstructions[1].newSymbol} ${testInstructions[1].move} ${newState}`)
				.should('have.length', 1);

		});

		it('should show error when state already taken', () => {
			useStore.getState().setMachineState({
				alphabet: testAlphabet,
				states: new Map().set(0, 'q0').set(1, 'q1'),
			});

			cy
				.findByDisplayValue('q0')
				.type('{backspace}1')
				.should('have.value', 'q1')
				.then(() => {
					expect([...useStore.getState().machineState.states.values()]).to.deep.eq(['q1', 'q1']);
				});

			cy
				.findAllByDisplayValue('q1')
				.first()
				.should('have.class', 'is-invalid');
		});
	});

	describe('deleteState()', () => {
		beforeEach(() => {
			useStore.getState().setMachineState({
				alphabet: testAlphabet,
				states: new Map().set(0, 'q0').set(1, 'q1').set(2, 'q2'),
			});
		});

		it('should delete a row from the table', () => {
			cy
				.get('tbody tr')
				.should('have.length', 3);

			cy
				.findByDisplayValue('q2')
				.parent()
				.find('button')
				.invoke('show')
				.should('be.visible')
				.click()
				.then(() => {
					expect([...useStore.getState().machineState.states.values()]).to.deep.eq(['q0', 'q1']);
				});

			cy
				.get('tbody tr')
				.should('have.length', 2);
		});

		it('should delete a state from the store', () => {
			useStore.getState().setInstructions([
				{ // This instruction should be deleted
					stateIndex: 0,
					symbol: '0',
					move: 'R',
					newSymbol: '1',
					newStateIndex: 2,
				}, { // This instruction should be deleted
					stateIndex: 2,
					symbol: '0',
					move: 'R',
					newSymbol: '1',
					newStateIndex: 1,
				}, { // This instruction should not be deleted
					stateIndex: 1,
					symbol: '0',
					move: 'R',
					newSymbol: '1',
					newStateIndex: 1,
				}
			]);

			cy.wait(1000);

			cy
				.findByDisplayValue('q2')
				.parent()
				.find('button')
				.invoke('show')
				.should('be.visible')
				.click()
				.then(() => {
					expect(useStore.getState().machine.getInstructions()).to.deep.eq([{
						stateIndex: 1,
						symbol: '0',
						move: 'R',
						newSymbol: '1',
						newStateIndex: 1,
					}]);
				});
		});
	});
});