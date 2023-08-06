import { useStore } from '@/_store';
import '@/app/globals.scss';
import TuringMachine from '@/lib/turingMachine';
import TableView from '../InstructionsInput/TableView';
import AlphabetInput from './index';

describe('<AlphabetInput />', () => {
	beforeEach(() => {
		cy.mount(<AlphabetInput />);
		cy.get('.form-control').clear();
	});

	it('renders', () => {
		cy.get('.form-label').should('have.text', 'Alphabet:');
	});

	it('updates value when alphabet is changed in store', () => {
		let alphabet = '01';
		cy.log('**Change alphabet in store**');
		useStore.getState().setMachineAlphabet(alphabet.split(''));
		cy.findByLabelText('Alphabet:').should('have.value', alphabet);
	});

	it('displays an error message when the duplicate characters are entered', () => {
		cy.get('.form-control').type('aa{enter}');
		cy.get('.invalid-feedback').should('contain.text', 'Alphabet cannot have duplicate characters');
	});

	it('displays an error message when the blank symbol is entered', () => {
		let blankSymbol = 'λ';
		TuringMachine.setBlankSymbol(blankSymbol);
		cy.get('.form-control').type(`${blankSymbol}{enter}`);
		cy.get('.invalid-feedback').should('contain.text', `Blank symbol (${blankSymbol}) already exists in alphabet.`);
	});

	context('With <TableView /> component', () => {
		beforeEach(() => {
			cy.mount(
				<>
					<AlphabetInput />
					<TableView />
				</>
			);
			cy
				.findByLabelText('Alphabet:')
				.first()
				.as('AlphabetInput')
				.clear();
		});

		it('displays the alphabet in the table', () => {
			let alphabet = '01';
			cy.get('@AlphabetInput').type(`${alphabet}{enter}`);

			cy.get('.table thead').should('contain.text', alphabet + TuringMachine.BLANK_SYMBOL);
		});

		it('changes the table when the alphabet is updated', () => {
			let alphabet = '01';
			cy.get('@AlphabetInput').type(`${alphabet}{enter}`);

			cy.get('.table thead').should('contain.text', alphabet + TuringMachine.BLANK_SYMBOL);

			let newAlphabet = '012';
			cy.get('@AlphabetInput').type(`2{enter}`);

			cy.get('.table thead').should('contain.text', newAlphabet + TuringMachine.BLANK_SYMBOL);
		});

		it('removes the instructions for the symbol when the symbol is removed from the alphabet', () => {
			let alphabet = '01';
			cy.get('@AlphabetInput').type(`${alphabet}{enter}`);
			cy.wait(500);

			cy.get('tr > :nth-child(2) > .form-control').type('0 R q0');
			cy.wait(500);

			cy.get('@AlphabetInput').type('{moveToStart}{del}');
			cy.wait(500);

			cy.get('.table thead').should('contain.text', '1' + TuringMachine.BLANK_SYMBOL);

			cy.get('tr > :nth-child(2) > .form-control').should('have.value', '');
		});

		it('does not change the table when the Alphabet is invalid', () => {
			let alphabet = '01';
			cy.get('@AlphabetInput').type(`${alphabet}{enter}`);
			cy.wait(500);

			cy.log('**Duplicate character**');
			cy.get('@AlphabetInput').type('0{enter}');
			cy.wait(500);

			cy.get('.table thead').should('contain.text', alphabet + TuringMachine.BLANK_SYMBOL);

			cy.log('**Blank symbol**');
			cy.get('@AlphabetInput').type('{backspace}λ');
			cy.wait(500);

			cy.get('.table thead').should('not.have.text', alphabet + TuringMachine.BLANK_SYMBOL + TuringMachine.BLANK_SYMBOL);
		});
	});
});