import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const results: any[] = [];
    const instances = [
        'https://co.wuk.sh',
        'https://cobalt.owo.vc',
        'https://cobalt.tux.pizza',
        'https://cobalt1.kwiatekm.org'
    ];

    for (const instance of instances) {
        try {
            const res = await fetch(`${instance}/`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: 'https://www.youtube.com/watch?v=vhfzN69ALpY',
                    videoQuality: '720'
                })
            });
            const text = await res.text();
            results.push({ instance, status: res.status, ok: res.ok, response: text });
        } catch (e: any) {
            results.push({ instance, error: e.message || e.toString() });
        }
    }
    return NextResponse.json(results);
}
