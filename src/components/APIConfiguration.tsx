import { ApiOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Input, Space, message } from 'antd';
import { useState } from 'react';

interface APIConfigurationProps {
	currentEndpoint: string;
	onConfigured: (endpoint: string) => void;
}

const APIConfiguration = ({
	currentEndpoint,
	onConfigured,
}: APIConfigurationProps) => {
	const [form] = Form.useForm();
	const [endpoint, setEndpoint] = useState(currentEndpoint);

	const handleSave = () => {
		const values = form.getFieldsValue();
		const apiUrl = values.endpoint?.trim();

		if (!apiUrl) {
			message.error('Please enter a valid API endpoint');
			return;
		}

		try {
			new URL(apiUrl);
			localStorage.setItem('lm-studio-endpoint', apiUrl);
			setEndpoint(apiUrl);
			message.success('API endpoint saved successfully');
			onConfigured(apiUrl);
		} catch {
			message.error('Please enter a valid URL');
		}
	};

	const handleDelete = () => {
		localStorage.removeItem('lm-studio-endpoint');
		setEndpoint('');
		form.resetFields();
		message.success('API endpoint deleted');
	};

	const testEndpoint = async () => {
		const values = form.getFieldsValue();
		const apiUrl = values.endpoint?.trim();

		if (!apiUrl) {
			message.error('Please enter an API endpoint to test');
			return;
		}

		try {
			message.loading('Testing connection...', 0);
			const response = await fetch(`${apiUrl}/v1/models`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			message.destroy();

			if (response.ok) {
				message.success('Connection successful!');
			} else {
				message.error('Connection failed. Please check your endpoint.');
			}
		} catch {
			message.destroy();
			message.error('Connection failed. Please check your endpoint.');
		}
	};

	return (
		<Card title="API Configuration" extra={<ApiOutlined />}>
			<Alert
				message="Configure your LM Studio API endpoint"
				description="Enter the URL for your LM Studio server. Default is usually http://localhost:1234"
				type="info"
				style={{ marginBottom: 24 }}
			/>

			<Form
				form={form}
				layout="vertical"
				initialValues={{ endpoint: currentEndpoint }}
			>
				<Form.Item
					label="LM Studio API Endpoint"
					name="endpoint"
					rules={[
						{ required: true, message: 'Please enter the API endpoint' },
						{ type: 'url', message: 'Please enter a valid URL' },
					]}
				>
					<Input
						placeholder="http://localhost:1234"
						size="large"
						onChange={(e) => form.setFieldValue('endpoint', e.target.value)}
					/>
				</Form.Item>

				<Space>
					<Button
						type="primary"
						icon={<SaveOutlined />}
						onClick={handleSave}
						size="large"
					>
						Save Endpoint
					</Button>
					<Button
						icon={<DeleteOutlined />}
						onClick={handleDelete}
						disabled={!endpoint}
						size="large"
					>
						Delete Saved
					</Button>
					<Button onClick={testEndpoint} size="large">
						Test Connection
					</Button>
				</Space>
			</Form>

			{endpoint && (
				<Alert
					message="Saved Endpoint"
					description={`Currently saved: ${endpoint}`}
					type="success"
					style={{ marginTop: 16 }}
				/>
			)}
		</Card>
	);
};

export default APIConfiguration;
