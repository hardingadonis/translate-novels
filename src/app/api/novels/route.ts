import { NextRequest, NextResponse } from 'next/server';

import {
	createNovel,
	deleteNovel,
	getAllNovels,
	updateNovel,
} from '@/services/novel';

export async function GET() {
	try {
		const novels = await getAllNovels();
		return NextResponse.json(novels);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to fetch novels' },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { title } = await request.json();

		if (!title) {
			return NextResponse.json({ error: 'Title is required' }, { status: 400 });
		}

		const novel = await createNovel({ title });
		return NextResponse.json(novel, { status: 201 });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to create novel' },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const { id, title } = await request.json();

		if (!id || !title) {
			return NextResponse.json(
				{ error: 'ID and title are required' },
				{ status: 400 },
			);
		}

		const novel = await updateNovel(id, { title });
		return NextResponse.json(novel);
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to update novel' },
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

		await deleteNovel(id);
		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to delete novel' },
			{ status: 500 },
		);
	}
}
