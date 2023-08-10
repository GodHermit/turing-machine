import { useStore } from '@/_store';
import { initialMachineState } from '@/_store/slices/machineStateSlice';
import '@/app/globals.scss';
import AlphabetInput from '../AlphabetInput';
import TapeInput from './index';

describe('<TapeInput />', () => {
	beforeEach(() => {
		cy.mount(<TapeInput />);
		cy
			.findByLabelText('Input:')
			.as('tapeInput')
			.clear();
		useStore.getState().setMachineState(initialMachineState);
	});

	it('renders', () => {
		cy.get('@tapeInput').should('exist');

		cy
			.findByText('Write to tape')
			.should('be.disabled');
	});

	it('accepts input', () => {
		cy
			.get('@tapeInput')
			.type('1010');

		cy
			.findByText('Write to tape')
			.should('be.enabled');
	});


	it('writes to tape and clears tape', () => {
		cy.spy(useStore.getState(), 'setMachineState').as('setMachineState');
		const value = '1010';

		cy
			.get('@tapeInput')
			.type(value);

		cy
			.findByText('Write to tape')
			.as('writeToTapeButton')
			.click()
			.should('be.disabled');

		const options = useStore.getState().machineState.options;
		cy
			.get('@setMachineState')
			.should('be.calledWith', {
				input: value,
				currentTapeValue: value,
				currentHeadPos: 0,
				options: {
					...options,
					initialPosition: 0,
				}
			})
			.then(() => {
				expect(useStore.getState().machineState.input).to.equal(value);
				expect(useStore.getState().machineState.currentTapeValue).to.equal(value);
				expect(useStore.getState().machineState.currentHeadPos).to.equal(0);
				expect(useStore.getState().machineState.options.initialPosition).to.equal(0);
			});

		cy
			.get('@tapeInput')
			.clear();

		cy
			.get('@writeToTapeButton')
			.should('not.exist');

		cy
			.findByText('Clear tape')
			.should('be.enabled')
			.click();

		cy
			.get('@setMachineState')
			.should('be.calledWith', {
				input: '',
				currentTapeValue: '',
				currentHeadPos: 0,
				options: {
					...options,
					initialPosition: 0,
				}
			})
			.then(() => {
				expect(useStore.getState().machineState.input).to.equal('');
				expect(useStore.getState().machineState.currentTapeValue).to.equal('');
				expect(useStore.getState().machineState.currentHeadPos).to.equal(0);
				expect(useStore.getState().machineState.options.initialPosition).to.equal(0);
			});
	});

	context('With <AlphabetInput /> component', () => {
		beforeEach(() => {
			cy.mount(
				<>
					<AlphabetInput />
					<TapeInput />
				</>
			);
		});

		it('generates alphabet from input', () => {
			cy
				.get('@tapeInput')
				.type('1010');

			cy
				.findByText('Write to tape')
				.should('be.enabled')
				.click();

			cy
				.findByLabelText('Alphabet:')
				.should('have.value', '01');
		});

		it('disables button when input is invalid', () => {
			cy
				.findByLabelText('Alphabet:')
				.as('alphabetInput')
				.type('01');

			cy
				.get('@tapeInput')
				.clear()
				.type('01');

			cy
				.findByText('Write to tape')
				.as('writeToTapeButton')
				.should('be.enabled');

			cy
				.get('@tapeInput')
				.type('2');

			cy
				.get('@writeToTapeButton')
				.should('be.disabled');

			cy
				.get('@alphabetInput')
				.type('2');

			cy
				.get('@writeToTapeButton')
				.should('be.enabled');
		});
	});
});