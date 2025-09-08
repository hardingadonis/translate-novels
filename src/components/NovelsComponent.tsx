'use client';

import {
	DeleteOutlined,
	EditOutlined,
	EyeOutlined,
	PlusOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Divider,
	Form,
	Input,
	Modal,
	Popconfirm,
	Space,
	Table,
	Typography,
	Upload,
	message,
} from 'antd';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';

import axiosInstance from '@/lib/axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Novel {
	id: number;
	title: string;
	chapters?: Chapter[];
}

interface Chapter {
	id: number;
	rawContent: string;
	vietnameseContent?: string;
	order: number;
	novelId: number;
}

interface ParsedChapter {
	content: string;
	order: number;
}

const NovelsComponent: React.FC = () => {
	const [novels, setNovels] = useState<Novel[]>([]);
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [uploadModalVisible, setUploadModalVisible] = useState(false);
	const [previewModalVisible, setPreviewModalVisible] = useState(false);
	const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
	const [parsedChapters, setParsedChapters] = useState<ParsedChapter[]>([]);
	const [selectedNovelForUpload, setSelectedNovelForUpload] = useState<
		number | null
	>(null);
	const [fileContent, setFileContent] = useState<string>('');
	const [form] = Form.useForm();
	const [uploadForm] = Form.useForm();

	useEffect(() => {
		fetchNovels();
	}, []);

	const fetchNovels = async () => {
		setLoading(true);
		try {
			const response = await axiosInstance.get('/api/novels');
			setNovels(response.data);
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(
					`Failed to fetch novels: ${error.response?.statusText || error.message}`,
				);
			} else {
				message.error('Error fetching novels');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleCreateOrUpdate = async (values: { title: string }) => {
		try {
			const method = editingNovel ? 'put' : 'post';
			const data = editingNovel
				? { id: editingNovel.id, title: values.title }
				: { title: values.title };

			await axiosInstance[method]('/api/novels', data);

			message.success(
				`Novel ${editingNovel ? 'updated' : 'created'} successfully`,
			);
			setModalVisible(false);
			setEditingNovel(null);
			form.resetFields();
			fetchNovels();
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(
					`Failed to ${editingNovel ? 'update' : 'create'} novel: ${error.response?.statusText || error.message}`,
				);
			} else {
				message.error(`Error ${editingNovel ? 'updating' : 'creating'} novel`);
			}
		}
	};

	const handleDelete = async (id: number) => {
		try {
			await axiosInstance.delete('/api/novels', { data: { id } });
			message.success('Novel deleted successfully');
			fetchNovels();
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(
					`Failed to delete novel: ${error.response?.statusText || error.message}`,
				);
			} else {
				message.error('Error deleting novel');
			}
		}
	};

	const handleFileUpload = (file: File): Promise<false> => {
		return new Promise((resolve) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				const content = e.target?.result as string;
				if (content) {
					setFileContent(content);
					parseChapters(content).finally(() => {
						resolve(false);
					});
				} else {
					message.error('File content is empty');
					resolve(false);
				}
			};

			reader.onerror = () => {
				message.error('Failed to read file');
				resolve(false);
			};

			if (!file.name.toLowerCase().endsWith('.txt')) {
				message.error('Please select a .txt file');
				resolve(false);
				return;
			}

			reader.readAsText(file);
		});
	};

	const parseChapters = async (content: string) => {
		try {
			const response = await axiosInstance.post('/api/parse-chapters', {
				text: content,
			});
			setParsedChapters(response.data.chapters);
			setPreviewModalVisible(true);
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(
					`Failed to parse chapters: ${error.response?.statusText || error.message}`,
				);
			} else {
				message.error('Error parsing chapters');
			}
		}
	};

	const handleSaveChapters = async () => {
		if (!selectedNovelForUpload || parsedChapters.length === 0) {
			message.error('No novel selected or no chapters parsed');
			return;
		}

		try {
			const chaptersData = parsedChapters.map((chapter, index) => ({
				rawContent: chapter.content,
				novelId: selectedNovelForUpload,
				order: index,
			}));

			await axiosInstance.post('/api/chapters', chaptersData);

			message.success('Chapters saved successfully');
			setUploadModalVisible(false);
			setPreviewModalVisible(false);
			setParsedChapters([]);
			setFileContent('');
			setSelectedNovelForUpload(null);
			uploadForm.resetFields();
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(
					`Failed to save chapters: ${error.response?.statusText || error.message}`,
				);
			} else {
				message.error('Error saving chapters');
			}
		}
	};

	const columns = [
		{
			title: 'ID',
			dataIndex: 'id',
			key: 'id',
			width: 80,
		},
		{
			title: 'Title',
			dataIndex: 'title',
			key: 'title',
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 200,
			render: (_: any, record: Novel) => (
				<Space size="small">
					<Button
						type="text"
						icon={<EyeOutlined />}
						onClick={() => {
							message.info(`Viewing chapters for: ${record.title}`);
						}}
					/>
					<Button
						type="text"
						icon={<EditOutlined />}
						onClick={() => {
							setEditingNovel(record);
							form.setFieldsValue({ title: record.title });
							setModalVisible(true);
						}}
					/>
					<Popconfirm
						title="Are you sure you want to delete this novel?"
						onConfirm={() => handleDelete(record.id)}
						okText="Yes"
						cancelText="No"
					>
						<Button type="text" icon={<DeleteOutlined />} danger />
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div>
			<div
				style={{
					marginBottom: 16,
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Title level={2}>Novels Management</Title>
				<Space>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						onClick={() => {
							setEditingNovel(null);
							form.resetFields();
							setModalVisible(true);
						}}
					>
						Add Novel
					</Button>
					<Button
						icon={<UploadOutlined />}
						onClick={() => {
							setUploadModalVisible(true);
						}}
					>
						Upload Chapters
					</Button>
				</Space>
			</div>

			<Table
				columns={columns}
				dataSource={novels}
				rowKey="id"
				loading={loading}
				pagination={{ pageSize: 10 }}
			/>

			<Modal
				title={editingNovel ? 'Edit Novel' : 'Add Novel'}
				open={modalVisible}
				onOk={() => form.submit()}
				onCancel={() => {
					setModalVisible(false);
					setEditingNovel(null);
					form.resetFields();
				}}
			>
				<Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
					<Form.Item
						name="title"
						label="Title"
						rules={[
							{ required: true, message: 'Please input the novel title!' },
						]}
					>
						<Input placeholder="Enter novel title" />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="Upload Chapters"
				open={uploadModalVisible}
				onCancel={() => {
					setUploadModalVisible(false);
					setParsedChapters([]);
					setFileContent('');
					setSelectedNovelForUpload(null);
					uploadForm.resetFields();
				}}
				footer={null}
				width={600}
			>
				<Form form={uploadForm} layout="vertical">
					<Form.Item
						name="novelId"
						label="Select Novel"
						rules={[{ required: true, message: 'Please select a novel!' }]}
					>
						<select
							style={{
								width: '100%',
								padding: '8px',
								borderRadius: '6px',
								border: '1px solid #d9d9d9',
							}}
							onChange={(e) =>
								setSelectedNovelForUpload(parseInt(e.target.value))
							}
							value={selectedNovelForUpload || ''}
						>
							<option value="">Select a novel...</option>
							{novels.map((novel) => (
								<option key={novel.id} value={novel.id}>
									{novel.title}
								</option>
							))}
						</select>
					</Form.Item>

					<Form.Item label="Upload Text File">
						<Upload
							beforeUpload={handleFileUpload}
							accept=".txt"
							maxCount={1}
							showUploadList={false}
						>
							<Button icon={<UploadOutlined />}>Select .txt File</Button>
						</Upload>
					</Form.Item>

					{fileContent && (
						<Form.Item>
							<Text type="secondary">
								File uploaded successfully. Click "Parse Chapters" to preview.
							</Text>
						</Form.Item>
					)}
				</Form>
			</Modal>

			<Modal
				title="Chapter Preview"
				open={previewModalVisible}
				onOk={handleSaveChapters}
				onCancel={() => {
					setPreviewModalVisible(false);
					setParsedChapters([]);
				}}
				width={800}
				okText="Save Chapters"
				cancelText="Cancel"
			>
				<div style={{ maxHeight: 400, overflowY: 'auto' }}>
					<Text strong>Found {parsedChapters.length} chapters:</Text>
					<Divider />
					{parsedChapters.map((chapter, index) => (
						<Card
							key={index}
							size="small"
							title={`Chapter ${index + 1}`}
							style={{ marginBottom: 16 }}
						>
							<TextArea
								value={chapter.content}
								onChange={(e) => {
									const updatedChapters = [...parsedChapters];
									updatedChapters[index] = {
										...chapter,
										content: e.target.value,
									};
									setParsedChapters(updatedChapters);
								}}
								rows={4}
							/>
						</Card>
					))}
				</div>
			</Modal>
		</div>
	);
};

export default NovelsComponent;
