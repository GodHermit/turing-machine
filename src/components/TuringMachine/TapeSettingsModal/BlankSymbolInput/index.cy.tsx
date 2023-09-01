import { useStore } from '@/_store';
import '@/app/globals.scss';
import TuringMachine from '@/lib/turingMachine';
import { Instruction } from '@/lib/turingMachine/types';
import BlankSymbolInput from '.';

const defaultBlankSymbol = 'λ';
const testAlphabet = ['a', 'b', 'c'];

describe('<BlankSymbolInput />', () => {
	beforeEach(() => {
		useStore.getState().setMachineState({
			alphabet: testAlphabet
		});
		useStore.getState().setTapeSettings({
			blankSymbol: defaultBlankSymbol
		});
		TuringMachine.setBlankSymbol(defaultBlankSymbol);
		cy.mount(<BlankSymbolInput />);
	});

	it('should have a label', () => {
		cy
			.get('label')
			.should('have.text', 'Blank symbol:');
	});

	it('should have an input', () => {
		cy
			.get('input')
			.should('exist')
			.and('have.attr', 'type', 'text')
			.and('have.attr', 'maxlength', '1');
	});

	it('should syncronize input with `tapeSettings`', () => {
		const newBlankSymbol = '_';
		cy
			.wrap(useStore.getState())
			.as('getState')
			.invoke('setTapeSettings', { blankSymbol: newBlankSymbol });

		cy
			.get('input')
			.should('have.value', newBlankSymbol);

		const anotherNewBlankSymbol = '+';
		cy
			.get('@getState')
			.invoke('setTapeSettings', { blankSymbol: anotherNewBlankSymbol });

		cy
			.get('input')
			.should('have.value', anotherNewBlankSymbol);
	});

	describe('Invalid input', () => {

		context('when input is empty', () => {
			beforeEach(() => {
				cy
					.get('input')
					.clear();
			});

			it('should be invalid', () => {
				cy
					.get('input')
					.should('have.class', 'is-invalid');
			});

			it('should have feedback', () => {
				cy
					.get('.invalid-feedback')
					.should('be.visible')
					.and('have.text', 'Blank symbol is a required field');
			});

			it('should not change options', () => {
				expect(useStore.getState().tapeSettings.blankSymbol).to.equal(defaultBlankSymbol);
			});
		});

		context('when new blank symbol already exists in alphabet', () => {
			beforeEach(() => {
				cy
					.get('input')
					.clear()
					.type('a');
			});

			it('should be invalid', () => {
				cy
					.get('input')
					.should('have.class', 'is-invalid');
			});

			it('should have feedback', () => {

				cy
					.get('.invalid-feedback')
					.should('be.visible')
					.and('have.text', 'This symbol is already in the alphabet');
			});

			it('should not change options', () => {
				expect(useStore.getState().tapeSettings.blankSymbol).to.equal(defaultBlankSymbol);
			});
		});
	});

	describe.only('Valid input', () => {
		const validBlankSymbol = '_';
		const testInput = `ab${defaultBlankSymbol}c`;
		const expectedInput = `ab${validBlankSymbol}c`;
		const testInstructions: Instruction[] = [{
			stateIndex: 0,
			symbol: defaultBlankSymbol,
			move: 'R',
			newSymbol: defaultBlankSymbol,
			newStateIndex: 0
		}];
		const expectedInstructions: Instruction[] = [{
			stateIndex: 0,
			symbol: validBlankSymbol,
			move: 'R',
			newSymbol: validBlankSymbol,
			newStateIndex: 0
		}];

		it('should change `blankSymbol` in the store', () => {
			cy
				.get('input')
				.clear()
				.type(validBlankSymbol)
				.then(() => {
					expect(useStore.getState().tapeSettings.blankSymbol).to.equal(validBlankSymbol);
				});
		});

		it('should change `TuringMachine.BLANK_SYMBOL`', () => {
			cy
				.get('input')
				.clear()
				.type(validBlankSymbol)
				.then(() => {
					expect(TuringMachine.BLANK_SYMBOL).to.equal(validBlankSymbol);
				});
		});

		it('should replace old blank symbol with new one', () => {
			useStore.setState({
				machine: new TuringMachine(testInput, testInstructions)
			});

			cy
				.get('input')
				.clear()
				.type(validBlankSymbol)
				.then(() => {
					expect(useStore.getState().machine.getInput()).to.deep.equal(expectedInput);
					expect(useStore.getState().machine.getInstructions()).to.deep.equal(expectedInstructions);
				});

			cy
				.spy(useStore, 'setState')
				.as('setState');

			cy
				.get('@setState')
				.should('be.calledWithMatch', {
					machine: new TuringMachine(expectedInput, expectedInstructions)
				})
				.and('be.calledOnce')
				.then(() => {
					expect(
						useStore
							.getState()
							.machine
							.getCurrentCondition()
							.tapeValue
					).to.deep.equal(expectedInput);
				});
		});
	});
});