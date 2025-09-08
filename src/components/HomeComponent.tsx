'use client';

import {
	BookOutlined,
	FileTextOutlined,
	RightOutlined,
	SettingOutlined,
	TranslationOutlined,
} from '@ant-design/icons';
import {
	Alert,
	Button,
	Card,
	Col,
	List,
	Progress,
	Row,
	Space,
	Statistic,
	Tag,
	Typography,
} from 'antd';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';

import axiosInstance from '@/lib/axios';

const { Title, Paragraph } = Typography;

interface Novel {
	id: number;
	title: string;
}

interface Chapter {
	id: number;
	rawContent: string;
	vietnameseContent?: string;
	order: number;
	novelId: number;
}

interface DashboardStats {
	totalNovels: number;
	totalChapters: number;
	translatedChapters: number;
	lmStudioEndpoints: number;
}

const HomeComponent: React.FC<{ onNavigate?: (key: string) => void }> = ({
	onNavigate,
}) => {
	const [stats, setStats] = useState<DashboardStats>({
		totalNovels: 0,
		totalChapters: 0,
		translatedChapters: 0,
		lmStudioEndpoints: 0,
	});
	const [recentNovels, setRecentNovels] = useState<Novel[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		setLoading(true);
		try {
			// Fetch novels
			const novelsResponse = await axiosInstance.get('/api/novels');
			const novels = novelsResponse.data || [];

			// Fetch LM Studio endpoints
			const lmStudiosResponse = await axiosInstance.get('/api/lmstudio');
			const lmStudios = lmStudiosResponse.data || [];

			// Fetch chapters for all novels to calculate stats
			let allChapters: Chapter[] = [];
			for (const novel of novels) {
				try {
					const chaptersResponse = await axiosInstance.get(
						`/api/chapters?novelId=${novel.id}`,
					);
					const chapters = chaptersResponse.data;
					allChapters = [...allChapters, ...chapters];
				} catch (error) {
					console.error(
						`Error fetching chapters for novel ${novel.id}:`,
						error,
					);
				}
			}

			const translatedCount = allChapters.filter(
				(chapter) => chapter.vietnameseContent,
			).length;

			setStats({
				totalNovels: novels.length,
				totalChapters: allChapters.length,
				translatedChapters: translatedCount,
				lmStudioEndpoints: lmStudios.length,
			});

			setRecentNovels(novels.slice(-5)); // Show last 5 novels
		} catch (error) {
			if (error instanceof AxiosError) {
				console.error(
					'Error fetching dashboard data:',
					error.response?.statusText || error.message,
				);
			} else {
				console.error('Error fetching dashboard data:', error);
			}
		} finally {
			setLoading(false);
		}
	};

	const translationProgress =
		stats.totalChapters > 0
			? Math.round((stats.translatedChapters / stats.totalChapters) * 100)
			: 0;

	const quickActions = [
		{
			title: 'Add New Novel',
			description: 'Create a new novel to manage',
			icon: <BookOutlined />,
			action: () => onNavigate?.('novels'),
		},
		{
			title: 'Upload Chapters',
			description: 'Upload .txt file with chapters',
			icon: <FileTextOutlined />,
			action: () => onNavigate?.('novels'),
		},
		{
			title: 'Start Translation',
			description: 'Translate chapters using LM Studio',
			icon: <TranslationOutlined />,
			action: () => onNavigate?.('translate'),
		},
		{
			title: 'Configure LM Studio',
			description: 'Set up LM Studio API endpoints',
			icon: <SettingOutlined />,
			action: () => onNavigate?.('settings'),
		},
	];

	return (
		<div>
			<div style={{ marginBottom: 24 }}>
				<Title level={1}>📚 Novel Translation Manager</Title>
				<Paragraph type="secondary">
					Welcome to your novel translation workspace. Manage your novels,
					chapters, and translations all in one place.
				</Paragraph>
			</div>

			<Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="Total Novels"
							value={stats.totalNovels}
							prefix={<BookOutlined />}
							loading={loading}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="Total Chapters"
							value={stats.totalChapters}
							prefix={<FileTextOutlined />}
							loading={loading}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="Translated"
							value={stats.translatedChapters}
							prefix={<TranslationOutlined />}
							suffix={`/ ${stats.totalChapters}`}
							loading={loading}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} lg={6}>
					<Card>
						<Statistic
							title="LM Studio APIs"
							value={stats.lmStudioEndpoints}
							prefix={<SettingOutlined />}
							loading={loading}
						/>
					</Card>
				</Col>
			</Row>

			<Row gutter={[16, 16]}>
				<Col xs={24} lg={12}>
					<Card title="Translation Progress" loading={loading}>
						<Progress
							type="circle"
							percent={translationProgress}
							format={() =>
								`${stats.translatedChapters}/${stats.totalChapters}`
							}
							size={120}
						/>
						<div style={{ marginTop: 16, textAlign: 'center' }}>
							<Tag
								color={
									translationProgress === 100
										? 'green'
										: translationProgress > 50
											? 'orange'
											: 'blue'
								}
							>
								{translationProgress === 100
									? 'Complete'
									: translationProgress > 50
										? 'In Progress'
										: 'Getting Started'}
							</Tag>
						</div>
					</Card>
				</Col>

				<Col xs={24} lg={12}>
					<Card title="Recent Novels" loading={loading}>
						{recentNovels.length > 0 ? (
							<List
								dataSource={recentNovels}
								renderItem={(novel) => (
									<List.Item>
										<List.Item.Meta
											avatar={<BookOutlined />}
											title={novel.title}
											description={`Novel ID: ${novel.id}`}
										/>
									</List.Item>
								)}
							/>
						) : (
							<div style={{ textAlign: 'center', padding: '20px 0' }}>
								<BookOutlined
									style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }}
								/>
								<Paragraph type="secondary">
									No novels yet. Create your first novel to get started!
								</Paragraph>
							</div>
						)}
					</Card>
				</Col>
			</Row>

			<Card title="Quick Actions" style={{ marginTop: 16 }}>
				<Row gutter={[16, 16]}>
					{quickActions.map((action, index) => (
						<Col xs={24} sm={12} lg={6} key={index}>
							<Card
								size="small"
								hoverable
								onClick={action.action}
								style={{ cursor: 'pointer', height: '100%' }}
							>
								<div style={{ textAlign: 'center' }}>
									<div
										style={{ fontSize: 32, marginBottom: 8, color: '#1890ff' }}
									>
										{action.icon}
									</div>
									<Title level={5} style={{ marginBottom: 4 }}>
										{action.title}
									</Title>
									<Paragraph
										type="secondary"
										style={{ marginBottom: 8, fontSize: 12 }}
									>
										{action.description}
									</Paragraph>
									<Button type="text" size="small" icon={<RightOutlined />}>
										Go
									</Button>
								</div>
							</Card>
						</Col>
					))}
				</Row>
			</Card>

			{stats.lmStudioEndpoints === 0 && (
				<Alert
					message="Setup Required"
					description={
						<div>
							You haven't configured any LM Studio endpoints yet.
							<Button
								type="link"
								onClick={() => onNavigate?.('settings')}
								style={{ padding: 0, marginLeft: 4 }}
							>
								Set up LM Studio
							</Button>
							to start translating chapters.
						</div>
					}
					type="warning"
					style={{ marginTop: 16 }}
				/>
			)}
		</div>
	);
};

export default HomeComponent;
