import { NextRequest, NextResponse } from 'next/server';
import { extractVideoInfo } from '@/lib/extractors';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const data = await extractVideoInfo(url);
        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Extraction Error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to extract video info' },
            { status: 500 }
        );
    }
}
