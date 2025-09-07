import { Chapter } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export const getAllChaptersByNovel = async (
	novelId: string,
): Promise<Chapter[]> => {
	try {
		return await prisma.chapter.findMany({
			where: { novelId },
		});
	} catch (error) {
		console.error('Error fetching chapters:', error);

		throw new Error('Failed to fetch chapters');
	}
};

export const getChapter = async (id: string): Promise<Chapter | null> => {
	try {
		return await prisma.chapter.findUnique({
			where: { id },
		});
	} catch (error) {
		console.error('Error fetching chapter:', error);

		throw new Error('Failed to fetch chapter');
	}
};

export const createChapter = async (data: {
	title: string;
	rawContent: string;
	novelId: string;
}): Promise<Chapter> => {
	try {
		return await prisma.chapter.create({
			data,
		});
	} catch (error) {
		console.error('Error creating chapter:', error);

		throw new Error('Failed to create chapter');
	}
};

export const updateChapter = async (
	id: string,
	data: {
		title?: string;
		rawContent?: string;
		vietnameseContent?: string;
		order?: number;
	},
): Promise<Chapter | null> => {
	try {
		return await prisma.chapter.update({
			where: { id },
			data,
		});
	} catch (error) {
		console.error('Error updating chapter:', error);

		throw new Error('Failed to update chapter');
	}
};

export const deleteChapter = async (id: string): Promise<Chapter | null> => {
	try {
		return await prisma.chapter.delete({
			where: { id },
		});
	} catch (error) {
		console.error('Error deleting chapter:', error);

		throw new Error('Failed to delete chapter');
	}
};
