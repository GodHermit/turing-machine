import clsx from 'clsx';
import styles from '../Tape.module.scss';

export default function TapePlaceholder() {
	return (
		<div className={clsx(
			'input-group',
			'pt-4',
			'pb-4',
			styles.tape
		)}>
			<div className={clsx(
				'form-control',
				'fs-4',
				'placeholder',
				styles.cell
			)}>
			</div>
		</div>
	);
}