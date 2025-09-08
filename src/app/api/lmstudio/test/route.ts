import { NextRequest, NextResponse } from 'next/server';

import { testLMStudioConnection } from '@/services/lmstudio';

export async function POST(request: NextRequest) {
	try {
		const { apiEndpoint } = await request.json();

		if (!apiEndpoint) {
			return NextResponse.json(
				{ error: 'API endpoint is required' },
				{ status: 400 },
			);
		}

		const result = await testLMStudioConnection(apiEndpoint);
		return NextResponse.json(result);
	} catch (_error) {
		return NextResponse.json(
			{ error: 'Failed to test connection' },
			{ status: 500 },
		);
	}
}
