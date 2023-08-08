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
			cy.get('tbody tr').should('have.length', useStore.getState().machineState.states.length);
			cy.get('tbody tr th input').each((th, i) => {
				expect(th).to.have.value(useStore.getState().machineState.states[i]);
			});
		});

		it('Table should updates when the states in the store changes', () => {
			useStore.getState().setMachineState({
				...useStore.getState().machineState,
				states: ['q0', 'q1', 'q2'],
			});
			cy.get('tbody tr').should('have.length', useStore.getState().machineState.states.length);
			cy.get('tbody tr th input').each((th, i) => {
				expect(th).to.have.value(useStore.getState().machineState.states[i]);
			});
		});

		it('Table should have the correct number of cells', () => {
			const alphabet = [...useStore.getState().machineState.alphabet, TuringMachine.BLANK_SYMBOL];
			const states = useStore.getState().machineState.states;
			cy
				.get('tbody tr td')
				.should('have.length', alphabet.length * states.length);
		});

		it('Table should display all instructions from the state', () => {
			useStore.getState().setMachineState({
				instructions: [
					{
						state: 'q0',
						symbol: '0',
						move: 'R',
						newSymbol: '1',
						newState: 'q0',
					},
					{
						state: 'q0',
						symbol: '1',
						move: 'L',
						newSymbol: '0',
						newState: 'q0',
					},
				],
			});
			cy.wait(1000);

			const alphabet = [...useStore.getState().machineState.alphabet, TuringMachine.BLANK_SYMBOL];
			const states = useStore.getState().machineState.states;
			const instructions = useStore.getState().machineState.instructions;
			cy
				.get('tbody tr td input')
				.each((input, i) => {
					const state = states[Math.floor(i / alphabet.length)];
					const symbol = alphabet[i % alphabet.length];
					const instruction = instructions.find(i => i.state === state && i.symbol === symbol);
					const value = instruction ? `${instruction.newSymbol} ${instruction.move} ${instruction.newState}` : '';
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
				states: ['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q10', 'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19'],
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
					expect(useStore.getState().machineState.states).to.deep.eq(['q0', 'q1']);
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
					expect(useStore.getState().machineState.states).to.deep.eq(['q1', '']);
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
					expect(useStore.getState().machineState.states).to.deep.eq(['q1']);
				});

			cy
				.get('tbody tr th input')
				.first()
				.should('have.value', 'q1');
		});

		it('should rename state in the instructions array', () => {
			const testInstructions: Instruction[] = [{
				state: 'q0', // This property should be changed
				symbol: '0',
				move: 'R',
				newSymbol: '1',
				newState: 'q1', // This property should not be changed
			},
			{
				state: 'q1', // This property should not be changed
				symbol: '1',
				move: 'L',
				newSymbol: '0',
				newState: 'q0', // This property should be changed
			}];
			useStore.getState().setMachineState({
				alphabet: testAlphabet,
				states: ['q0', 'q1'],
				instructions: testInstructions
			});

			const newState = 'test';

			cy
				.findByDisplayValue('q0')
				.type(`{selectAll}{backspace}${newState}`)
				.then(() => {
					expect(useStore.getState().machineState.instructions).to.deep.eq([
						{
							state: newState,
							symbol: '0',
							move: 'R',
							newSymbol: '1',
							newState: 'q1',
						},
						{
							state: 'q1',
							symbol: '1',
							move: 'L',
							newSymbol: '0',
							newState: newState,
						},
					]);
				});

			cy
				.findAllByDisplayValue(`${testInstructions[1].newSymbol} ${testInstructions[1].move} ${newState}`)
				.should('have.length', 1);

		});

		it('should prevent from typing already taken state', () => {
			useStore.getState().setMachineState({
				alphabet: testAlphabet,
				states: ['q0', 'q1'],
			});

			cy
				.findByDisplayValue('q0')
				.type('{backspace}1')
				.should('have.value', 'q') // Prevent from typing "1" because q1 is already taken
				.then(() => {
					expect(useStore.getState().machineState.states).to.deep.eq(['q', 'q1']);
				});

			cy
				.findAllByDisplayValue('q')
				.type('N1{leftArrow}{backspace}')
				.should('have.value', 'qN1');
		});
	});

	describe('deleteState()', () => {
		beforeEach(() => {
			useStore.getState().setMachineState({
				alphabet: testAlphabet,
				states: ['q0', 'q1', 'q2'],
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
					expect(useStore.getState().machineState.states).to.deep.eq(['q0', 'q1']);
				});

			cy
				.get('tbody tr')
				.should('have.length', 2);
		});

		it('should delete a state from the store', () => {
			useStore.getState().setMachineState({
				instructions: [{ // This instruction should be deleted
					state: 'q0',
					symbol: '0',
					move: 'R',
					newSymbol: '1',
					newState: 'q2',
				}, { // This instruction should be deleted
					state: 'q2',
					symbol: '0',
					move: 'R',
					newSymbol: '1',
					newState: 'q1',
				}, { // This instruction should not be deleted
					state: 'q1',
					symbol: '0',
					move: 'R',
					newSymbol: '1',
					newState: 'q1',
				}]
			});

			cy.wait(1000);

			cy
				.findByDisplayValue('q2')
				.parent()
				.find('button')
				.invoke('show')
				.should('be.visible')
				.click()
				.then(() => {
					expect(useStore.getState().machineState.instructions).to.deep.eq([{
						state: 'q1',
						symbol: '0',
						move: 'R',
						newSymbol: '1',
						newState: 'q1',
					}]);
				});
		});
	});
});