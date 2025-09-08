import { NextRequest, NextResponse } from 'next/server';

import { updateChapter } from '@/services/chapter';
import { translateWithLMStudio } from '@/services/lmstudio';

export async function POST(request: NextRequest) {
	try {
		const { apiEndpoint, chapterIds, customPrompt } = await request.json();

		if (!apiEndpoint || !chapterIds || !Array.isArray(chapterIds)) {
			return NextResponse.json(
				{ error: 'API endpoint and chapter IDs are required' },
				{ status: 400 },
			);
		}

		const results: { chapterId: number; success: boolean; error?: string }[] =
			[];

		const { getChapter } = await import('@/services/chapter');

		for (const chapterId of chapterIds) {
			try {
				const chapter = await getChapter(chapterId);

				if (!chapter) {
					results.push({
						chapterId,
						success: false,
						error: 'Chapter not found',
					});
					continue;
				}

				const translationResult = await translateWithLMStudio(
					apiEndpoint,
					chapter.rawContent,
					customPrompt,
				);

				if (translationResult.success && translationResult.translation) {
					await updateChapter(chapterId, {
						vietnameseContent: translationResult.translation,
					});
					results.push({ chapterId, success: true });
				} else {
					results.push({
						chapterId,
						success: false,
						error: translationResult.error || 'Translation failed',
					});
				}
			} catch (error) {
				results.push({
					chapterId,
					success: false,
					error: error instanceof Error ? error.message : 'Unknown error',
				});
			}
		}

		return NextResponse.json({ results });
	} catch {
		return NextResponse.json(
			{ error: 'Failed to translate chapters' },
			{ status: 500 },
		);
	}
}
