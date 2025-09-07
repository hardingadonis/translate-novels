import type { Chapter } from '../App';
import {
	CheckCircleOutlined,
	DownloadOutlined,
	ReloadOutlined,
} from '@ant-design/icons';
import { Alert, Button, Card, Divider, Space, Tag, Typography } from 'antd';

const { Title, Text } = Typography;

interface ExportResultsProps {
	chapters: Chapter[];
	fileName: string;
	translationPrompt: string;
	onStartNew: () => void;
}

const ExportResults = ({
	chapters,
	fileName,
	translationPrompt,
	onStartNew,
}: ExportResultsProps) => {
	const completedChapters = chapters.filter((ch) => ch.status === 'done');
	const failedChapters = chapters.filter((ch) => ch.status === 'failed');

	const generateExportContent = (): string => {
		const header = [
			`Novel Translation Export`,
			`Original File: ${fileName}`,
			`Translation Date: ${new Date().toLocaleDateString()}`,
			`Translation Prompt: ${translationPrompt}`,
			`Total Chapters: ${chapters.length}`,
			`Successfully Translated: ${completedChapters.length}`,
			`Failed Translations: ${failedChapters.length}`,
			'',
			'='.repeat(50),
			'',
		].join('\n');

		const content = chapters
			.filter((ch) => ch.status === 'done' && ch.translatedContent)
			.map((chapter, index) => {
				return [
					`Chapter ${index + 1}: ${chapter.title}`,
					'-'.repeat(30),
					'',
					chapter.translatedContent || '',
					'',
					'',
				].join('\n');
			})
			.join('\n');

		return header + content;
	};

	const handleDownload = () => {
		const content = generateExportContent();
		const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);

		const link = document.createElement('a');
		link.href = url;
		link.download = `${fileName.replace('.txt', '')}_translated.txt`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	};

	const getWordCount = (text: string): number => {
		return text.trim().split(/\s+/).length;
	};

	const getTotalTranslatedWords = (): number => {
		return completedChapters.reduce((total, chapter) => {
			return total + getWordCount(chapter.translatedContent || '');
		}, 0);
	};

	const getTotalOriginalWords = (): number => {
		return chapters.reduce((total, chapter) => {
			return total + getWordCount(chapter.content);
		}, 0);
	};

	return (
		<Card
			title="Translation Complete!"
			extra={
				<CheckCircleOutlined style={{ color: '#52c41a', fontSize: '24px' }} />
			}
		>
			<Alert
				message="Translation Finished"
				description="Your novel has been successfully translated! Review the statistics below and download the translated file."
				type="success"
				showIcon
				style={{ marginBottom: 24 }}
			/>

			<div style={{ marginBottom: 24 }}>
				<Title level={3}>Translation Statistics</Title>

				<div
					style={{
						background: '#f5f5f5',
						padding: '16px',
						borderRadius: '8px',
						marginBottom: '16px',
					}}
				>
					<Space direction="vertical" style={{ width: '100%' }}>
						<div>
							<Text strong>Original File:</Text> {fileName}
						</div>
						<div>
							<Text strong>Total Chapters:</Text> {chapters.length}
						</div>
						<div>
							<Text strong>Translation Status:</Text>
							<Space style={{ marginLeft: 8 }}>
								<Tag color="success">{completedChapters.length} Completed</Tag>
								<Tag color="error">{failedChapters.length} Failed</Tag>
							</Space>
						</div>
						<div>
							<Text strong>Original Word Count:</Text>{' '}
							{getTotalOriginalWords().toLocaleString()} words
						</div>
						<div>
							<Text strong>Translated Word Count:</Text>{' '}
							{getTotalTranslatedWords().toLocaleString()} words
						</div>
						<div>
							<Text strong>Success Rate:</Text>{' '}
							{Math.round((completedChapters.length / chapters.length) * 100)}%
						</div>
					</Space>
				</div>
			</div>

			{failedChapters.length > 0 && (
				<Alert
					message="Some Chapters Failed"
					description={`${failedChapters.length} chapters failed to translate. These chapters will be excluded from the export. You can go back and retry failed chapters if needed.`}
					type="warning"
					style={{ marginBottom: 24 }}
				/>
			)}

			<Divider />

			<div style={{ marginBottom: 24 }}>
				<Title level={4}>Translation Prompt Used</Title>
				<div
					style={{
						background: '#f5f5f5',
						padding: '12px',
						borderRadius: '4px',
						fontSize: '12px',
						whiteSpace: 'pre-wrap',
					}}
				>
					{translationPrompt}
				</div>
			</div>

			<div style={{ marginBottom: 24 }}>
				<Title level={4}>Chapter Preview</Title>
				<div
					style={{
						maxHeight: '200px',
						overflowY: 'auto',
						border: '1px solid #d9d9d9',
						borderRadius: '6px',
						padding: '12px',
					}}
				>
					{completedChapters.slice(0, 3).map((chapter, index) => (
						<div key={chapter.id} style={{ marginBottom: '16px' }}>
							<Text strong>
								#{index + 1} {chapter.title}
							</Text>
							<div
								style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}
							>
								{chapter.translatedContent?.substring(0, 150)}...
							</div>
							{index < 2 && <Divider />}
						</div>
					))}
					{completedChapters.length > 3 && (
						<Text type="secondary">
							...and {completedChapters.length - 3} more chapters
						</Text>
					)}
				</div>
			</div>

			<Space size="large">
				<Button
					type="primary"
					icon={<DownloadOutlined />}
					onClick={handleDownload}
					size="large"
					disabled={completedChapters.length === 0}
				>
					Download Translated Novel ({completedChapters.length} chapters)
				</Button>
				<Button icon={<ReloadOutlined />} onClick={onStartNew} size="large">
					Start New Translation
				</Button>
			</Space>
		</Card>
	);
};

export default ExportResults;
