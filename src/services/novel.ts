import { Novel } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

export const getAllNovels = async (): Promise<Novel[]> => {
	try {
		return await prisma.novel.findMany();
	} catch (error) {
		console.error('Error fetching novels:', error);

		throw new Error('Failed to fetch novels');
	}
};

export const getNovel = async (id: number): Promise<Novel | null> => {
	try {
		return await prisma.novel.findUnique({
			where: { id },
		});
	} catch (error) {
		console.error('Error fetching novel:', error);

		throw new Error('Failed to fetch novel');
	}
};

export const createNovel = async (data: { title: string }): Promise<Novel> => {
	try {
		return await prisma.novel.create({
			data,
		});
	} catch (error) {
		console.error('Error creating novel:', error);

		throw new Error('Failed to create novel');
	}
};

export const updateNovel = async (
	id: number,
	data: { title?: string },
): Promise<Novel | null> => {
	try {
		return await prisma.novel.update({
			where: { id },
			data,
		});
	} catch (error) {
		console.error('Error updating novel:', error);

		throw new Error('Failed to update novel');
	}
};

export const deleteNovel = async (id: number): Promise<void> => {
	try {
		await prisma.novel.delete({
			where: { id },
		});
	} catch (error) {
		console.error('Error deleting novel:', error);

		throw new Error('Failed to delete novel');
	}
};
