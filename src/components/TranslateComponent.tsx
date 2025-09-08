'use client';

import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	EyeOutlined,
	PlayCircleOutlined,
	TranslationOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Checkbox,
	Divider,
	Input,
	Modal,
	Progress,
	Select,
	Space,
	Table,
	Tag,
	Typography,
	message,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

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

interface LMStudio {
	id: number;
	apiEndpoint: string;
}

interface TranslationResult {
	chapterId: number;
	success: boolean;
	error?: string;
}

const TranslateComponent: React.FC = () => {
	const [novels, setNovels] = useState<Novel[]>([]);
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [lmStudios, setLMStudios] = useState<LMStudio[]>([]);
	const [selectedNovelId, setSelectedNovelId] = useState<number | null>(null);
	const [selectedLMStudioId, setSelectedLMStudioId] = useState<number | null>(
		null,
	);
	const [selectedChapterIds, setSelectedChapterIds] = useState<number[]>([]);
	const [customPrompt, setCustomPrompt] = useState<string>('');
	const [isTranslating, setIsTranslating] = useState(false);
	const [translationProgress, setTranslationProgress] = useState<{
		current: number;
		total: number;
		results: TranslationResult[];
	}>({ current: 0, total: 0, results: [] });
	const [previewModalVisible, setPreviewModalVisible] = useState(false);
	const [previewChapter, setPreviewChapter] = useState<Chapter | null>(null);

	useEffect(() => {
		fetchNovels();
		fetchLMStudios();
	}, []);

	useEffect(() => {
		if (selectedNovelId) {
			fetchChapters(selectedNovelId);
		}
	}, [selectedNovelId]);

	const fetchNovels = async () => {
		try {
			const response = await fetch('/api/novels');
			if (response.ok) {
				const data = await response.json();
				setNovels(data);
			} else {
				message.error('Failed to fetch novels');
			}
		} catch (error) {
			message.error('Error fetching novels');
		}
	};

	const fetchChapters = async (novelId: number) => {
		try {
			const response = await fetch(`/api/chapters?novelId=${novelId}`);
			if (response.ok) {
				const data = await response.json();
				setChapters(data);
				setSelectedChapterIds([]);
			} else {
				message.error('Failed to fetch chapters');
			}
		} catch (error) {
			message.error('Error fetching chapters');
		}
	};

	const fetchLMStudios = async () => {
		try {
			const response = await fetch('/api/lmstudio');
			if (response.ok) {
				const data = await response.json();
				setLMStudios(data);
			} else {
				message.error('Failed to fetch LM Studios');
			}
		} catch (error) {
			message.error('Error fetching LM Studios');
		}
	};

	const handleTranslate = async () => {
		if (!selectedLMStudioId || selectedChapterIds.length === 0) {
			message.error('Please select LM Studio and at least one chapter');
			return;
		}

		const selectedLMStudio = lmStudios.find(
			(lms) => lms.id === selectedLMStudioId,
		);
		if (!selectedLMStudio) {
			message.error('Selected LM Studio not found');
			return;
		}

		setIsTranslating(true);
		setTranslationProgress({
			current: 0,
			total: selectedChapterIds.length,
			results: [],
		});

		try {
			const response = await fetch('/api/translate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					apiEndpoint: selectedLMStudio.apiEndpoint,
					chapterIds: selectedChapterIds,
					customPrompt: customPrompt || undefined,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				setTranslationProgress((prev) => ({
					...prev,
					current: prev.total,
					results: data.results,
				}));

				const successCount = data.results.filter(
					(r: TranslationResult) => r.success,
				).length;
				const failCount = data.results.filter(
					(r: TranslationResult) => !r.success,
				).length;

				if (successCount > 0) {
					message.success(
						`Translation completed: ${successCount} successful, ${failCount} failed`,
					);
					// Refresh chapters to show updated translations
					if (selectedNovelId) {
						fetchChapters(selectedNovelId);
					}
				} else {
					message.error('All translations failed');
				}
			} else {
				message.error('Failed to translate chapters');
			}
		} catch (error) {
			message.error('Error during translation');
		} finally {
			setIsTranslating(false);
		}
	};

	const handleSelectAll = () => {
		if (selectedChapterIds.length === chapters.length) {
			setSelectedChapterIds([]);
		} else {
			setSelectedChapterIds(chapters.map((chapter) => chapter.id));
		}
	};

	const handleSelectUntranslated = () => {
		const untranslatedIds = chapters
			.filter((chapter) => !chapter.vietnameseContent)
			.map((chapter) => chapter.id);
		setSelectedChapterIds(untranslatedIds);
	};

	const columns = [
		{
			title: (
				<Checkbox
					checked={
						selectedChapterIds.length === chapters.length && chapters.length > 0
					}
					indeterminate={
						selectedChapterIds.length > 0 &&
						selectedChapterIds.length < chapters.length
					}
					onChange={handleSelectAll}
				>
					Order
				</Checkbox>
			),
			dataIndex: 'order',
			key: 'order',
			width: 100,
			render: (order: number, record: Chapter) => (
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<Checkbox
						checked={selectedChapterIds.includes(record.id)}
						onChange={(e) => {
							if (e.target.checked) {
								setSelectedChapterIds([...selectedChapterIds, record.id]);
							} else {
								setSelectedChapterIds(
									selectedChapterIds.filter((id) => id !== record.id),
								);
							}
						}}
					/>
					{order}
				</div>
			),
		},
		{
			title: 'Content Preview',
			dataIndex: 'rawContent',
			key: 'rawContent',
			render: (text: string) => (
				<Text ellipsis style={{ maxWidth: 200 }}>
					{text.substring(0, 50)}...
				</Text>
			),
		},
		{
			title: 'Status',
			key: 'status',
			width: 120,
			render: (_: any, record: Chapter) => {
				const result = translationProgress.results.find(
					(r) => r.chapterId === record.id,
				);
				if (result) {
					return (
						<Tag
							color={result.success ? 'green' : 'red'}
							icon={
								result.success ? (
									<CheckCircleOutlined />
								) : (
									<CloseCircleOutlined />
								)
							}
						>
							{result.success ? 'Success' : 'Failed'}
						</Tag>
					);
				}
				return (
					<Tag color={record.vietnameseContent ? 'green' : 'orange'}>
						{record.vietnameseContent ? 'Translated' : 'Not Translated'}
					</Tag>
				);
			},
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 80,
			render: (_: any, record: Chapter) => (
				<Button
					type="text"
					icon={<EyeOutlined />}
					onClick={() => {
						setPreviewChapter(record);
						setPreviewModalVisible(true);
					}}
				/>
			),
		},
	];

	return (
		<div>
			<Title level={2}>Translation Center</Title>

			<Card title="Translation Settings" style={{ marginBottom: 16 }}>
				<Space direction="vertical" style={{ width: '100%' }} size="large">
					<div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
						<div style={{ minWidth: 120 }}>
							<Text strong>Novel:</Text>
						</div>
						<Select
							style={{ width: 300 }}
							value={selectedNovelId}
							onChange={setSelectedNovelId}
							placeholder="Select a novel"
						>
							{novels.map((novel) => (
								<Option key={novel.id} value={novel.id}>
									{novel.title}
								</Option>
							))}
						</Select>
					</div>

					<div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
						<div style={{ minWidth: 120 }}>
							<Text strong>LM Studio API:</Text>
						</div>
						<Select
							style={{ width: 300 }}
							value={selectedLMStudioId}
							onChange={setSelectedLMStudioId}
							placeholder="Select LM Studio API"
						>
							{lmStudios.map((lms) => (
								<Option key={lms.id} value={lms.id}>
									{lms.apiEndpoint}
								</Option>
							))}
						</Select>
					</div>

					<div>
						<Text strong>Custom Translation Prompt (Optional):</Text>
						<TextArea
							rows={3}
							value={customPrompt}
							onChange={(e) => setCustomPrompt(e.target.value)}
							placeholder="Enter custom prompt for translation style, tone, or specific instructions..."
							style={{ marginTop: 8 }}
						/>
						<Text type="secondary" style={{ fontSize: 12 }}>
							Leave empty to use default prompt: "Please translate the following
							text from English to Vietnamese, maintaining the narrative style
							and character names"
						</Text>
					</div>
				</Space>
			</Card>

			<Card
				title={`Chapters (${chapters.length})`}
				extra={
					<Space>
						<Button size="small" onClick={handleSelectUntranslated}>
							Select Untranslated
						</Button>
						<Button size="small" onClick={handleSelectAll}>
							{selectedChapterIds.length === chapters.length
								? 'Deselect All'
								: 'Select All'}
						</Button>
					</Space>
				}
				style={{ marginBottom: 16 }}
			>
				<Table
					columns={columns}
					dataSource={chapters}
					rowKey="id"
					pagination={{ pageSize: 10 }}
					size="small"
				/>
			</Card>

			<Card title="Translation Progress">
				<Space direction="vertical" style={{ width: '100%' }} size="large">
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
						}}
					>
						<Text>
							Selected Chapters: <Text strong>{selectedChapterIds.length}</Text>
						</Text>
						<Button
							type="primary"
							icon={<PlayCircleOutlined />}
							loading={isTranslating}
							onClick={handleTranslate}
							disabled={!selectedLMStudioId || selectedChapterIds.length === 0}
							size="large"
						>
							{isTranslating ? 'Translating...' : 'Start Translation'}
						</Button>
					</div>

					{isTranslating && (
						<div>
							<Progress
								percent={
									translationProgress.total > 0
										? Math.round(
												(translationProgress.current /
													translationProgress.total) *
													100,
											)
										: 0
								}
								status="active"
								format={() =>
									`${translationProgress.current}/${translationProgress.total}`
								}
							/>
							<Text type="secondary">
								Translating chapters... This may take a while depending on
								content length.
							</Text>
						</div>
					)}

					{translationProgress.results.length > 0 && (
						<div>
							<Divider />
							<Title level={4}>Translation Results</Title>
							<Space wrap>
								<Tag color="green">
									<CheckCircleOutlined /> Successful:{' '}
									{translationProgress.results.filter((r) => r.success).length}
								</Tag>
								<Tag color="red">
									<CloseCircleOutlined /> Failed:{' '}
									{translationProgress.results.filter((r) => !r.success).length}
								</Tag>
							</Space>

							{translationProgress.results.some((r) => !r.success) && (
								<div style={{ marginTop: 8 }}>
									<Text type="secondary">Failed chapters:</Text>
									{translationProgress.results
										.filter((r) => !r.success)
										.map((result) => {
											const chapter = chapters.find(
												(c) => c.id === result.chapterId,
											);
											return (
												<div
													key={result.chapterId}
													style={{ marginLeft: 16, color: '#ff4d4f' }}
												>
													Chapter {chapter?.order}: {result.error}
												</div>
											);
										})}
								</div>
							)}
						</div>
					)}
				</Space>
			</Card>

			<Modal
				title="Chapter Preview"
				open={previewModalVisible}
				onCancel={() => {
					setPreviewModalVisible(false);
					setPreviewChapter(null);
				}}
				width={900}
				footer={[
					<Button key="close" onClick={() => setPreviewModalVisible(false)}>
						Close
					</Button>,
				]}
			>
				{previewChapter && (
					<div>
						<Card title="Original Content" style={{ marginBottom: 16 }}>
							<TextArea value={previewChapter.rawContent} rows={6} readOnly />
						</Card>

						<Card
							title="Vietnamese Translation"
							extra={
								<Tag
									color={previewChapter.vietnameseContent ? 'green' : 'orange'}
								>
									{previewChapter.vietnameseContent
										? 'Available'
										: 'Not Translated'}
								</Tag>
							}
						>
							<TextArea
								value={previewChapter.vietnameseContent || 'Not yet translated'}
								rows={6}
								readOnly
								style={{
									backgroundColor: previewChapter.vietnameseContent
										? undefined
										: '#f5f5f5',
									color: previewChapter.vietnameseContent ? undefined : '#999',
								}}
							/>
						</Card>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default TranslateComponent;
