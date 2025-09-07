import {
	ArrowLeftOutlined,
	CheckCircleOutlined,
	ExclamationCircleOutlined,
	PauseCircleOutlined,
	PlayCircleOutlined,
} from '@ant-design/icons';
import {
	Alert,
	Button,
	Card,
	List,
	Progress,
	Space,
	Tag,
	Typography,
	message,
} from 'antd';
import axios from 'axios';
import { useRef, useState } from 'react';

import type { Chapter } from '@/App';

const { Text, Title } = Typography;

interface TranslationProgressProps {
	chapters: Chapter[];
	setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
	apiEndpoint: string;
	translationPrompt: string;
	isTranslating: boolean;
	setIsTranslating: React.Dispatch<React.SetStateAction<boolean>>;
	onTranslationComplete: () => void;
	onPrevious: () => void;
}

const TranslationProgress = ({
	chapters,
	setChapters,
	apiEndpoint,
	translationPrompt,
	isTranslating,
	setIsTranslating,
	onTranslationComplete,
	onPrevious,
}: TranslationProgressProps) => {
	const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
	const shouldStop = useRef(false);

	const getStatusIcon = (status: Chapter['status']) => {
		switch (status) {
			case 'done':
				return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
			case 'failed':
				return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />;
			case 'processing':
				return <PlayCircleOutlined style={{ color: '#1890ff' }} spin />;
			default:
				return null;
		}
	};

	const getStatusColor = (status: Chapter['status']) => {
		switch (status) {
			case 'done':
				return 'success';
			case 'failed':
				return 'error';
			case 'processing':
				return 'processing';
			default:
				return 'default';
		}
	};

	const translateChapter = async (
		chapter: Chapter,
		index: number,
	): Promise<string> => {
		try {
			const fullPrompt = `${translationPrompt}\n\nChapter content to translate:\n\n${chapter.content}`;

			// Make a POST request to the LM Studio chat completions endpoint
			const response = await axios.post(
				`${apiEndpoint}/v1/chat/completions`,
				{
					model: 'local', // LM Studio uses 'local' as the model identifier
					messages: [
						{
							role: 'user',
							content: fullPrompt,
						},
					],
					temperature: 0.7,
					stream: false, // We'll use non-streaming for simplicity
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
					timeout: 300000, // 5 minute timeout for long translations
				},
			);

			if (response.data && response.data.choices && response.data.choices[0]) {
				const translatedText = response.data.choices[0].message.content;
				return translatedText.trim();
			} else {
				throw new Error('Invalid response format from LM Studio API');
			}
		} catch (error) {
			console.error(`Error translating chapter ${index + 1}:`, error);

			// Provide more specific error messages
			if (axios.isAxiosError(error)) {
				if (error.code === 'ECONNREFUSED') {
					throw new Error(
						'Cannot connect to LM Studio. Please ensure LM Studio is running and the API server is started.',
					);
				} else if (error.response?.status === 404) {
					throw new Error(
						'LM Studio API endpoint not found. Please check if a model is loaded in LM Studio.',
					);
				} else if (error.response && error.response.status >= 500) {
					throw new Error(
						'LM Studio server error. Please check the model and try again.',
					);
				}
			}

			throw error;
		}
	};

	const startTranslation = async () => {
		shouldStop.current = false;
		setIsTranslating(true);

		try {
			for (let i = currentChapterIndex; i < chapters.length; i++) {
				if (shouldStop.current) {
					break;
				}

				// Skip already translated chapters
				if (chapters[i].status === 'done') {
					continue;
				}

				setCurrentChapterIndex(i);

				// Update chapter status to processing
				setChapters((prev) =>
					prev.map((ch, idx) =>
						idx === i ? { ...ch, status: 'processing' as const } : ch,
					),
				);

				try {
					const translatedContent = await translateChapter(chapters[i], i);

					// Update chapter with translation
					setChapters((prev) =>
						prev.map((ch, idx) =>
							idx === i
								? {
										...ch,
										translatedContent,
										status: 'done' as const,
									}
								: ch,
						),
					);

					message.success(`Chapter ${i + 1} translated successfully`);
				} catch {
					// Update chapter status to failed
					setChapters((prev) =>
						prev.map((ch, idx) =>
							idx === i ? { ...ch, status: 'failed' as const } : ch,
						),
					);

					message.error(`Failed to translate Chapter ${i + 1}`);
				}

				// Add a small delay between chapters to avoid overwhelming the API
				if (i < chapters.length - 1) {
					await new Promise((resolve) => setTimeout(resolve, 1000));
				}
			}

			// Check if all chapters are done
			const allDone = chapters.every((ch) => ch.status === 'done');
			if (allDone && !shouldStop.current) {
				onTranslationComplete();
			}
		} catch {
			message.error('Translation process encountered an error');
		} finally {
			setIsTranslating(false);
		}
	};

	const stopTranslation = () => {
		shouldStop.current = true;
		setIsTranslating(false);
		message.info('Translation stopped');
	};

	const retryFailedChapter = async (index: number) => {
		const chapter = chapters[index];
		if (chapter.status !== 'failed') return;

		try {
			setChapters((prev) =>
				prev.map((ch, idx) =>
					idx === index ? { ...ch, status: 'processing' as const } : ch,
				),
			);

			const translatedContent = await translateChapter(chapter, index);

			setChapters((prev) =>
				prev.map((ch, idx) =>
					idx === index
						? {
								...ch,
								translatedContent,
								status: 'done' as const,
							}
						: ch,
				),
			);

			message.success(`Chapter ${index + 1} retried successfully`);
		} catch {
			setChapters((prev) =>
				prev.map((ch, idx) =>
					idx === index ? { ...ch, status: 'failed' as const } : ch,
				),
			);
			message.error(`Failed to retry Chapter ${index + 1}`);
		}
	};

	const completedChapters = chapters.filter(
		(ch) => ch.status === 'done',
	).length;
	const failedChapters = chapters.filter((ch) => ch.status === 'failed').length;
	const progressPercent =
		chapters.length > 0 ? (completedChapters / chapters.length) * 100 : 0;

	return (
		<Card title="Translation Progress" extra={<PlayCircleOutlined />}>
			<Alert
				message="Chapter-by-Chapter Translation"
				description="Chapters will be translated one by one to avoid overwhelming the model. You can stop and resume the process at any time."
				type="info"
				style={{ marginBottom: 24 }}
			/>

			<div style={{ marginBottom: 24 }}>
				<Title level={4}>Overall Progress</Title>
				<Progress
					percent={Math.round(progressPercent)}
					status={isTranslating ? 'active' : 'normal'}
					format={() => `${completedChapters}/${chapters.length} chapters`}
				/>
				<div style={{ marginTop: 8 }}>
					<Space>
						<Tag color="success">{completedChapters} Completed</Tag>
						<Tag color="error">{failedChapters} Failed</Tag>
						<Tag color="default">
							{chapters.length - completedChapters - failedChapters} Pending
						</Tag>
					</Space>
				</div>
			</div>

			<List
				dataSource={chapters}
				renderItem={(chapter, index) => (
					<List.Item
						key={chapter.id}
						actions={
							chapter.status === 'failed'
								? [
										<Button
											size="small"
											type="link"
											onClick={() => retryFailedChapter(index)}
											disabled={isTranslating}
										>
											Retry
										</Button>,
									]
								: []
						}
					>
						<List.Item.Meta
							avatar={getStatusIcon(chapter.status)}
							title={
								<Space>
									<Text strong>#{index + 1}</Text>
									<Text>{chapter.title}</Text>
									<Tag color={getStatusColor(chapter.status)}>
										{chapter.status.toUpperCase()}
									</Tag>
									{index === currentChapterIndex && isTranslating && (
										<Tag color="processing">CURRENT</Tag>
									)}
								</Space>
							}
							description={
								chapter.status === 'done' && chapter.translatedContent ? (
									<div style={{ marginTop: 8 }}>
										<Text type="secondary" style={{ fontSize: '12px' }}>
											Translation preview:{' '}
											{chapter.translatedContent.substring(0, 100)}...
										</Text>
									</div>
								) : (
									<Text type="secondary" style={{ fontSize: '12px' }}>
										{chapter.content.substring(0, 100)}...
									</Text>
								)
							}
						/>
					</List.Item>
				)}
				style={{
					maxHeight: '400px',
					overflowY: 'auto',
					border: '1px solid #d9d9d9',
					borderRadius: '6px',
					padding: '8px',
				}}
			/>

			<div style={{ marginTop: 24 }}>
				<Space>
					<Button
						icon={<ArrowLeftOutlined />}
						onClick={onPrevious}
						disabled={isTranslating}
						size="large"
					>
						Previous
					</Button>
					{!isTranslating ? (
						<Button
							type="primary"
							icon={<PlayCircleOutlined />}
							onClick={startTranslation}
							size="large"
							disabled={completedChapters === chapters.length}
						>
							{completedChapters > 0
								? 'Resume Translation'
								: 'Start Translation'}
						</Button>
					) : (
						<Button
							danger
							icon={<PauseCircleOutlined />}
							onClick={stopTranslation}
							size="large"
						>
							Stop Translation
						</Button>
					)}
					{completedChapters === chapters.length && (
						<Button type="primary" onClick={onTranslationComplete} size="large">
							Continue to Export
						</Button>
					)}
				</Space>
			</div>
		</Card>
	);
};

export default TranslationProgress;
