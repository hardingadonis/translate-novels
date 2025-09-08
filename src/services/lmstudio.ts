import { AxiosError } from 'axios';

import { APILMStudio } from '@/generated/prisma';
import axiosInstance from '@/lib/axios';
import { prisma } from '@/lib/prisma';

export const getAllLMStudios = async (): Promise<APILMStudio[]> => {
	try {
		return await prisma.aPILMStudio.findMany();
	} catch (error) {
		console.error('Error fetching LM Studios:', error);

		throw new Error('Failed to fetch LM Studios');
	}
};

export const testLMStudioConnection = async (
	apiEndpoint: string,
): Promise<{ success: boolean; models?: any[]; error?: string }> => {
	try {
		const response = await axiosInstance.get(`${apiEndpoint}/v1/models`);
		const data = response.data;
		return { success: true, models: data.data || [] };
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.code === 'ECONNABORTED') {
				return {
					success: false,
					error: 'Connection timeout - Please check if LM Studio is running',
				};
			}
			return {
				success: false,
				error: `HTTP ${error.response?.status || 'Unknown'}: ${error.response?.statusText || error.message}`,
			};
		}
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Connection failed',
		};
	}
};

export const translateWithLMStudio = async (
	apiEndpoint: string,
	content: string,
	customPrompt?: string,
): Promise<{ success: boolean; translation?: string; error?: string }> => {
	try {
		const prompt =
			customPrompt ||
			'Please translate the following text from English to Vietnamese, maintaining the narrative style and character names:';

		const response = await axiosInstance.post(
			`${apiEndpoint}/v1/chat/completions`,
			{
				messages: [
					{ role: 'system', content: prompt },
					{ role: 'user', content: content },
				],
				temperature: 0.7,
			},
		);

		const data = response.data;
		const translation = data.choices?.[0]?.message?.content;

		if (!translation) {
			return { success: false, error: 'No translation received from API' };
		}

		return { success: true, translation };
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.code === 'ECONNABORTED') {
				return {
					success: false,
					error: 'Translation timeout - The request took too long to complete',
				};
			}
			return {
				success: false,
				error: `HTTP ${error.response?.status || 'Unknown'}: ${error.response?.statusText || error.message}`,
			};
		}
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Translation failed',
		};
	}
};

export const createLMStudio = async (data: {
	apiEndpoint: string;
}): Promise<APILMStudio> => {
	try {
		return await prisma.aPILMStudio.create({
			data,
		});
	} catch (error) {
		console.error('Error creating LM Studio:', error);

		throw new Error('Failed to create LM Studio');
	}
};

export const updateLMStudio = async (
	id: number,
	data: {
		apiEndpoint?: string;
	},
): Promise<APILMStudio> => {
	try {
		return await prisma.aPILMStudio.update({
			where: { id },
			data,
		});
	} catch (error) {
		console.error('Error updating LM Studio:', error);

		throw new Error('Failed to update LM Studio');
	}
};

export const deleteLMStudio = async (id: number): Promise<void> => {
	try {
		await prisma.aPILMStudio.delete({
			where: { id },
		});
	} catch (error) {
		console.error('Error deleting LM Studio:', error);

		throw new Error('Failed to delete LM Studio');
	}
};
