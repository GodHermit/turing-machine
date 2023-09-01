import { useStore } from '@/_store';
import { initialRegisters } from '@/_store/slices/registersSlice';
import '@/app/globals.scss';
import TuringMachine from '@/lib/turingMachine';
import AlphabetInput from '../AlphabetInput';
import TapeInput from './index';

describe('<TapeInput />', () => {
	beforeEach(() => {
		cy.mount(<TapeInput />);
		cy
			.findByLabelText('Input:')
			.as('tapeInput')
			.clear();
		useStore.getState().setRegisters(initialRegisters);

		useStore.setState({
			machine: new TuringMachine(),
		}); // Reset the machine
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
		cy.spy(useStore, 'setState').as('setState');
		const value = '1010';

		cy
			.get('@tapeInput')
			.type(value);

		cy
			.findByText('Write to tape')
			.as('writeToTapeButton')
			.click()
			.should('be.disabled');

		cy
			.get('@setState')
			.should('be.calledWith', {
				machine: new TuringMachine(value),
			})
			.then(() => {
				const machine = useStore.getState().machine;
				expect(machine.getInput()).to.equal(value);
				expect(machine.getCurrentCondition().tapeValue).to.equal(value);
				expect(machine.getCurrentCondition().headPosition).to.equal(0);
				expect(machine.getOptions().initialPosition).to.equal(0);
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
			.get('@setState')
			.should('be.calledWith', {
				machine: new TuringMachine(''),
			})
			.then(() => {
				const machine = useStore.getState().machine;
				expect(machine.getInput()).to.equal('');
				expect(machine.getCurrentCondition().tapeValue).to.equal('');
				expect(machine.getCurrentCondition().headPosition).to.equal(0);
				expect(machine.getOptions().initialPosition).to.equal(0);
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