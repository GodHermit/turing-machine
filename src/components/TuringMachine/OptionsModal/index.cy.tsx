import { useStore } from '@/_store';
import '@/app/globals.scss';
import { defaultOptions } from '@/lib/turingMachine';
import OptionsModal from '.';

const testStates = new Map().set('!', '!').set(0, 'q0').set(1, 'q1'),
	testOptions = {
		initialStateIndex: 1,
		initialPosition: 1,
		maxSteps: 2000
	};

describe('<OptionsModal />', () => {
	beforeEach(() => {
		useStore.getState().setMachineState({
			states: testStates
		});

		useStore.getState().setOptions(defaultOptions);

		cy.viewport(500, 600);
		cy.mount(<OptionsModal show={true} />);

		cy
			.findByRole('dialog')
			.as('modal')
	});

	it('should have <Modal />', () => {
		cy.get('@modal').should('exist');
	});

	it('should have <Modal.Title />', () => {
		cy
			.get('@modal')
			.get('.modal-title')
			.should('have.text', 'Turing Machine Options');
	});

	it('should have <Modal.Body /> with form', () => {
		cy
			.get('@modal')
			.get('.modal-body')
			.should('exist');

		cy
			.get('@modal')
			.findByLabelText('Initial state:')
			.should('exist');

		cy
			.get('@modal')
			.findByLabelText('Initial head position:')
			.should('exist');

		cy
			.get('@modal')
			.findByLabelText('Maximum amount of steps:')
			.should('exist');
	});

	it('should have <Modal.Footer />', () => {
		cy
			.get('@modal')
			.get('.modal-footer')
			.should('exist');

		cy
			.get('@modal')
			.get('.modal-footer')
			.get('button')
			.as('footerButtons')
			.should('have.length', 2);

		cy
			.get('@footerButtons')
			.first()
			.should('have.text', 'Reset to default');

		cy
			.get('@footerButtons')
			.last()
			.should('have.text', 'Done');
	});

	describe('Click on «Rest to default» button', () => {
		beforeEach(() => {
			cy
				.get('@modal')
				.get('.modal-footer')
				.get('button')
				.first()
				.as('resetButton');

			cy
				.get('@modal')
				.findByLabelText('Initial state:')
				.select(testOptions.initialStateIndex.toString());

			cy
				.get('@modal')
				.findByLabelText('Initial head position:')
				.clear()
				.type(testOptions.initialPosition.toString());

			cy
				.get('@modal')
				.findByLabelText('Maximum amount of steps:')
				.clear()
				.type(testOptions.maxSteps.toString());
		});

		it('should reset the Turing machine options', () => {
			cy
				.get('@modal')
				.get('.modal-footer')
				.findByText('Reset to default')
				.click()
				.then(() => {
					expect(useStore.getState().machine.getOptions()).to.deep.equal(defaultOptions);
				});
		});
	});
});