'use client';

import {
	DeleteOutlined,
	DownloadOutlined,
	EditOutlined,
	EyeOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import {
	Button,
	Card,
	Divider,
	Form,
	Input,
	Modal,
	Popconfirm,
	Select,
	Space,
	Table,
	Tag,
	Typography,
	message,
} from 'antd';
import React, { useEffect, useState } from 'react';

const { Title, Text } = Typography;
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

const ChaptersComponent: React.FC = () => {
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [novels, setNovels] = useState<Novel[]>([]);
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [viewModalVisible, setViewModalVisible] = useState(false);
	const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
	const [viewingChapter, setViewingChapter] = useState<Chapter | null>(null);
	const [selectedNovelId, setSelectedNovelId] = useState<number | null>(null);
	const [form] = Form.useForm();

	useEffect(() => {
		fetchNovels();
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
				if (data.length > 0 && !selectedNovelId) {
					setSelectedNovelId(data[0].id);
				}
			} else {
				message.error('Failed to fetch novels');
			}
		} catch (error) {
			message.error('Error fetching novels');
		}
	};

	const fetchChapters = async (novelId: number) => {
		setLoading(true);
		try {
			const response = await fetch(`/api/chapters?novelId=${novelId}`);
			if (response.ok) {
				const data = await response.json();
				setChapters(data);
			} else {
				message.error('Failed to fetch chapters');
			}
		} catch (error) {
			message.error('Error fetching chapters');
		} finally {
			setLoading(false);
		}
	};

	const handleCreateOrUpdate = async (values: {
		rawContent: string;
		order: number;
	}) => {
		if (!selectedNovelId) {
			message.error('Please select a novel first');
			return;
		}

		try {
			const url = '/api/chapters';
			const method = editingChapter ? 'PUT' : 'POST';
			const body = editingChapter
				? {
						id: editingChapter.id,
						rawContent: values.rawContent,
						order: values.order,
					}
				: {
						rawContent: values.rawContent,
						novelId: selectedNovelId,
						order: values.order,
					};

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (response.ok) {
				message.success(
					`Chapter ${editingChapter ? 'updated' : 'created'} successfully`,
				);
				setModalVisible(false);
				setEditingChapter(null);
				form.resetFields();
				fetchChapters(selectedNovelId);
			} else {
				message.error(
					`Failed to ${editingChapter ? 'update' : 'create'} chapter`,
				);
			}
		} catch (error) {
			message.error(
				`Error ${editingChapter ? 'updating' : 'creating'} chapter`,
			);
		}
	};

	const handleDelete = async (id: number) => {
		try {
			const response = await fetch('/api/chapters', {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id }),
			});

			if (response.ok) {
				message.success('Chapter deleted successfully');
				if (selectedNovelId) {
					fetchChapters(selectedNovelId);
				}
			} else {
				message.error('Failed to delete chapter');
			}
		} catch (error) {
			message.error('Error deleting chapter');
		}
	};

	const handleExportChapters = () => {
		if (chapters.length === 0) {
			message.error('No chapters to export');
			return;
		}

		const exportData = chapters
			.sort((a, b) => a.order - b.order)
			.map((chapter, index) => {
				const content = chapter.vietnameseContent || chapter.rawContent;
				return `Chapter ${index + 1}\n\n${content}`;
			})
			.join('\n\n---\n\n');

		const blob = new Blob([exportData], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `novel-chapters-${Date.now()}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		message.success('Chapters exported successfully');
	};

	const columns = [
		{
			title: 'Order',
			dataIndex: 'order',
			key: 'order',
			width: 80,
			sorter: (a: Chapter, b: Chapter) => a.order - b.order,
		},
		{
			title: 'Content Preview',
			dataIndex: 'rawContent',
			key: 'rawContent',
			render: (text: string) => (
				<Text ellipsis style={{ maxWidth: 300 }}>
					{text.substring(0, 100)}...
				</Text>
			),
		},
		{
			title: 'Status',
			key: 'status',
			width: 120,
			render: (_: any, record: Chapter) => (
				<Tag color={record.vietnameseContent ? 'green' : 'orange'}>
					{record.vietnameseContent ? 'Translated' : 'Raw Only'}
				</Tag>
			),
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 150,
			render: (_: any, record: Chapter) => (
				<Space size="small">
					<Button
						type="text"
						icon={<EyeOutlined />}
						onClick={() => {
							setViewingChapter(record);
							setViewModalVisible(true);
						}}
					/>
					<Button
						type="text"
						icon={<EditOutlined />}
						onClick={() => {
							setEditingChapter(record);
							form.setFieldsValue({
								rawContent: record.rawContent,
								order: record.order,
							});
							setModalVisible(true);
						}}
					/>
					<Popconfirm
						title="Are you sure you want to delete this chapter?"
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
			<div style={{ marginBottom: 16 }}>
				<Title level={2}>Chapters Management</Title>

				<div
					style={{
						marginBottom: 16,
						display: 'flex',
						gap: 16,
						alignItems: 'center',
					}}
				>
					<Text strong>Select Novel:</Text>
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

					<Space>
						<Button
							type="primary"
							icon={<PlusOutlined />}
							onClick={() => {
								if (!selectedNovelId) {
									message.error('Please select a novel first');
									return;
								}
								setEditingChapter(null);
								form.resetFields();
								form.setFieldsValue({ order: chapters.length });
								setModalVisible(true);
							}}
							disabled={!selectedNovelId}
						>
							Add Chapter
						</Button>
						<Button
							icon={<DownloadOutlined />}
							onClick={handleExportChapters}
							disabled={chapters.length === 0}
						>
							Export All
						</Button>
					</Space>
				</div>
			</div>

			<Table
				columns={columns}
				dataSource={chapters}
				rowKey="id"
				loading={loading}
				pagination={{ pageSize: 10 }}
			/>

			<Modal
				title={editingChapter ? 'Edit Chapter' : 'Add Chapter'}
				open={modalVisible}
				onOk={() => form.submit()}
				onCancel={() => {
					setModalVisible(false);
					setEditingChapter(null);
					form.resetFields();
				}}
				width={800}
			>
				<Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
					<Form.Item
						name="order"
						label="Order"
						rules={[
							{ required: true, message: 'Please input the chapter order!' },
						]}
					>
						<Input type="number" placeholder="Enter chapter order" />
					</Form.Item>
					<Form.Item
						name="rawContent"
						label="Content"
						rules={[
							{ required: true, message: 'Please input the chapter content!' },
						]}
					>
						<TextArea rows={12} placeholder="Enter chapter content" />
					</Form.Item>
				</Form>
			</Modal>

			<Modal
				title="Chapter Details"
				open={viewModalVisible}
				onCancel={() => {
					setViewModalVisible(false);
					setViewingChapter(null);
				}}
				width={900}
				footer={[
					<Button key="close" onClick={() => setViewModalVisible(false)}>
						Close
					</Button>,
				]}
			>
				{viewingChapter && (
					<div>
						<Card title="Raw Content" style={{ marginBottom: 16 }}>
							<TextArea value={viewingChapter.rawContent} rows={8} readOnly />
						</Card>

						<Card
							title="Vietnamese Translation"
							extra={
								<Tag
									color={viewingChapter.vietnameseContent ? 'green' : 'orange'}
								>
									{viewingChapter.vietnameseContent
										? 'Available'
										: 'Not Translated'}
								</Tag>
							}
						>
							<TextArea
								value={viewingChapter.vietnameseContent || 'Not yet translated'}
								rows={8}
								readOnly
								style={{
									backgroundColor: viewingChapter.vietnameseContent
										? undefined
										: '#f5f5f5',
									color: viewingChapter.vietnameseContent ? undefined : '#999',
								}}
							/>
						</Card>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default ChaptersComponent;
