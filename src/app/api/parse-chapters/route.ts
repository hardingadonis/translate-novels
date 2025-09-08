import { NextRequest, NextResponse } from 'next/server';

import { parseChaptersFromText } from '@/lib/text-parser';

export async function POST(request: NextRequest) {
	try {
		const { text } = await request.json();

		if (!text) {
			return NextResponse.json(
				{ error: 'Text content is required' },
				{ status: 400 },
			);
		}

		const chapters = parseChaptersFromText(text);
		return NextResponse.json({ chapters });
	} catch (_error) {
		return NextResponse.json(
			{ error: 'Failed to parse chapters' },
			{ status: 500 },
		);
	}
}
