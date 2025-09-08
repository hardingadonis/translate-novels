import { NextRequest, NextResponse } from 'next/server';

import {
	createChapter,
	createMultipleChapters,
	deleteChapter,
	getAllChaptersByNovel,
	updateChapter,
} from '@/services/chapter';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const novelId = searchParams.get('novelId');

		if (!novelId) {
			return NextResponse.json(
				{ error: 'novelId is required' },
				{ status: 400 },
			);
		}

		const chapters = await getAllChaptersByNovel(parseInt(novelId));
		return NextResponse.json(chapters);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to fetch chapters' },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		if (Array.isArray(body)) {
			// Multiple chapters
			const chapters = await createMultipleChapters(body);
			return NextResponse.json(chapters, { status: 201 });
		} else {
			// Single chapter
			const { rawContent, novelId, order = 0 } = body;

			if (!rawContent || !novelId) {
				return NextResponse.json(
					{ error: 'rawContent and novelId are required' },
					{ status: 400 },
				);
			}

			const chapter = await createChapter({ rawContent, novelId, order });
			return NextResponse.json(chapter, { status: 201 });
		}
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to create chapter(s)' },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const { id, rawContent, vietnameseContent, order } = await request.json();

		if (!id) {
			return NextResponse.json({ error: 'ID is required' }, { status: 400 });
		}

		const chapter = await updateChapter(id, {
			rawContent,
			vietnameseContent,
			order,
		});
		return NextResponse.json(chapter);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to update chapter' },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const { id } = await request.json();

		if (!id) {
			return NextResponse.json({ error: 'ID is required' }, { status: 400 });
		}

		await deleteChapter(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to delete chapter' },
			{ status: 500 },
		);
	}
}
