import { Card, Layout, Steps, message } from 'antd';
import { useEffect, useState } from 'react';

import APIConfiguration from './components/APIConfiguration';
import ChapterSplitting from './components/ChapterSplitting';
import ExportResults from './components/ExportResults';
import FileUpload from './components/FileUpload';
import TranslationProgress from './components/TranslationProgress';
import TranslationPrompt from './components/TranslationPrompt';

const { Header, Content } = Layout;

export interface Chapter {
	id: number;
	title: string;
	content: string;
	translatedContent?: string;
	status: 'pending' | 'processing' | 'done' | 'failed';
}

const App = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const [apiEndpoint, setApiEndpoint] = useState('');
	const [fileContent, setFileContent] = useState('');
	const [fileName, setFileName] = useState('');
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [translationPrompt, setTranslationPrompt] = useState('');
	const [isTranslating, setIsTranslating] = useState(false);

	useEffect(() => {
		// Load saved API endpoint from localStorage
		const savedEndpoint = localStorage.getItem('lm-studio-endpoint');
		if (savedEndpoint) {
			setApiEndpoint(savedEndpoint);
		}
	}, []);

	const handleAPIConfigured = (endpoint: string) => {
		setApiEndpoint(endpoint);
		setCurrentStep(1);
		message.success('API endpoint configured successfully');
	};

	const handleFileUploaded = (content: string, filename: string) => {
		setFileContent(content);
		setFileName(filename);
		setCurrentStep(2);
		message.success('File uploaded successfully');
	};

	const handleChaptersSplit = (splitChapters: Chapter[]) => {
		setChapters(splitChapters);
		setCurrentStep(3);
		message.success(`Novel split into ${splitChapters.length} chapters`);
	};

	const handlePromptSet = (prompt: string) => {
		setTranslationPrompt(prompt);
		setCurrentStep(4);
		message.success('Translation prompt set');
	};

	const handleTranslationComplete = () => {
		setCurrentStep(5);
		message.success('Translation completed successfully');
	};

	const steps = [
		{
			title: 'API Configuration',
			description: 'Configure LM Studio endpoint',
		},
		{
			title: 'Upload File',
			description: 'Upload your novel .txt file',
		},
		{
			title: 'Split Chapters',
			description: 'Automatically split into chapters',
		},
		{
			title: 'Set Prompt',
			description: 'Configure translation instructions',
		},
		{
			title: 'Translate',
			description: 'Translate chapters one by one',
		},
		{
			title: 'Export',
			description: 'Download translated novel',
		},
	];

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 0:
				return (
					<APIConfiguration
						currentEndpoint={apiEndpoint}
						onConfigured={handleAPIConfigured}
					/>
				);
			case 1:
				return <FileUpload onFileUploaded={handleFileUploaded} />;
			case 2:
				return (
					<ChapterSplitting
						fileContent={fileContent}
						onChaptersSplit={handleChaptersSplit}
					/>
				);
			case 3:
				return (
					<TranslationPrompt
						onPromptSet={handlePromptSet}
						onPrevious={() => setCurrentStep(2)}
					/>
				);
			case 4:
				return (
					<TranslationProgress
						chapters={chapters}
						setChapters={setChapters}
						apiEndpoint={apiEndpoint}
						translationPrompt={translationPrompt}
						isTranslating={isTranslating}
						setIsTranslating={setIsTranslating}
						onTranslationComplete={handleTranslationComplete}
						onPrevious={() => setCurrentStep(3)}
					/>
				);
			case 5:
				return (
					<ExportResults
						chapters={chapters}
						fileName={fileName}
						translationPrompt={translationPrompt}
						onStartNew={() => {
							setCurrentStep(0);
							setFileContent('');
							setFileName('');
							setChapters([]);
							setTranslationPrompt('');
							setIsTranslating(false);
						}}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Header style={{ background: '#fff', padding: '0 24px' }}>
				<h1 style={{ margin: 0, color: '#1890ff' }}>Novel Translator</h1>
			</Header>
			<Content style={{ padding: '24px' }}>
				<Card>
					<Steps current={currentStep} items={steps} />
				</Card>
				<div style={{ marginTop: '24px' }}>{renderCurrentStep()}</div>
			</Content>
		</Layout>
	);
};

export default App;
