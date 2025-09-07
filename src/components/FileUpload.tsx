import { FileTextOutlined, InboxOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Spin, Typography, Upload } from 'antd';
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
	} | null>(null);

	const readFileContent = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = (e) => {
				const content = e.target?.result as string;
				resolve(content);
			};
			reader.onerror = () => reject(new Error('Failed to read file'));
			reader.readAsText(file, 'utf-8');
		});
	};

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const handleFileChange: UploadProps['onChange'] = async (info) => {
		const { file } = info;

		if (file.status === 'uploading') {
			setLoading(true);
			return;
		}

		if (file.originFileObj) {
			try {
				setLoading(true);
				const content = await readFileContent(file.originFileObj);

				const preview =
					content.length > 500 ? content.substring(0, 500) + '...' : content;

				setFileInfo({
					name: file.name,
					size: file.size || 0,
					preview: preview,
				});

				setLoading(false);
			} catch (error) {
				console.error('Error reading file:', error);
				setLoading(false);
			}
		}
	};

	const handleConfirmUpload = async () => {
		if (fileInfo && fileInfo.name) {
			// Re-read the full file content for processing
			const fileInput = document.querySelector(
				'input[type="file"]',
			) as HTMLInputElement;
			if (fileInput?.files?.[0]) {
				setLoading(true);
				try {
					const fullContent = await readFileContent(fileInput.files[0]);
					onFileUploaded(fullContent, fileInfo.name);
				} catch (error) {
					console.error('Error reading full file:', error);
				}
				setLoading(false);
			}
		}
	};

	const uploadProps: UploadProps = {
		name: 'file',
		multiple: false,
		accept: '.txt',
		beforeUpload: () => false, // Prevent automatic upload
		onChange: handleFileChange,
		showUploadList: false,
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
						<Button type="primary" onClick={handleConfirmUpload}>
							Confirm & Continue
						</Button>
					}
				>
					<div style={{ marginBottom: 16 }}>
						<Text strong>Filename:</Text> {fileInfo.name}
						<br />
						<Text strong>Size:</Text> {formatFileSize(fileInfo.size)}
						<br />
						<Text strong>Characters:</Text>{' '}
						{fileInfo.preview.length > 500
							? '500+ (preview)'
							: fileInfo.preview.length}
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
