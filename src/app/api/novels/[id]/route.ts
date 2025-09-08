import { NextRequest, NextResponse } from 'next/server';

import { getNovelWithChapters } from '@/services/novel';

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	try {
		const { id } = await params;
		const novelId = parseInt(id);

		if (isNaN(novelId)) {
			return NextResponse.json({ error: 'Invalid novel ID' }, { status: 400 });
		}

		const novel = await getNovelWithChapters(novelId);

		if (!novel) {
			return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
		}

		return NextResponse.json(novel);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to fetch novel' },
			{ status: 500 },
		);
	}
}
