
import './globals.scss';

export const metadata = {
	metadataBase: new URL('https://godhermit.github.io/turing-machine'),
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>
				<main className='container pt-5'>
					<div className='row'>
						<div className='col'>
							<h1 className='display-1'>Turing Machine</h1>
							<p className='lead'>
								Read more on&nbsp;
								<a href='https://en.wikipedia.org/wiki/Turing_machine' target='_blank' rel='noopener noreferrer'>Wikipedia</a>.
							</p>
						</div>
					</div>
					{children}
				</main>
				<footer className='container'>
					<div className='row'>
						<div className='col'>
							<span>
								Made with 🖤 by&nbsp;
								<a href='http://godhermit.github.io' target='_blank' rel='noopener noreferrer'>Oleh Proidakov</a>.
							</span>
						</div>
					</div>
				</footer>
			</body>
		</html>
	)
}
