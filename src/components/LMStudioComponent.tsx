'use client';

import {
	ApiOutlined,
	CheckCircleOutlined,
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	PlusOutlined,
} from '@ant-design/icons';
import {
	Alert,
	Button,
	Card,
	Form,
	Input,
	Modal,
	Popconfirm,
	Space,
	Spin,
	Table,
	Tag,
	Typography,
	message,
} from 'antd';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';

import axiosInstance from '@/lib/axios';

const { Title, Text } = Typography;

interface LMStudio {
	id: number;
	apiEndpoint: string;
}

interface ConnectionTestResult {
	success: boolean;
	models?: any[];
	error?: string;
}

const LMStudioComponent: React.FC = () => {
	const [lmStudios, setLMStudios] = useState<LMStudio[]>([]);
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingLMStudio, setEditingLMStudio] = useState<LMStudio | null>(null);
	const [testingConnections, setTestingConnections] = useState<
		Record<number, boolean>
	>({});
	const [connectionResults, setConnectionResults] = useState<
		Record<number, ConnectionTestResult>
	>({});
	const [form] = Form.useForm();

	useEffect(() => {
		fetchLMStudios();
	}, []);

	const fetchLMStudios = async () => {
		setLoading(true);
		try {
			const response = await axiosInstance.get('/api/lmstudio');
			setLMStudios(response.data);
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(
					`Failed to fetch LM Studio endpoints: ${error.response?.statusText || error.message}`,
				);
			} else {
				message.error('Error fetching LM Studio endpoints');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleCreateOrUpdate = async (values: { apiEndpoint: string }) => {
		try {
			const method = editingLMStudio ? 'put' : 'post';
			const data = editingLMStudio
				? { id: editingLMStudio.id, apiEndpoint: values.apiEndpoint }
				: { apiEndpoint: values.apiEndpoint };

			await axiosInstance[method]('/api/lmstudio', data);

			message.success(
				`LM Studio endpoint ${editingLMStudio ? 'updated' : 'created'} successfully`,
			);
			setModalVisible(false);
			setEditingLMStudio(null);
			form.resetFields();
			fetchLMStudios();
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(
					`Failed to ${editingLMStudio ? 'update' : 'create'} LM Studio endpoint: ${error.response?.statusText || error.message}`,
				);
			} else {
				message.error(
					`Error ${editingLMStudio ? 'updating' : 'creating'} LM Studio endpoint`,
				);
			}
		}
	};

	const handleDelete = async (id: number) => {
		try {
			await axiosInstance.delete('/api/lmstudio', { data: { id } });
			message.success('LM Studio endpoint deleted successfully');
			setConnectionResults((prev) => {
				const updated = { ...prev };
				delete updated[id];
				return updated;
			});
			fetchLMStudios();
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(
					`Failed to delete LM Studio endpoint: ${error.response?.statusText || error.message}`,
				);
			} else {
				message.error('Error deleting LM Studio endpoint');
			}
		}
	};

	const testConnection = async (lmStudio: LMStudio) => {
		setTestingConnections((prev) => ({ ...prev, [lmStudio.id]: true }));

		try {
			const response = await axiosInstance.post('/api/lmstudio/test', {
				apiEndpoint: lmStudio.apiEndpoint,
			});

			const result: ConnectionTestResult = response.data;
			setConnectionResults((prev) => ({ ...prev, [lmStudio.id]: result }));

			if (result.success) {
				message.success(
					`Connection successful! Found ${result.models?.length || 0} models`,
				);
			} else {
				message.error(`Connection failed: ${result.error}`);
			}
		} catch (error) {
			if (error instanceof AxiosError) {
				message.error(
					`Error testing connection: ${error.response?.statusText || error.message}`,
				);
				setConnectionResults((prev) => ({
					...prev,
					[lmStudio.id]: {
						success: false,
						error:
							error.response?.statusText || error.message || 'Network error',
					},
				}));
			} else {
				message.error('Error testing connection');
				setConnectionResults((prev) => ({
					...prev,
					[lmStudio.id]: {
						success: false,
						error: 'Network error',
					},
				}));
			}
		} finally {
			setTestingConnections((prev) => ({ ...prev, [lmStudio.id]: false }));
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
			title: 'API Endpoint',
			dataIndex: 'apiEndpoint',
			key: 'apiEndpoint',
			render: (endpoint: string) => <Text code>{endpoint}</Text>,
		},
		{
			title: 'Status',
			key: 'status',
			width: 150,
			render: (_: any, record: LMStudio) => {
				const result = connectionResults[record.id];
				if (testingConnections[record.id]) {
					return (
						<Tag color="blue">
							<Spin size="small" style={{ marginRight: 4 }} />
							Testing...
						</Tag>
					);
				}
				if (result) {
					return (
						<Tag
							color={result.success ? 'green' : 'red'}
							icon={
								result.success ? (
									<CheckCircleOutlined />
								) : (
									<ExclamationCircleOutlined />
								)
							}
						>
							{result.success ? 'Connected' : 'Failed'}
						</Tag>
					);
				}
				return <Tag color="default">Not tested</Tag>;
			},
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 200,
			render: (_: any, record: LMStudio) => (
				<Space size="small">
					<Button
						type="text"
						icon={<ApiOutlined />}
						loading={testingConnections[record.id]}
						onClick={() => testConnection(record)}
					>
						Test
					</Button>
					<Button
						type="text"
						icon={<EditOutlined />}
						onClick={() => {
							setEditingLMStudio(record);
							form.setFieldsValue({ apiEndpoint: record.apiEndpoint });
							setModalVisible(true);
						}}
					/>
					<Popconfirm
						title="Are you sure you want to delete this endpoint?"
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
				<Title level={2}>LM Studio Settings</Title>
				<Button
					type="primary"
					icon={<PlusOutlined />}
					onClick={() => {
						setEditingLMStudio(null);
						form.resetFields();
						setModalVisible(true);
					}}
				>
					Add Endpoint
				</Button>
			</div>

			<Alert
				message="LM Studio Configuration"
				description={
					<div>
						<p>
							Configure your LM Studio API endpoints here. Make sure LM Studio
							is running locally before testing connections.
						</p>
						<ul>
							<li>
								Default LM Studio endpoint:{' '}
								<Text code>http://localhost:1234</Text>
							</li>
							<li>The API is compatible with OpenAI format</li>
							<li>Test each endpoint to verify it's working properly</li>
						</ul>
					</div>
				}
				type="info"
				style={{ marginBottom: 16 }}
			/>

			<Table
				columns={columns}
				dataSource={lmStudios}
				rowKey="id"
				loading={loading}
				pagination={{ pageSize: 10 }}
			/>

			<Modal
				title={
					editingLMStudio ? 'Edit LM Studio Endpoint' : 'Add LM Studio Endpoint'
				}
				open={modalVisible}
				onOk={() => form.submit()}
				onCancel={() => {
					setModalVisible(false);
					setEditingLMStudio(null);
					form.resetFields();
				}}
			>
				<Form form={form} layout="vertical" onFinish={handleCreateOrUpdate}>
					<Form.Item
						name="apiEndpoint"
						label="API Endpoint URL"
						rules={[
							{ required: true, message: 'Please input the API endpoint!' },
							{ type: 'url', message: 'Please input a valid URL!' },
						]}
					>
						<Input placeholder="http://localhost:1234" addonBefore="🌐" />
					</Form.Item>

					<Alert
						message="Tips"
						description={
							<ul style={{ margin: 0, paddingLeft: 16 }}>
								<li>Make sure LM Studio is running before saving</li>
								<li>Default port is usually 1234</li>
								<li>Don't include /v1 in the endpoint URL</li>
							</ul>
						}
						type="info"
						showIcon
						style={{ marginTop: 8 }}
					/>
				</Form>
			</Modal>
		</div>
	);
};

export default LMStudioComponent;
