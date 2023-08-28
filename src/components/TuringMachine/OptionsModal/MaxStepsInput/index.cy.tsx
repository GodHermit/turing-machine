import { useStore } from '@/_store';
import '@/app/globals.scss';
import { defaultOptions } from '@/lib/turingMachine';
import MaxStepsInput from '.';

describe('<MaxStepsInput />', () => {
	beforeEach(() => {
		useStore.getState().setOptions({
			...defaultOptions
		});
		cy.mount(<MaxStepsInput />);
	});

	it('should have <label />', () => {
		cy.get('label').should('have.text', 'Maximum amount of steps:');
	});

	it('should have <input />', () => {
		cy
			.get('input')
			.should('exist')
			.and('have.attr', 'type', 'number')
			.and('have.attr', 'min', 1)
			.and('have.attr', 'max', Number.MAX_SAFE_INTEGER.toString())
			.and('have.attr', 'placeholder', '1000');
	});

	it('should have note about exception', () => {
		cy
			.get('.form-text')
			.should('be.visible')
			.and('have.text', 'Note: «Make step» button has no limit on the amount of steps.');
	});

	it('should change options while input is valid', () => {
		const validNumber = 100;

		cy
			.get('input')
			.clear()
			.type(`${validNumber}`)
			.then(() => {
				expect(useStore.getState().machine.getOptions().maxSteps).to.equal(validNumber);
			});
	});

	it('should syncronize input with options', () => {
		const validNumber = 100;
		cy
			.wrap(useStore.getState())
			.as('getState')
			.invoke('setOptions', { maxSteps: validNumber });

		cy
			.get('input')
			.should('have.value', validNumber.toString());

		const newValidNumber = 200;
		cy
			.get('@getState')
			.invoke('setOptions', { maxSteps: newValidNumber });

		cy
			.get('input')
			.should('have.value', newValidNumber.toString());
	});

	context('when input is invalid', () => {
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
				expect(useStore.getState().machine.getOptions().maxSteps).to.equal(defaultOptions.maxSteps);
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
				expect(useStore.getState().machine.getOptions().maxSteps).to.equal(defaultOptions.maxSteps);
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
					.and('have.text', 'Maximum amount of steps must be an integer');
			});

			it('should not change options', () => {
				expect(useStore.getState().machine.getOptions().maxSteps).to.equal(defaultOptions.maxSteps);
			});
		});

		context('when input is negative', () => {
			const negativeNumber = -1;

			beforeEach(() => {
				cy
					.get('input')
					.clear()
					.type(`${negativeNumber}`);
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
					.and('have.text', `Maximum amount of steps must be a positive number`);
			});

			it('should not change options', () => {
				expect(useStore.getState().machine.getOptions().maxSteps).to.equal(defaultOptions.maxSteps);
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
					.and('have.text', `Maximum amount of steps must be less than or equal to ${Number.MAX_SAFE_INTEGER}`);
			});

			it('should change options while input is valid', () => {
				expect(useStore
					.getState()
					.machine
					.getOptions()
					.maxSteps
				).to.equal(
					Number(Number.MAX_SAFE_INTEGER.toString().slice(0, -1)) // Remove last digit
				);
			});
		});
	});
});