import { NextRequest, NextResponse } from 'next/server';

import {
	createLMStudio,
	deleteLMStudio,
	getAllLMStudios,
	updateLMStudio,
} from '@/services/lmstudio';

export async function GET() {
	try {
		const lmStudios = await getAllLMStudios();
		return NextResponse.json(lmStudios);
	} catch {
		return NextResponse.json(
			{ error: 'Failed to fetch LM Studios' },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { apiEndpoint } = await request.json();

		if (!apiEndpoint) {
			return NextResponse.json(
				{ error: 'API endpoint is required' },
				{ status: 400 },
			);
		}

		const lmStudio = await createLMStudio({ apiEndpoint });
		return NextResponse.json(lmStudio, { status: 201 });
	} catch {
		return NextResponse.json(
			{ error: 'Failed to create LM Studio' },
			{ status: 500 },
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const { id, apiEndpoint } = await request.json();

		if (!id || !apiEndpoint) {
			return NextResponse.json(
				{ error: 'ID and API endpoint are required' },
				{ status: 400 },
			);
		}

		const lmStudio = await updateLMStudio(id, { apiEndpoint });
		return NextResponse.json(lmStudio);
	} catch {
		return NextResponse.json(
			{ error: 'Failed to update LM Studio' },
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

		await deleteLMStudio(id);
		return NextResponse.json({ success: true });
	} catch {
		return NextResponse.json(
			{ error: 'Failed to delete LM Studio' },
			{ status: 500 },
		);
	}
}
