import '@/app/globals.scss';
import React from 'react';
import Input from './index';

describe('<Input />', () => {
	it('renders', () => {
		cy.mount(<Input />);
		cy.get('.input-group-text').should('have.text', '0');
	});

	it('counts characters', () => {
		cy.mount(<Input />);
		cy.get('.input-group .form-control').type('Hello World');
		cy.get('.input-group-text').should('have.text', '11');
	});

	it('can be controlled', () => {
		let initialValue = 'Hello World';
		let newValue = initialValue + '!!!';
		const ControlledInput = () => {
			const [value, setValue] = React.useState(initialValue);

			const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
				setValue(e.target.value);
				expect(newValue).to.contain(e.target.value);
			};

			return (
				<Input
					value={value}
					onChange={handleChange}
				/>
			);
		};
		cy.mount(<ControlledInput />);

		cy.get('.input-group-text').should('have.text', initialValue.length.toString());
		cy.get('.input-group .form-control').as('input').should('have.value', initialValue);

		cy.get('@input').type('!!!');
		cy.get('.input-group-text').should('have.text', newValue.length.toString());
		cy.get('@input').should('have.value', newValue);
	});

	it('shows label', () => {
		let label = Math.random().toString();
		cy.mount(<Input label={label} />);
		cy.get('.form-label').should('have.text', label);
	});

	it('shows error', () => {
		let errorFeedback = Math.random().toString();
		cy.mount(<Input isInvalid invalidFeedback={errorFeedback} />);

		cy.get('.input-group .form-control').should('have.class', 'is-invalid');
		cy.get('.invalid-feedback').should('have.text', errorFeedback);
	});
});