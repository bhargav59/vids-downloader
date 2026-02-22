import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const widgetUrl = searchParams.get('url');

    if (!widgetUrl || !widgetUrl.startsWith('https://loader.to/')) {
        return new NextResponse('Invalid widget URL', { status: 400 });
    }

    try {
        const upstream = await fetch(widgetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://loader.to/'
            },
        });

        const responseHeaders = new Headers(upstream.headers);
        responseHeaders.delete('x-frame-options');
        responseHeaders.delete('content-security-policy');

        let body = await upstream.text();
        body = body.replace(/href="\//g, 'href="https://loader.to/');
        body = body.replace(/src="\//g, 'src="https://loader.to/');

        return new NextResponse(body, {
            status: upstream.status,
            headers: responseHeaders
        });
    } catch (e) {
        return new NextResponse('Failed to load widget', { status: 502 });
    }
}
