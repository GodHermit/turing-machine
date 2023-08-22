import { useStore } from '@/_store';
import TuringMachine, { defaultOptions } from '.';
import { Direction, Instruction } from './types';

const testInput = '1010';

const testInstructions: Instruction[] = [
	{
		stateIndex: 0,
		symbol: '0',
		move: TuringMachine.RIGHT,
		newSymbol: '1',
		newStateIndex: 0
	},
	{
		stateIndex: 0,
		symbol: '1',
		move: TuringMachine.RIGHT,
		newSymbol: '0',
		newStateIndex: 0
	},
	{
		stateIndex: 0,
		symbol: TuringMachine.BLANK_SYMBOL,
		move: TuringMachine.RIGHT,
		newSymbol: TuringMachine.BLANK_SYMBOL,
		newStateIndex: '!'
	}
];

const testOptions = {
	initialStateIndex: 0,
	initialPosition: 1,
	finalStateIndex: '!',
	maxSteps: 1001
};

describe('class TuringMachine { }', () => {

	beforeEach(() => {
		cy.wrap(useStore);
	});

	describe('static constants and variables', () => {
		it('should have a static constant LEFT (L)', () => {
			expect(TuringMachine.LEFT).to.exist;
			expect(TuringMachine.LEFT).to.eq('L');
		});

		it('should have a static constant RIGHT (R)', () => {
			expect(TuringMachine.RIGHT).to.exist;
			expect(TuringMachine.RIGHT).to.eq('R');
		});

		it('should have a static constant NONE (N)', () => {
			expect(TuringMachine.NONE).to.exist;
			expect(TuringMachine.NONE).to.eq('N');
		});

		it('should have a static variable BLANK_SYMBOL (λ)', () => {
			expect(TuringMachine.BLANK_SYMBOL).to.exist;
			expect(TuringMachine.BLANK_SYMBOL).to.eq('λ');
		});
	});

	describe('constructor()', () => {
		it('should create a new instance of TuringMachine', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			expect(tm).to.be.an.instanceOf(TuringMachine);
		});

		it('should set the input', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			expect(tm.getInput()).to.eq(testInput);
		});

		it('should set the instructions', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			expect(tm.getInstructions()).to.eq(testInstructions);
		});

		it('should set the default options', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			expect(tm.getOptions()).to.deep.eq(defaultOptions);
		});

		context('when options are provided', () => {
			beforeEach(() => {
				const tm = new TuringMachine(testInput, testInstructions, testOptions);

				cy.wrap(tm).as('tm');
			});

			it('should set the options', () => {
				cy
					.get('@tm')
					.invoke('getOptions')
					.should('deep.equal', testOptions);
			});

			it('should set the current state', () => {
				cy
					.get('@tm')
					.invoke('getCurrentCondition')
					.then(({ stateIndex }) => {
						expect(stateIndex).to.eq(testOptions.initialStateIndex);
					});
			});

			context('initialState is not provided', () => {
				it('should set the current state to the default one', () => {
					const tm = new TuringMachine(testInput, testInstructions, { ...testOptions, initialStateIndex: undefined });

					cy.wrap(tm).as('tm');

					cy
						.get('@tm')
						.invoke('getCurrentCondition')
						.then(({ stateIndex }) => {
							expect(stateIndex).to.eq(defaultOptions.initialStateIndex);
						});
				});
			});

			it('should set the current position', () => {
				cy
					.get('@tm')
					.invoke('getCurrentCondition')
					.then(({ headPosition }) => {
						expect(headPosition).to.eq(testOptions.initialPosition);
					});
			});

			context('initialPosition is not provided', () => {
				it('should set the current position to the default one', () => {
					const tm = new TuringMachine(testInput, testInstructions, { ...testOptions, initialPosition: undefined });

					cy.wrap(tm).as('tm');

					cy
						.get('@tm')
						.invoke('getCurrentCondition')
						.then(({ headPosition }) => {
							expect(headPosition).to.eq(defaultOptions.initialPosition);
						});
				});
			});
		});

		context('when input is an instance of TuringMachine', () => {
			it('should copy the input', () => {
				const tm = new TuringMachine(testInput, testInstructions);
				const newTm = new TuringMachine(tm);
				expect(newTm.getInput()).to.eq(testInput);
				expect(newTm.getInstructions()).to.deep.eq(testInstructions);
			});
		});
	});

	describe('setInput()', () => {
		it('should set the input', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			tm.setInput('0101');
			expect(tm.getInput()).to.eq('0101');
		});
	});

	describe('getInput()', () => {
		it('should return the input', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			expect(tm.getInput()).to.eq(testInput);
		});
	});

	describe('setInstructions()', () => {
		it('should set the instructions', () => {
			const newInstructions = [
				{
					stateIndex: 'q0',
					symbol: '0',
					move: TuringMachine.RIGHT,
					newSymbol: '0',
					newStateIndex: 'q0'
				},
				{
					stateIndex: 'q0',
					symbol: '1',
					move: TuringMachine.NONE,
					newSymbol: '1',
					newStateIndex: '!'
				},
			];
			const tm = new TuringMachine(testInput, testInstructions);
			tm.setInstructions(newInstructions);
			expect(tm.getInstructions()).to.eq(newInstructions);
		});
	});

	describe('getInstructions()', () => {
		it('should return the instructions', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			expect(tm.getInstructions()).to.eq(testInstructions);
		});
	});

	describe('setOptions()', () => {
		it('should set the options', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			tm.setOptions(testOptions);
			expect(tm.getOptions()).to.deep.eq(testOptions);
		});
	});

	describe('getOptions()', () => {
		it('should return the options', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			expect(tm.getOptions()).to.deep.eq(defaultOptions);
		});
	});

	describe('setCurrentCondition()', () => {
		it('should set the current condition', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			const testHeadPos = 1;
			tm.setCurrentCondition({
				headPosition: testHeadPos
			});

			const testInstruction = testInstructions.find(
				({ stateIndex, symbol }) =>
					stateIndex === defaultOptions.initialStateIndex &&
					symbol === testInput[testHeadPos]
			);
			if (!testInstruction) {
				throw new Error(`No instruction found for state index '${defaultOptions.initialStateIndex}' and symbol '${testInput[testHeadPos]}'`);
			}

			expect(tm.getCurrentCondition()).to.deep.eq({
				stateIndex: defaultOptions.initialStateIndex,
				stateName: useStore.getState().machineState.states.get(defaultOptions.initialStateIndex) || '',
				headPosition: testHeadPos,
				tapeValue: testInput,
				step: 0,
				symbol: testInput[testHeadPos],
				instruction: {
					...testInstruction,
					stateName: useStore.getState().machineState.states.get(testInstruction.stateIndex) || '',
					newStateName: useStore.getState().machineState.states.get(testInstruction.newStateIndex) || ''
				},
				isFinalCondition: defaultOptions.initialStateIndex === defaultOptions.finalStateIndex,
			});
		});
	});

	describe('getCurrentCondition()', () => {
		it('should return the current condition', () => {
			const tm = new TuringMachine(testInput, testInstructions);

			const testInstruction = testInstructions.find(
				({ stateIndex, symbol }) =>
					stateIndex === defaultOptions.initialStateIndex &&
					symbol === testInput[defaultOptions.initialPosition]
			);
			if (!testInstruction) {
				throw new Error(`No instruction found for state index '${defaultOptions.initialStateIndex}' and symbol '${testInput[defaultOptions.initialPosition]}'`);
			}

			expect(tm.getCurrentCondition()).to.deep.eq({
				stateIndex: defaultOptions.initialStateIndex,
				stateName: useStore.getState().machineState.states.get(defaultOptions.initialStateIndex) || '',
				headPosition: defaultOptions.initialPosition,
				tapeValue: testInput,
				step: 0,
				symbol: testInput[defaultOptions.initialPosition],
				instruction: {
					...testInstruction,
					stateName: useStore.getState().machineState.states.get(testInstruction.stateIndex) || '',
					newStateName: useStore.getState().machineState.states.get(testInstruction.newStateIndex) || ''
				},
				isFinalCondition: defaultOptions.initialStateIndex === defaultOptions.finalStateIndex,
			});
		});

		context('when the head position is negative', () => {
			const testHeadPos = -1;
			it('should return the current condition', () => {
				const tm = new TuringMachine(testInput, testInstructions, {
					initialPosition: testHeadPos
				});

				const testInstruction = testInstructions.find(
					({ stateIndex, symbol }) =>
						stateIndex === defaultOptions.initialStateIndex &&
						symbol === TuringMachine.BLANK_SYMBOL
				);
				if (!testInstruction) {
					throw new Error(`No instruction found for state index '${defaultOptions.initialStateIndex}' and symbol '${TuringMachine.BLANK_SYMBOL}'`);
				}

				expect(tm.getCurrentCondition()).to.deep.eq({
					stateIndex: defaultOptions.initialStateIndex,
					stateName: useStore.getState().machineState.states.get(defaultOptions.initialStateIndex) || '',
					headPosition: testHeadPos,
					tapeValue: testInput,
					step: 0,
					symbol: TuringMachine.BLANK_SYMBOL,
					instruction: {
						...testInstruction,
						stateName: useStore.getState().machineState.states.get(testInstruction.stateIndex) || '',
						newStateName: useStore.getState().machineState.states.get(testInstruction.newStateIndex) || ''
					},
					isFinalCondition: defaultOptions.initialStateIndex === defaultOptions.finalStateIndex,
				});
			});
		});
	});

	describe('static setBlankSymbol()', () => {
		it('should set the blank symbol', () => {
			TuringMachine.setBlankSymbol('b');
			expect(TuringMachine.BLANK_SYMBOL).to.eq('b');
			TuringMachine.setBlankSymbol('λ');
		});
	});

	describe('run()', () => {
		it('should return the last tape value', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			expect(tm.run().result).to.eq('0101λ');
		});

		context('when the final state is not reached', () => {
			it('should throw an error', () => {
				const testInstructions = [
					{
						stateIndex: 0,
						symbol: TuringMachine.BLANK_SYMBOL,
						move: TuringMachine.RIGHT,
						newSymbol: TuringMachine.BLANK_SYMBOL,
						newStateIndex: 0
					}
				];
				const tm = new TuringMachine('', testInstructions);

				try {
					tm.run();
				} catch (e) {
					expect((e as Error).message).to.eq(`Maximum number of steps reached (${defaultOptions.maxSteps})`);
				}
			});
		});
	});

	describe('reset()', () => {
		it('should reset the current condition', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			tm.reset();

			const testInstruction = testInstructions.find(
				({ stateIndex, symbol }) =>
					stateIndex === defaultOptions.initialStateIndex &&
					symbol === testInput[defaultOptions.initialPosition]
			);
			if (!testInstruction) {
				throw new Error(`No instruction found for state index '${defaultOptions.initialStateIndex}' and symbol '${testInput[defaultOptions.initialPosition]}'`);
			}
			expect(tm.getCurrentCondition()).to.deep.eq({
				stateIndex: defaultOptions.initialStateIndex,
				stateName: useStore.getState().machineState.states.get(defaultOptions.initialStateIndex) || '',
				headPosition: defaultOptions.initialPosition,
				tapeValue: testInput,
				step: 0,
				symbol: testInput[defaultOptions.initialPosition],
				instruction: {
					...testInstruction,
					stateName: useStore.getState().machineState.states.get(testInstruction.stateIndex) || '',
					newStateName: useStore.getState().machineState.states.get(testInstruction.newStateIndex) || ''
				},
				isFinalCondition: defaultOptions.initialStateIndex === defaultOptions.finalStateIndex,
			});
		});

		it('should reset BLANK_SYMBOL variable', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			TuringMachine.setBlankSymbol('b');
			expect(TuringMachine.BLANK_SYMBOL).to.eq('b');
			tm.reset();
			expect(TuringMachine.BLANK_SYMBOL).to.eq('λ');
		});
	});

	describe('step()', () => {
		it('should return the next tape value', () => {
			const tm = new TuringMachine(testInput, testInstructions);
			expect(tm.step()).to.eq('0010');
			expect(tm.step()).to.eq('0110');
			expect(tm.step()).to.eq('0100');
			expect(tm.step()).to.eq('0101');
			expect(tm.step()).to.eq('0101λ');
		});

		context('when the head position is negative', () => {
			const testHeadPos = -1;
			it('should prepend BLANK_SYMBOL to the tape', () => {
				const tm = new TuringMachine(testInput, testInstructions, {
					initialPosition: testHeadPos
				});
				expect(tm.step()).to.eq('λ1010');
			});
		});

		context('when the head position is greater than the tape length', () => {
			const testHeadPos = 5;
			it('should append BLANK_SYMBOL to the tape', () => {
				const tm = new TuringMachine(testInput, testInstructions, {
					initialPosition: testHeadPos
				});
				expect(tm.step()).to.eq('1010λ');
			});
		});

		context('when the initial state is the final state', () => {
			it('should return the initial tape value', () => {
				const tm = new TuringMachine(testInput, testInstructions, {
					initialStateIndex: defaultOptions.finalStateIndex
				});
				expect(tm.step()).to.eq(testInput);
			});
		});

		context('when state is not found', () => {
			it('should throw an error', () => {
				const tm = new TuringMachine(testInput, testInstructions, {
					initialStateIndex: 2
				});

				try {
					tm.step();
				} catch (error) {
					expect((error as Error).message).to.eq(`No state found for index '${2}'`);
				}
			});
		});

		context('when the instructions are undefined', () => {
			it('should throw an error', () => {
				const tm = new TuringMachine(testInput, []);
				try {
					tm.step();
				} catch (error) {
					const state = useStore.getState().machineState.states.get(defaultOptions.initialStateIndex);
					expect((error as Error).message).to.eq(`No instruction found for state '${state}' and symbol '${testInput[defaultOptions.initialPosition]}'`);
				}
			});
		});
	});

	describe('executeInstruction()', () => {
		context('when the next head position is negative', () => {
			it('should prepend BLANK_SYMBOL to the tape and set head position to 0', () => {
				const testInstructions = [
					{
						stateIndex: 0,
						symbol: '1',
						move: TuringMachine.LEFT,
						newSymbol: '0',
						newStateIndex: defaultOptions.finalStateIndex
					},
					{
						stateIndex: 0,
						symbol: TuringMachine.BLANK_SYMBOL,
						move: TuringMachine.LEFT,
						newSymbol: TuringMachine.BLANK_SYMBOL,
						newStateIndex: defaultOptions.finalStateIndex
					}
				];
				const tm = new TuringMachine('111', testInstructions, {
					initialPosition: -1
				});
				expect(tm.getCurrentCondition().headPosition).to.eq(-1);
				expect(tm.step()).to.eq('λλ111');
				expect(tm.getCurrentCondition().headPosition).to.eq(0);
			});
		});
	});

	describe('getNewHeadPosition()', () => {
		context('when the instruction is to move left', () => {
			it('should return the new head position less than the current head position', () => {
				const testInstructions = [
					{
						stateIndex: 0,
						symbol: '1',
						move: TuringMachine.LEFT,
						newSymbol: '0',
						newStateIndex: defaultOptions.finalStateIndex
					}
				];
				const tm = new TuringMachine('111', testInstructions, {
					initialPosition: 1
				});
				expect(tm.getCurrentCondition().headPosition).to.eq(1);
				expect(tm.step()).to.eq('101');
				expect(tm.getCurrentCondition().headPosition).to.eq(0);
			});
		});

		context('when the instruction is to move right', () => {
			it('should return the new head position greater than the current head position', () => {
				const testInstructions = [
					{
						stateIndex: 0,
						symbol: '1',
						move: TuringMachine.RIGHT,
						newSymbol: '0',
						newStateIndex: defaultOptions.finalStateIndex
					}
				];
				const tm = new TuringMachine('111', testInstructions, {
					initialPosition: 1
				});
				expect(tm.getCurrentCondition().headPosition).to.eq(1);
				expect(tm.step()).to.eq('101');
				expect(tm.getCurrentCondition().headPosition).to.eq(2);
			});
		});

		context('when the instruction is to stay', () => {
			it('should return the new head position equal to the current head position', () => {
				const testInstructions = [
					{
						stateIndex: 0,
						symbol: '1',
						move: TuringMachine.NONE,
						newSymbol: '0',
						newStateIndex: defaultOptions.finalStateIndex
					}
				];
				const tm = new TuringMachine('111', testInstructions, {
					initialPosition: 1
				});
				expect(tm.getCurrentCondition().headPosition).to.eq(1);
				expect(tm.step()).to.eq('101');
				expect(tm.getCurrentCondition().headPosition).to.eq(1);
			});
		});

		context('when the move direction is invalid', () => {
			it('should throw an error', () => {
				const testInstructions = [
					{
						stateIndex: 0,
						symbol: '1',
						move: 'I' as Direction,
						newSymbol: '0',
						newStateIndex: defaultOptions.finalStateIndex
					}
				];
				const tm = new TuringMachine('111', testInstructions, {
					initialPosition: 1
				});
				try {
					tm.step();
				} catch (error) {
					expect((error as Error).message).to.eq(`Invalid move 'I'`);
				}
			});
		});
	});
});