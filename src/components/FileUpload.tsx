import { FileTextOutlined, InboxOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Spin, Typography, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { useState } from 'react';

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;

interface FileUploadProps {
	onFileUploaded: (content: string, filename: string) => void;
}

const FileUpload = ({ onFileUploaded }: FileUploadProps) => {
	const [loading, setLoading] = useState(false);
	const [fileInfo, setFileInfo] = useState<{
		name: string;
		size: number;
		preview: string;
		fullContent: string; // Store the full content
	} | null>(null);

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const handleFileChange: UploadProps['onChange'] = async (info) => {
		const { file } = info;

		// Use the file directly since beforeUpload: () => false
		const rawFile = file as unknown as File;

		if (!rawFile.name.toLowerCase().endsWith('.txt')) {
			message.error('Please select a .txt file only');
			return;
		}

		// Validate file size (10MB limit)
		const maxSize = 10 * 1024 * 1024; // 10MB in bytes
		if (rawFile.size > maxSize) {
			message.error('File size must be less than 10MB');
			return;
		}

		setLoading(true);
		message.loading('Reading file content...', 0);

		try {
			// Use modern File.text() API directly
			const content = await rawFile.text();

			// Validate content is not empty
			if (!content.trim()) {
				message.destroy();
				message.error('The selected file is empty');
				setLoading(false);
				return;
			}

			const preview =
				content.length > 500 ? content.substring(0, 500) + '...' : content;

			setFileInfo({
				name: rawFile.name,
				size: rawFile.size,
				preview: preview,
				fullContent: content, // Store the full content
			});

			message.destroy();
			message.success(`File "${rawFile.name}" loaded successfully!`);
		} catch (error) {
			console.error('Error reading file:', error);
			message.destroy();
			message.error('Failed to read file');
		} finally {
			setLoading(false);
		}
	};
	const handleClearFile = () => {
		setFileInfo(null);
		setLoading(false);
		message.success('File cleared. You can upload a new file.');
	};

	const handleConfirmUpload = () => {
		if (!fileInfo || !fileInfo.name || !fileInfo.fullContent) {
			message.error('No file selected');
			return;
		}

		// Use the stored content directly
		if (fileInfo.fullContent.trim()) {
			onFileUploaded(fileInfo.fullContent, fileInfo.name);
		} else {
			message.error('The selected file is empty');
		}
	};

	const uploadProps: UploadProps = {
		name: 'file',
		multiple: false,
		accept: '.txt',
		beforeUpload: () => false, // Prevent automatic upload, handle in onChange
		onChange: handleFileChange,
		showUploadList: false,
		maxCount: 1,
	};

	return (
		<Card title="Upload Novel File" extra={<FileTextOutlined />}>
			<Alert
				message="Upload your novel .txt file"
				description="Supported file size: up to 10MB. The file will be processed locally in your browser."
				type="info"
				style={{ marginBottom: 24 }}
			/>

			<Spin spinning={loading} tip="Processing file...">
				<Dragger {...uploadProps} style={{ marginBottom: 24 }}>
					<p className="ant-upload-drag-icon">
						<InboxOutlined />
					</p>
					<p className="ant-upload-text">
						Click or drag file to this area to upload
					</p>
					<p className="ant-upload-hint">
						Support for a single .txt file. Large files are supported and will
						be processed efficiently.
					</p>
				</Dragger>
			</Spin>

			{fileInfo && (
				<Card
					title="File Preview"
					size="small"
					style={{ marginBottom: 24 }}
					extra={
						<div style={{ display: 'flex', gap: '8px' }}>
							<Button onClick={handleClearFile}>Clear File</Button>
							<Button type="primary" onClick={handleConfirmUpload}>
								Confirm & Continue
							</Button>
						</div>
					}
				>
					<div style={{ marginBottom: 16 }}>
						<Text strong>Filename:</Text> {fileInfo.name}
						<br />
						<Text strong>Size:</Text> {formatFileSize(fileInfo.size)}
						<br />
						<Text strong>Characters:</Text>{' '}
						{fileInfo.fullContent.length.toLocaleString()} characters
						{fileInfo.preview.length < fileInfo.fullContent.length &&
							' (preview shown below)'}
					</div>

					<div>
						<Text strong>Content Preview:</Text>
						<Paragraph
							style={{
								background: '#f5f5f5',
								padding: '12px',
								marginTop: '8px',
								maxHeight: '200px',
								overflow: 'auto',
								whiteSpace: 'pre-wrap',
								fontFamily: 'monospace',
								fontSize: '12px',
							}}
						>
							{fileInfo.preview}
						</Paragraph>
					</div>
				</Card>
			)}
		</Card>
	);
};

export default FileUpload;
