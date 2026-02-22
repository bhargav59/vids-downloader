import { NextRequest, NextResponse } from 'next/server';
import { extractVideoInfo } from '@/lib/extractors';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const url = searchParams.get('url');

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
