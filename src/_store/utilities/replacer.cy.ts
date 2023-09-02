import replacer from './replacer';

describe('function replacer(key, value)', () => {

	context('key = "states"', () => {
		it('should replace states Map with array of entries', () => {
			const stateMap = new Map().set('!', '!').set(0, 'q0').set(1, 'q1');
			const stateArray = [...stateMap.entries()];

			expect(replacer('states', stateMap)).to.deep.equal(stateArray);
		});
	});

	context('key = "logs"', () => {
		it('should replace logs array with array of plain objects', () => {
			const logs = [
				new Error('Error 1'),
				{
					'tapeValue': '',
					'stateIndex': 0,
					'headPosition': 0,
					'step': 0,
					'symbol': 'λ',
					'stateName': 'q0',
					'instruction': {
						'stateIndex': 0,
						'symbol': 'λ',
						'move': 'R',
						'newSymbol': 'λ',
						'newStateIndex': 0,
						'stateName': 'q0',
						'newStateName': 'q0'
					},
					'isFinalCondition': false
				}
			];
			const plainLogs = logs.map(log => {
				if (log instanceof Error) {
					return {
						type: 'error',
						message: log.message,
						cause: log.cause,
					};
				}
				return log;
			});

			expect(replacer('logs', logs)).to.deep.equal(plainLogs);
		});
	});

	context('value does not need to be replaced', () => {
		it('should return value as is', () => {
			expect(replacer('key', 'value')).to.equal('value');
		});
	});
});