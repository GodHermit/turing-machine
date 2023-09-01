import { useStore } from '@/_store';
import TuringMachine from '@/lib/turingMachine';
import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { string } from 'yup';

export default function BlankSymbolInput() {
	const [
		machine,
		machineState,
		tapeSettings,
		setTapeSettings
	] = useStore(state => [
		state.machine,
		state.machineState,
		state.tapeSettings,
		state.setTapeSettings
	]);

	const [value, setValue] = useState(tapeSettings.blankSymbol);

	/**
	 * Syncs the value of the input with the state
	 */
	useEffect(() => {
		setValue(tapeSettings.blankSymbol);
	}, [tapeSettings.blankSymbol]);

	/**
	 * Schema for validating the input
	 */
	const schema = useMemo(() => {
		return string()
			.required()
			.max(1)
			.notOneOf(machineState.alphabet, 'This symbol is already in the alphabet')
			.label('Blank symbol');
	}, [machineState.alphabet]);

	const isInputInvalid = useMemo((): { value: boolean, feedback: string } => {
		try {
			schema.validateSync(value.trim());
		} catch (error) {
			return {
				value: true,
				feedback: (error as Error).message
			}
		}

		return {
			value: false,
			feedback: ''
		}
	}, [value, schema]);

	/**
	 * Handles change of blank symbol input and updates the state
	 * @param e change event
	 */
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newBlankSymbol = e.target.value;
		setValue(newBlankSymbol);

		if (
			!schema.isValidSync(newBlankSymbol.trim())
		) {
			return;
		}

		const newMachine = new TuringMachine(machine);
		newMachine.setBlankSymbol(newBlankSymbol);

		useStore.setState({
			machine: newMachine
		});
		setTapeSettings({
			blankSymbol: newBlankSymbol
		});
	};

	return (
		<>
			<label htmlFor='blank-symbol' className='form-label'>
				Blank symbol:
			</label>
			<input
				type='text'
				className={clsx(
					'form-control',
					isInputInvalid.value && 'is-invalid'
				)}
				id='blank-symbol'
				maxLength={1}
				list='blank-symbol-list'
				value={value}
				onChange={handleChange}
			/>
			<datalist id='blank-symbol-list'>
				<option value='&lambda;'>Lambda (default)</option>
				<option value='_'>Underscore</option>
			</datalist>
			{isInputInvalid.feedback.length > 0
				? (
					<div className='invalid-feedback'>
						{isInputInvalid.feedback}
					</div>
				)
				: (
					<div className='form-text'>
						A single character that represents the blank symbol.
					</div>
				)
			}
		</>
	);
}