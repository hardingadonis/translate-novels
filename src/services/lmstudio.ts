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

export const createLMStudio = async (data: {
	name: string;
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
		name?: string;
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
