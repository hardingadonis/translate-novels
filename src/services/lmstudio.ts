import { APILMStudio } from '@/generated/prisma';
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
		const response = await fetch(`${apiEndpoint}/v1/models`);
		if (!response.ok) {
			return {
				success: false,
				error: `HTTP ${response.status}: ${response.statusText}`,
			};
		}
		const data = await response.json();
		return { success: true, models: data.data || [] };
	} catch (error) {
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

		const response = await fetch(`${apiEndpoint}/v1/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				messages: [
					{ role: 'system', content: prompt },
					{ role: 'user', content: content },
				],
				temperature: 0.7,
			}),
		});

		if (!response.ok) {
			return {
				success: false,
				error: `HTTP ${response.status}: ${response.statusText}`,
			};
		}

		const data = await response.json();
		const translation = data.choices?.[0]?.message?.content;

		if (!translation) {
			return { success: false, error: 'No translation received from API' };
		}

		return { success: true, translation };
	} catch (error) {
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
