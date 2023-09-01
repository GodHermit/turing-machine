import { useStore } from '@/_store';
import '@/app/globals.scss';
import InitialStateSelect from './index';

const states = new Map().set('!', '!').set(0, 'q0');

describe('<InitialStateSelect />', () => {
	beforeEach(() => {
		useStore.getState().setRegisters({
			states
		});

		cy.mount(<InitialStateSelect />);
	});

	it('should have <label />', () => {
		cy.get('label').should('have.text', 'Initial state:');
	});

	it('should have <select />', () => {
		cy.get('select').should('exist');
	});

	it('should have placeholder <option />', () => {
		cy
			.get('option')
			.first()
			.should('be.disabled')
			.and('be.hidden')
			.and('have.text', 'Select an initial state...');
	});

	context('when there are no states', () => {
		beforeEach(() => {
			useStore
				.getState()
				.setRegisters({
					states: new Map().set('!', '!')
				});
		});

		it('should be invalid', () => {
			cy.get('select').should('have.class', 'is-invalid');
		});

		it('should have feedback', () => {
			cy
				.get('.invalid-feedback')
				.should('be.visible')
				.and('have.text', 'Select an initial state');
		});

		it('should have one visible <option /> with «No states» text', () => {
			cy
				.get('option')
				.last()
				.should('be.disabled')
				.and('not.be.hidden')
				.and('have.text', 'No states');
		});
	});

	describe('handleChange()', () => {
		beforeEach(() => {
			useStore.getState().setRegisters({
				states: states.set(1, 'q1')
			});
			cy.get('select').select('0');
		});

		it('should change value', () => {
			cy.get('select').select('1').should('have.value', '1');
		});

		it('should change value in the store', () => {
			cy
				.get('select')
				.select('1')
				.then(() => {
					expect(useStore.getState().machine.getOptions().initialStateIndex).to.equal(1);
				});
		});

		it('should fallback to current value if new value is invalid', () => {
			cy
				.get('option')
				.last()
				.then($option => {
					$option.attr('value', '2');
				});

			cy.get('select').select('2').should('have.value', '0');
		});
	});
});