import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import * as fs from 'fs';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const formatId = searchParams.get('formatId');
    const filename = searchParams.get('filename') || 'video.mp4';
    const isAdaptive = searchParams.get('isAdaptive') === 'true';
    const audioOnly = searchParams.get('audioOnly') === 'true';

    if (!url || !formatId) {
        return NextResponse.json({ error: 'Missing url or formatId parameter' }, { status: 400 });
    }

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    try {
        // Check if this is a local file path (from instaloader)
        if (formatId.startsWith('/') && fs.existsSync(formatId)) {
            const fileBuffer = fs.readFileSync(formatId);
            const isVideo = formatId.endsWith('.mp4');

            headers.set('Content-Type', isVideo ? 'video/mp4' : 'image/jpeg');
            headers.set('Content-Length', fileBuffer.length.toString());

            setTimeout(() => {
                try {
                    const dir = formatId.substring(0, formatId.lastIndexOf('/'));
                    fs.rmSync(dir, { recursive: true });
                } catch { }
            }, 5000);

            return new NextResponse(fileBuffer, { status: 200, headers });
        }

        // For yt-dlp based downloads
        let format: string;

        if (audioOnly) {
            // Get best audio, prefer original language
            format = 'bestaudio/best';
        } else if (isAdaptive) {
            // Video-only format + best audio (prefer original language)
            // Use language selector to prefer original audio over dubbed
            format = `${formatId}+bestaudio[language=und]/best[language=und]/${formatId}+bestaudio/best`;
        } else {
            // Combined format or fallback
            format = formatId === 'best' ? 'best' : `${formatId}/best`;
        }

        const args = [
            '-f', format,
            '--merge-output-format', 'mp4',
            '-o', '-',
            '--no-warnings',
            '--no-progress',
            '--no-playlist',
            // Prefer original audio track over dubbed versions
            '--extractor-args', 'youtube:player_client=ios,web',
            '--cookies-from-browser', 'brave',
            url
        ];

        console.log('yt-dlp download:', format, url);

        const ytdlp = spawn('yt-dlp', args);

        ytdlp.stderr.on('data', (data) => {
            console.error('yt-dlp:', data.toString());
        });

        const stream = new ReadableStream({
            start(controller) {
                ytdlp.stdout.on('data', (chunk) => controller.enqueue(chunk));
                ytdlp.stdout.on('end', () => controller.close());
                ytdlp.stdout.on('error', (err) => controller.error(err));
            },
            cancel() {
                ytdlp.kill();
            }
        });

        headers.set('Content-Type', audioOnly ? 'audio/mp4' : 'video/mp4');

        return new NextResponse(stream, { status: 200, headers });

    } catch (error: any) {
        console.error('Download Error:', error.message);
        return NextResponse.json({ error: 'Download failed', details: error.message }, { status: 500 });
    }
}
