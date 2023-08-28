import { useStore } from '@/_store';
import '@/app/globals.scss';
import InitialPositionInput from '.';

const headPosition = 1;

describe('<InitialPositionInput />', () => {
	beforeEach(() => {
		useStore.getState().setOptions({
			initialPosition: headPosition
		});

		cy.mount(<InitialPositionInput />);
	});

	it('should have <label />', () => {
		cy.get('label').should('have.text', 'Initial head position:');
	});

	it('should have <input />', () => {
		cy
			.get('input')
			.should('exist')
			.and('have.attr', 'type', 'number')
			.and('have.value', headPosition);
	});

	it('should have <div /> with form text', () => {
		cy
			.get('div.form-text')
			.should('be.visible')
			.and('have.text', 'Relative to the start of the tape value string.');
	});

	describe('when input is invalid', () => {

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
					.and('have.text', 'This field is required');
			});

			it('should not change options', () => {
				expect(useStore.getState().machine.getOptions().initialPosition).to.equal(headPosition);
			});
		});

		context('when input is not a number', () => {
			beforeEach(() => {
				cy
					.get('input')
					.then($input => {
						$input.attr('type', 'text');
					})
					.clear()
					.type('abc');
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
					.and('have.text', 'Invalid number');
			});

			it('should not change options', () => {
				expect(useStore.getState().machine.getOptions().initialPosition).to.equal(headPosition);
			});
		});

		context('when input has decimal part', () => {
			beforeEach(() => {
				cy
					.get('input')
					.clear()
					.type('1.5');
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
					.and('have.text', 'Initial head position must be an integer');
			});

			it('should not change options', () => {
				expect(useStore.getState().machine.getOptions().initialPosition).to.equal(headPosition);
			});
		});

		context('when input is less than -Number.MAX_SAFE_INTEGER', () => {
			beforeEach(() => {
				cy
					.get('input')
					.clear()
					.type(`${Number.MIN_SAFE_INTEGER - 1}`);
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
					.and('have.text', `Initial head position must be greater than or equal to ${Number.MIN_SAFE_INTEGER}`);
			});

			it('should change options while input is valid', () => {
				expect(useStore
					.getState()
					.machine
					.getOptions()
					.initialPosition
				).to.equal(
					Number(Number.MIN_SAFE_INTEGER.toString().slice(0, -1)) // Remove last digit
				);
			});
		});

		context('when input is greater than Number.MAX_SAFE_INTEGER', () => {
			beforeEach(() => {
				cy
					.get('input')
					.clear()
					.type(`${Number.MAX_SAFE_INTEGER + 1}`);
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
					.and('have.text', `Initial head position must be less than or equal to ${Number.MAX_SAFE_INTEGER}`);
			});

			it('should change options while input is valid', () => {
				expect(useStore
					.getState()
					.machine
					.getOptions()
					.initialPosition
				).to.equal(
					Number(Number.MAX_SAFE_INTEGER.toString().slice(0, -1)) // Remove last digit
				);
			});
		});
	});
});