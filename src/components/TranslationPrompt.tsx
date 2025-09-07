import { ArrowLeftOutlined, MessageOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Input, Space, Typography } from 'antd';
import { useState } from 'react';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface TranslationPromptProps {
	onPromptSet: (prompt: string) => void;
	onPrevious: () => void;
}

const TranslationPrompt = ({
	onPromptSet,
	onPrevious,
}: TranslationPromptProps) => {
	const [prompt, setPrompt] = useState(
		'Translate this novel chapter from English to Vietnamese. Maintain the original style, tone, and meaning. Keep character names and proper nouns in their original form unless they have established Vietnamese translations.',
	);

	const predefinedPrompts = [
		{
			label: 'Standard Translation',
			value:
				'Translate this novel chapter from English to Vietnamese. Maintain the original style, tone, and meaning. Keep character names and proper nouns in their original form unless they have established Vietnamese translations.',
		},
		{
			label: 'Literary Translation',
			value:
				'Translate this novel chapter from English to Vietnamese with a literary and elegant style. Pay attention to the nuances of language, metaphors, and cultural context. Adapt idioms and expressions to Vietnamese equivalents where appropriate.',
		},
		{
			label: 'Casual Translation',
			value:
				'Translate this novel chapter from English to Vietnamese using a casual, modern Vietnamese style. Make it sound natural and easy to read for contemporary Vietnamese readers.',
		},
		{
			label: 'Formal Translation',
			value:
				'Translate this novel chapter from English to Vietnamese using formal, academic Vietnamese. Maintain precision and clarity in the translation.',
		},
	];

	const handlePromptSelect = (selectedPrompt: string) => {
		setPrompt(selectedPrompt);
	};

	const handleConfirm = () => {
		if (prompt.trim()) {
			onPromptSet(prompt.trim());
		}
	};

	return (
		<Card title="Translation Instructions" extra={<MessageOutlined />}>
			<Alert
				message="Configure Translation Prompt"
				description="This prompt will be sent to LM Studio along with each chapter to guide the translation process. Choose a predefined prompt or write your own custom instructions."
				type="info"
				style={{ marginBottom: 24 }}
			/>

			<div style={{ marginBottom: 24 }}>
				<Title level={4}>Predefined Prompts</Title>
				<Space direction="vertical" style={{ width: '100%' }}>
					{predefinedPrompts.map((item, index) => (
						<Button
							key={index}
							type={prompt === item.value ? 'primary' : 'default'}
							onClick={() => handlePromptSelect(item.value)}
							block
							style={{
								textAlign: 'left',
								height: 'auto',
								padding: '12px 16px',
							}}
						>
							<div>
								<Text strong>{item.label}</Text>
								<br />
								<Text type="secondary" style={{ fontSize: '12px' }}>
									{item.value.substring(0, 100)}...
								</Text>
							</div>
						</Button>
					))}
				</Space>
			</div>

			<div style={{ marginBottom: 24 }}>
				<Title level={4}>Custom Translation Prompt</Title>
				<TextArea
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder="Enter your custom translation instructions..."
					rows={6}
					showCount
					maxLength={2000}
				/>
			</div>

			<div style={{ marginBottom: 16 }}>
				<Alert
					message="Preview"
					description={
						<div style={{ marginTop: 8 }}>
							<Text strong>Current prompt:</Text>
							<div
								style={{
									background: '#f5f5f5',
									padding: '12px',
									marginTop: '8px',
									borderRadius: '4px',
									fontSize: '12px',
									whiteSpace: 'pre-wrap',
								}}
							>
								{prompt}
							</div>
						</div>
					}
					type="success"
				/>
			</div>

			<Space>
				<Button icon={<ArrowLeftOutlined />} onClick={onPrevious} size="large">
					Previous
				</Button>
				<Button
					type="primary"
					onClick={handleConfirm}
					disabled={!prompt.trim()}
					size="large"
				>
					Set Prompt & Continue
				</Button>
			</Space>
		</Card>
	);
};

export default TranslationPrompt;
