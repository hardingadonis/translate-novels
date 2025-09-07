import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Translate Novels',
	description: '📚 A simple website for translating novels via LM',
};

const RootLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
};

export default RootLayout;
