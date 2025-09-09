import { AntdRegistry } from '@ant-design/nextjs-registry';
import '@ant-design/v5-patch-for-react-19';
import type { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Translate Novels',
	description: '📚 A simple website for translating novels via LM',
	authors: { name: 'Minh Vương', url: 'https://github.com/hardingadonis' },
};

const RootLayout = ({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) => {
	return (
		<html lang="en">
			<body>
				<AntdRegistry>{children}</AntdRegistry>
			</body>
		</html>
	);
};

export default RootLayout;
