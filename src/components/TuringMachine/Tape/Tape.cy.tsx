import { useStore } from '@/_store';
import '@/app/globals.scss';
import Tape from './index';
import TuringMachine from '@/lib/turingMachine';

/**
 * An array of viewport widths and the number of cells that should be visible at that width.
 */
const testViewportWidths = [
	{
		viewportWidth: 366,
		cellsInView: 3,
	},
	{
		viewportWidth: 576,
		cellsInView: 5,
	},
	{
		viewportWidth: 768,
		cellsInView: 9,
	},
	{
		viewportWidth: 992,
		cellsInView: 13,
	},
	{
		viewportWidth: 1200,
		cellsInView: 17,
	},
	{
		viewportWidth: 1400,
		cellsInView: 19,
	}
];

/**
 * An array of tape values and their corresponding alphabet.
 */
const testTapeValues = [{
	alphabet: ['0', '1'],
	value: '101',
}, {
	alphabet: ['0', '1'],
	value: '101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010',
}, {
	alphabet: ['1', '2', '3', '4'],
	value: '1234',
}, {
	alphabet: ['1', '2', '3', '4'],
	value: ''
}];

describe('<Tape />', () => {
	beforeEach(() => {
		useStore.getState().setHeadPosition(0, true); // Reset head position

		cy.mount(
			<div className='container'>
				<Tape />
			</div>
		);
	});

	/**
	 * Test viewport widths
	 */
	testViewportWidths.forEach(({ viewportWidth, cellsInView }) => {
		context(`Viewport width: ${viewportWidth}`, () => {
			it('calculates the correct number of cells to render', () => {
				cy.viewport(viewportWidth, 500);
				cy.get('.input-group > *').should('have.length', cellsInView + 2); // 5 cells + 2 buttons
			});
		});
	});

	/**
	 * Test tape values
	 */
	testTapeValues.forEach(({ alphabet, value }) => {
		context(`Tape value: ${value}`, () => {
			/**
			 * Asserts that the tape value and head position are displayed correctly
			 * @param headPos The expected head position
			 */
			const assertTapeValue = (headPos: number = 0) => {
				cy.log('**Asserting tape value**');
				expect(useStore.getState().machine.getCurrentCondition().headPosition).to.be.equal(headPos);
				cy
					.get('.input-group > *')
					.each((cell, index, items) => {
						const visibleCells = items.length - 2;
						const middleIndex = Math.ceil(visibleCells / 2);
						const cellId = index - middleIndex;

						if (cell.get(0).tagName === 'BUTTON') return; // Skip buttons

						// cy.log(`**Cell value:** ${cell.val()}`, `(cellId: ${cellId + headPos})`);

						expect(cell.val()).to.be.equal(value[cellId + headPos] || '');
					});
			};

			beforeEach(() => {
				useStore.getState().setMachineState({
					alphabet,
				});

				const newMachine = new TuringMachine(useStore.getState().machine);
				newMachine.setInput(value);
				newMachine.reset();

				useStore.setState({
					machine: newMachine,
				});

				cy.viewport(1400, 500);

				cy.get('.input-group > *').should('have.length', 19 + 2); // 19 cells + 2 buttons

				cy.wait(1000); // Wait for re-render
			});

			it(`renders the correct tape value`, () => {
				assertTapeValue();
			});

			[true, false].forEach((isNaturalScrollingEnabled) => {
				context(`Natural scrolling: ${isNaturalScrollingEnabled}`, () => {
					beforeEach(() => {
						useStore.getState().setTapeSettings({
							naturalScrolling: isNaturalScrollingEnabled,
						});
					});

					it('moves head position on button click', () => {
						cy.log('**Pressing left button twice**');
						cy
							.get('.input-group > :nth-child(1)')
							.as('moveHeadLeftButton')
							.click()
							.click()
							.then(() => {
								assertTapeValue(isNaturalScrollingEnabled ? 2 : -2);
							});

						cy.log('**Pressing right button twice**', '(Resetting head position)');
						cy
							.get('.input-group > :last-child')
							.as('moveHeadRightButton')
							.click()
							.click()
							.then(() => {
								assertTapeValue(0);
							});

						cy.log('**Pressing right button twice**');
						cy
							.get('@moveHeadRightButton')
							.click()
							.click()
							.then(() => {
								assertTapeValue(isNaturalScrollingEnabled ? -2 : 2);
							});
					});
				});
			});

			it('moves head position on cell click', () => {
				cy.log('**Clicking on cell 0**');

				const visibleCells = 19 + 2; // 19 cells + 2 buttons
				const middleIndex = Math.ceil(visibleCells / 2);

				cy
					.get(`.input-group > :nth-child(${middleIndex})`)
					.as('cell0')
					.click()
					.then(() => {
						assertTapeValue(0);
					});

				cy.log('**Clicking on cell 2**');
				cy
					.get('@cell0')
					.next()
					.next()
					.as('cell2')
					.click()
					.then(() => {
						assertTapeValue(2);
					});

				cy.log('**Clicking on first cell**');
				cy
					.get('.input-group > :nth-child(2)')
					.as('firstCell')
					.click()
					.then(() => {
						cy.log(middleIndex.toString());
						assertTapeValue(-middleIndex + 2 + 2); // -9 + 2(buttons) + 2(previous head position)
					});
			});
		});
	});

	/**
	 * Asserts that the blank symbol is displayed correctly
	 */
	[true, false].forEach((showBlankSymbol) => {
		context(`Show blank symbol: ${showBlankSymbol}`, () => {
			it('renders the blank symbol correctly', () => {
				useStore.getState().setTapeSettings({
					showBlankSymbol,
				});
				const blankSymbol = useStore.getState().tapeSettings.blankSymbol;

				cy.viewport(576, 500);

				cy
					.findAllByPlaceholderText(blankSymbol)
					.should(showBlankSymbol ? 'exist' : 'not.exist');
			});
		});
	});
});