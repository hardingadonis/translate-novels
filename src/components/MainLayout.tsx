'use client';

import {
	BookOutlined,
	FileTextOutlined,
	HomeOutlined,
	SettingOutlined,
	TranslationOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Typography, theme } from 'antd';
import React, { useState } from 'react';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

interface MainLayoutProps {
	children: React.ReactNode;
	activeKey?: string;
	onNavigate?: (key: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
	children,
	activeKey = 'home',
	onNavigate,
}) => {
	const [collapsed, setCollapsed] = useState(false);
	const {
		token: { colorBgContainer, borderRadiusLG },
	} = theme.useToken();

	const menuItems = [
		{
			key: 'home',
			icon: <HomeOutlined />,
			label: 'Home',
		},
		{
			key: 'novels',
			icon: <BookOutlined />,
			label: 'Novels',
		},
		{
			key: 'chapters',
			icon: <FileTextOutlined />,
			label: 'Chapters',
		},
		{
			key: 'translate',
			icon: <TranslationOutlined />,
			label: 'Translate',
		},
		{
			key: 'settings',
			icon: <SettingOutlined />,
			label: 'LM Studio Settings',
		},
	];

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
				<div
					style={{
						height: 32,
						margin: 16,
						background: 'rgba(255, 255, 255, 0.2)',
						borderRadius: 6,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						color: 'white',
						fontWeight: 'bold',
					}}
				>
					📚 TN
				</div>
				<Menu
					theme="dark"
					selectedKeys={[activeKey]}
					mode="inline"
					items={menuItems}
					onClick={({ key }) => onNavigate?.(key)}
				/>
			</Sider>
			<Layout>
				<Header
					style={{
						padding: '0 24px',
						background: colorBgContainer,
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<Title level={3} style={{ margin: 0 }}>
						Novel Translation Manager
					</Title>
				</Header>
				<Content style={{ margin: '16px' }}>
					<div
						style={{
							padding: 24,
							minHeight: 360,
							background: colorBgContainer,
							borderRadius: borderRadiusLG,
						}}
					>
						{children}
					</div>
				</Content>
			</Layout>
		</Layout>
	);
};

export default MainLayout;
