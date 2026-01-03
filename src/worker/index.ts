/**
 * VidsDoldr - Cloudflare Worker Entry Point
 * 
 * Cloudflare Free Services Used:
 * - KV: Cache video metadata (1GB free)
 * - D1: Analytics database (5GB free)
 * - Cache API: Edge caching for HTML
 */

import { extractVideo } from './extractors';
import { getHtml } from './html';
import { ApiResponse, VideoInfo, Env, CacheEntry } from './types';

const CACHE_TTL = 3600; // 1 hour cache for video info
const CORS_HEADERS = {
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
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
}

/**
 * Generate cache key from URL
 */
function getCacheKey(url: string): string {
    return `video:${btoa(url).replace(/[^a-zA-Z0-9]/g, '')}`;
}

/**
 * Get video info from KV cache
 */
async function getFromCache(env: Env, url: string): Promise<VideoInfo | null> {
    try {
        if (!env.VIDEO_CACHE) return null;
        const key = getCacheKey(url);
        const cached = await env.VIDEO_CACHE.get(key, 'json') as CacheEntry | null;

        if (cached && cached.expiresAt > Date.now()) {
            return cached.videoInfo;
        }
    } catch (e) {
        console.error('Cache read error:', e);
    }
    return null;
}

/**
 * Save video info to KV cache
 */
async function saveToCache(env: Env, url: string, videoInfo: VideoInfo): Promise<void> {
    try {
        if (!env.VIDEO_CACHE) return;
        const key = getCacheKey(url);
        const entry: CacheEntry = {
            videoInfo,
            timestamp: Date.now(),
            expiresAt: Date.now() + (CACHE_TTL * 1000),
        };
        await env.VIDEO_CACHE.put(key, JSON.stringify(entry), { expirationTtl: CACHE_TTL });
    } catch (e) {
        console.error('Cache write error:', e);
    }
}

/**
 * Log download to D1 analytics
 */
async function logDownload(env: Env, request: Request, videoInfo: VideoInfo, quality: string): Promise<void> {
    try {
        if (!env.ANALYTICS_DB) return;

        const cf = request.cf;
        await env.ANALYTICS_DB.prepare(`
            INSERT INTO downloads (video_url, platform, quality, video_title, user_agent, country)
            VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
            videoInfo.originalUrl,
            videoInfo.platform,
            quality,
            videoInfo.title,
            request.headers.get('User-Agent') || 'Unknown',
            (cf?.country as string) || 'Unknown'
        ).run();

        // Update popular videos
        const videoId = getCacheKey(videoInfo.originalUrl);
        await env.ANALYTICS_DB.prepare(`
            INSERT INTO popular_videos (video_id, platform, title, thumbnail, download_count, last_downloaded)
            VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
            ON CONFLICT(video_id) DO UPDATE SET
                download_count = download_count + 1,
                last_downloaded = CURRENT_TIMESTAMP
        `).bind(videoId, videoInfo.platform, videoInfo.title, videoInfo.thumbnail).run();
    } catch (e) {
        console.error('Analytics error:', e);
    }
}

/**
 * Log error to D1
 */
async function logError(env: Env, url: string, error: Error): Promise<void> {
    try {
        if (!env.ANALYTICS_DB) return;
        await env.ANALYTICS_DB.prepare(`
            INSERT INTO error_logs (url, error_message, stack_trace)
            VALUES (?, ?, ?)
        `).bind(url, error.message, error.stack || '').run();
    } catch (e) {
        console.error('Error logging failed:', e);
    }
}

/**
 * Handle /api/resolve - Extract video information with KV caching
 */
async function handleResolve(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const videoUrl = url.searchParams.get('url');

    if (!videoUrl) {
        return jsonResponse({ success: false, error: 'Missing url parameter' }, 400);
    }

    try {
        // Check KV cache first
        let videoInfo = await getFromCache(env, videoUrl);

        if (!videoInfo) {
            // Extract and cache
            videoInfo = await extractVideo(videoUrl);
            await saveToCache(env, videoUrl, videoInfo);
        }

        return jsonResponse<VideoInfo>({ success: true, data: videoInfo });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        await logError(env, videoUrl, err);
        return jsonResponse({ success: false, error: err.message }, 500);
    }
}

/**
 * Handle /api/proxy - Stream video download with analytics
 */
async function handleProxy(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const videoUrl = url.searchParams.get('url');
    const filename = url.searchParams.get('filename') || 'video.mp4';
    const quality = url.searchParams.get('quality') || 'Unknown';

    if (!videoUrl) {
        return jsonResponse({ success: false, error: 'Missing url parameter' }, 400);
    }

    try {
        // Fetch from source
        const response = await fetch(videoUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': new URL(videoUrl).origin,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.status}`);
        }

        // Log download analytics
        const videoInfo = await getFromCache(env, videoUrl);
        if (videoInfo) {
            await logDownload(env, request, videoInfo, quality);
        }

        // Stream response with proper headers
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'video/mp4');
        headers.set('Content-Disposition', `attachment; filename="${filename}"`);
        headers.set('Access-Control-Allow-Origin', '*');

        return new Response(response.body, { headers });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Download failed';
        return jsonResponse({ success: false, error: message }, 500);
    }
}

/**
 * Handle /api/stats - Get download statistics
 */
async function handleStats(env: Env): Promise<Response> {
    try {
        if (!env.ANALYTICS_DB) {
            return jsonResponse({ success: true, data: { totalDownloads: 0, platformStats: [], popularVideos: [] } });
        }

        const totalDownloads = await env.ANALYTICS_DB.prepare(
            'SELECT COUNT(*) as count FROM downloads'
        ).first<{ count: number }>();

        const platformStats = await env.ANALYTICS_DB.prepare(`
            SELECT platform, COUNT(*) as count 
            FROM downloads 
            GROUP BY platform 
            ORDER BY count DESC
        `).all();

        const popularVideos = await env.ANALYTICS_DB.prepare(`
            SELECT title, platform, download_count 
            FROM popular_videos 
            ORDER BY download_count DESC 
            LIMIT 10
        `).all();

        return jsonResponse({
            success: true,
            data: {
                totalDownloads: totalDownloads?.count || 0,
                platformStats: platformStats?.results || [],
                popularVideos: popularVideos?.results || [],
            }
        });
    } catch (e) {
        return jsonResponse({ success: false, error: 'Stats unavailable' }, 500);
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
            return new Response(null, { headers: CORS_HEADERS });
        }

        // Use Cache API for HTML (edge caching)
        if (path === '/' || path === '') {
            const cache = caches.default;
            const cacheKey = new Request(url.toString(), request);

            let response = await cache.match(cacheKey);
            if (!response) {
                response = new Response(getHtml(), {
                    headers: {
                        'Content-Type': 'text/html',
                        'Cache-Control': 'public, max-age=3600',
                    },
                });
                ctx.waitUntil(cache.put(cacheKey, response.clone()));
            }
            return response;
        }

        // Route API requests
        switch (path) {
            case '/api/resolve':
                return handleResolve(request, env);
            case '/api/proxy':
                return handleProxy(request, env);
            case '/api/stats':
                return handleStats(env);
            default:
                return new Response('Not Found', { status: 404 });
        }
    },
};
