import type { Chapter } from '../App';
import { ReloadOutlined, SplitCellsOutlined } from '@ant-design/icons';
import {
	Alert,
	Button,
	Card,
	Divider,
	Input,
	List,
	Space,
	Tag,
	Typography,
} from 'antd';
import { useEffect, useState } from 'react';

const { TextArea } = Input;
const { Text, Title } = Typography;

interface ChapterSplittingProps {
	fileContent: string;
	onChaptersSplit: (chapters: Chapter[]) => void;
}

const ChapterSplitting = ({
	fileContent,
	onChaptersSplit,
}: ChapterSplittingProps) => {
	const [keywords, setKeywords] = useState('Chapter,CHAPTER,Chương,CHƯƠNG');
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [isProcessing, setIsProcessing] = useState(false);

	const splitIntoChapters = (
		content: string,
		chapterKeywords: string[],
	): Chapter[] => {
		const keywordPattern = chapterKeywords.map((k) => k.trim()).join('|');
		const regex = new RegExp(`^\\s*(${keywordPattern})\\s*\\d+`, 'gmi');

		const matches: { index: number; match: string }[] = [];
		let match;

		while ((match = regex.exec(content)) !== null) {
			matches.push({
				index: match.index,
				match: match[0],
			});
		}

		if (matches.length === 0) {
			// If no chapters found, treat the whole content as one chapter
			return [
				{
					id: 1,
					title: 'Full Content',
					content: content.trim(),
					status: 'pending' as const,
				},
			];
		}

		const splitChapters: Chapter[] = [];

		for (let i = 0; i < matches.length; i++) {
			const currentMatch = matches[i];
			const nextMatch = matches[i + 1];

			const startIndex = currentMatch.index;
			const endIndex = nextMatch ? nextMatch.index : content.length;

			const chapterContent = content.substring(startIndex, endIndex).trim();
			const firstLine = chapterContent.split('\n')[0].trim();

			splitChapters.push({
				id: i + 1,
				title: firstLine || `Chapter ${i + 1}`,
				content: chapterContent,
				status: 'pending' as const,
			});
		}

		return splitChapters;
	};

	const handleSplit = async () => {
		setIsProcessing(true);

		// Add a small delay to show processing state
		setTimeout(() => {
			const keywordArray = keywords
				.split(',')
				.filter((k) => k.trim().length > 0);
			const splitChapters = splitIntoChapters(fileContent, keywordArray);
			setChapters(splitChapters);
			setIsProcessing(false);
		}, 500);
	};

	const handleConfirm = () => {
		onChaptersSplit(chapters);
	};

	const getWordCount = (text: string): number => {
		return text.trim().split(/\s+/).length;
	};

	useEffect(() => {
		// Auto-split on component mount
		const keywordArray = keywords.split(',').filter((k) => k.trim().length > 0);
		const splitChapters = splitIntoChapters(fileContent, keywordArray);
		setChapters(splitChapters);
	}, [fileContent, keywords]);

	return (
		<Card title="Chapter Splitting" extra={<SplitCellsOutlined />}>
			<Alert
				message="Automatic Chapter Detection"
				description="The system will automatically detect chapters based on common keywords. You can customize the keywords and re-split if needed."
				type="info"
				style={{ marginBottom: 24 }}
			/>

			<div style={{ marginBottom: 24 }}>
				<Text strong>Chapter Keywords (comma-separated):</Text>
				<TextArea
					value={keywords}
					onChange={(e) => setKeywords(e.target.value)}
					placeholder="Chapter,CHAPTER,Chương,CHƯƠNG"
					rows={2}
					style={{ marginTop: 8 }}
				/>
				<Button
					type="primary"
					icon={<ReloadOutlined />}
					onClick={handleSplit}
					loading={isProcessing}
					style={{ marginTop: 8 }}
				>
					Re-split Chapters
				</Button>
			</div>

			{chapters.length > 0 && (
				<>
					<Divider />
					<div style={{ marginBottom: 16 }}>
						<Title level={4}>
							Detected Chapters ({chapters.length})
							<Tag color="blue" style={{ marginLeft: 8 }}>
								Total Words:{' '}
								{chapters
									.reduce((sum, ch) => sum + getWordCount(ch.content), 0)
									.toLocaleString()}
							</Tag>
						</Title>
					</div>

					<List
						dataSource={chapters}
						renderItem={(chapter, index) => (
							<List.Item key={chapter.id}>
								<List.Item.Meta
									title={
										<Space>
											<Text strong>#{index + 1}</Text>
											<Text>{chapter.title}</Text>
											<Tag>{getWordCount(chapter.content)} words</Tag>
										</Space>
									}
									description={
										<div style={{ marginTop: 8 }}>
											<Text
												style={{
													display: 'block',
													maxHeight: '60px',
													overflow: 'hidden',
													fontSize: '12px',
													color: '#666',
													whiteSpace: 'pre-wrap',
												}}
											>
												{chapter.content.substring(0, 200)}
												{chapter.content.length > 200 ? '...' : ''}
											</Text>
										</div>
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

					<div style={{ marginTop: 24, textAlign: 'center' }}>
						<Button
							type="primary"
							size="large"
							onClick={handleConfirm}
							disabled={chapters.length === 0}
						>
							Confirm Chapter Split ({chapters.length} chapters)
						</Button>
					</div>
				</>
			)}
		</Card>
	);
};

export default ChapterSplitting;
