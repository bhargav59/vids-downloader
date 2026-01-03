/**
 * VidsDoldr - Cloudflare Worker Entry Point
 * 
 * Routes:
 * - GET /                → Serve HTML frontend
 * - GET /api/resolve     → Extract video information
 * - GET /api/proxy       → Proxy/download video
 */

import { extractVideo } from './extractors';
import { getHtml } from './html';
import { ApiResponse, VideoInfo } from './types';

export interface Env {
    ENVIRONMENT?: string;
}

/**
 * CORS headers for API responses
 */
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * JSON response helper
 */
function jsonResponse<T>(data: ApiResponse<T>, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
}

/**
 * Handle /api/resolve - Extract video information
 */
async function handleResolve(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const videoUrl = url.searchParams.get('url');

    if (!videoUrl) {
        return jsonResponse({ success: false, error: 'Missing url parameter' }, 400);
    }

    try {
        const videoInfo = await extractVideo(videoUrl);
        return jsonResponse<VideoInfo>({ success: true, data: videoInfo });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return jsonResponse({ success: false, error: message }, 500);
    }
}

/**
 * Handle /api/proxy - Download/proxy video stream
 */
async function handleProxy(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const videoUrl = url.searchParams.get('url');
    const filename = url.searchParams.get('filename') || 'video.mp4';

    if (!videoUrl) {
        return jsonResponse({ success: false, error: 'Missing url parameter' }, 400);
    }

    try {
        // Fetch the video from the source
        const response = await fetch(videoUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': new URL(videoUrl).origin,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.status}`);
        }

        // Stream the response with download headers
        const headers = new Headers(response.headers);
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(response.body, {
            status: 200,
            headers,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Download failed';
        return jsonResponse({ success: false, error: message }, 500);
    }
}

/**
 * Main fetch handler
 */
export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // Route requests
        switch (true) {
            case path === '/' || path === '':
                return new Response(getHtml(), {
                    headers: { 'Content-Type': 'text/html' },
                });

            case path === '/api/resolve':
                return handleResolve(request);

            case path === '/api/proxy':
                return handleProxy(request);

            default:
                return new Response('Not Found', { status: 404 });
        }
    },
};
