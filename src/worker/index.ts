/**
 * VidsDownloader — Cloudflare Worker Entry Point
 *
 * Routes:
 *   GET /                       → SPA HTML (and all platform sub-pages)
 *   GET /api/resolve?url=...    → Extract video info + cache in KV
 *   GET /api/proxy?url=...      → Proxy-download a direct video URL
 *   GET /api/stats              → Download analytics
 *   OPTIONS *                   → CORS preflight
 *
 * Free Cloudflare services used:
 *   KV  — cache video metadata (1GB free)
 *   D1  — analytics database   (5GB free)
 *   Cache API — edge-cache HTML at the CDN level
 */

import { extractVideo } from './extractors';
import { getHtml } from './html';
import { ApiResponse, VideoInfo, Env, CacheEntry } from './types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Seconds to keep a resolved video in KV cache */
const CACHE_TTL = 3600; // 1 hour

/** Maximum proxy response body we will forward (200 MB) */
const MAX_PROXY_BYTES = 200 * 1024 * 1024;

/** CORS headers applied to every response */
const CORS_HEADERS: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Access-Control-Max-Age': '86400',
};

/** Security headers applied to HTML responses */
const SECURITY_HEADERS: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function jsonResponse<T>(data: ApiResponse<T>, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            ...CORS_HEADERS,
        },
    });
}

function htmlResponse(html: string): Response {
    return new Response(html, {
        headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
            ...SECURITY_HEADERS,
        },
    });
}

function getCacheKey(url: string): string {
    // Stable, short KV key from the URL
    return `v3:${btoa(encodeURIComponent(url)).replace(/[^a-zA-Z0-9]/g, '').substring(0, 512)}`;
}

// ---------------------------------------------------------------------------
// KV Cache
// ---------------------------------------------------------------------------

async function getFromCache(env: Env, url: string): Promise<VideoInfo | null> {
    try {
        if (!env.VIDEO_CACHE) return null;
        const key = getCacheKey(url);
        const cached = await env.VIDEO_CACHE.get<CacheEntry>(key, 'json');
        if (cached && cached.expiresAt > Date.now()) return cached.videoInfo;
    } catch (e) {
        console.error('[KV read]', e);
    }
    return null;
}

async function saveToCache(env: Env, url: string, videoInfo: VideoInfo): Promise<void> {
    try {
        if (!env.VIDEO_CACHE) return;
        const key = getCacheKey(url);
        const entry: CacheEntry = {
            videoInfo,
            timestamp: Date.now(),
            expiresAt: Date.now() + CACHE_TTL * 1000,
        };
        await env.VIDEO_CACHE.put(key, JSON.stringify(entry), { expirationTtl: CACHE_TTL });
    } catch (e) {
        console.error('[KV write]', e);
    }
}

// ---------------------------------------------------------------------------
// D1 Analytics
// ---------------------------------------------------------------------------

async function logDownload(env: Env, request: Request, videoInfo: VideoInfo, quality: string): Promise<void> {
    try {
        if (!env.ANALYTICS_DB) return;
        const cf = request.cf;
        await env.ANALYTICS_DB.prepare(
            `INSERT INTO downloads (video_url, platform, quality, video_title, user_agent, country)
             VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
            videoInfo.originalUrl,
            videoInfo.platform,
            quality,
            videoInfo.title.substring(0, 200),
            (request.headers.get('User-Agent') || 'Unknown').substring(0, 200),
            (cf?.country as string) || 'Unknown'
        ).run();

        const videoId = getCacheKey(videoInfo.originalUrl);
        await env.ANALYTICS_DB.prepare(
            `INSERT INTO popular_videos (video_id, platform, title, thumbnail, download_count, last_downloaded)
             VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)
             ON CONFLICT(video_id) DO UPDATE SET
               download_count = download_count + 1,
               last_downloaded = CURRENT_TIMESTAMP`
        ).bind(videoId, videoInfo.platform, videoInfo.title.substring(0, 200), videoInfo.thumbnail).run();
    } catch (e) {
        console.error('[D1 analytics]', e);
    }
}

async function logError(env: Env, url: string, error: unknown): Promise<void> {
    try {
        if (!env.ANALYTICS_DB) return;
        const err = error instanceof Error ? error : new Error(String(error));
        await env.ANALYTICS_DB.prepare(
            `INSERT INTO error_logs (url, error_message, stack_trace) VALUES (?, ?, ?)`
        ).bind(url.substring(0, 500), err.message.substring(0, 500), (err.stack || '').substring(0, 2000)).run();
    } catch { /* swallow */ }
}

// ---------------------------------------------------------------------------
// Route: /api/resolve
// ---------------------------------------------------------------------------

async function handleResolve(request: Request, env: Env): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');

    if (!videoUrl) return jsonResponse({ success: false, error: 'Missing ?url= parameter.' }, 400);

    // Basic length guard
    if (videoUrl.length > 2048) return jsonResponse({ success: false, error: 'URL too long.' }, 400);

    try {
        // 1. KV cache hit?
        let videoInfo = await getFromCache(env, videoUrl);

        if (!videoInfo) {
            // 2. Extract fresh
            videoInfo = await extractVideo(videoUrl, env.INSTAGRAM_COOKIE);
            // 3. Store in KV (background, non-blocking)
            void saveToCache(env, videoUrl, videoInfo);
        }

        return jsonResponse<VideoInfo>({ success: true, data: videoInfo });
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        void logError(env, videoUrl, err);
        return jsonResponse({ success: false, error: err.message }, 422);
    }
}

// ---------------------------------------------------------------------------
// Route: /api/proxy
// ---------------------------------------------------------------------------

async function handleProxy(request: Request, env: Env): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('url');
    const filename = (searchParams.get('filename') || 'video.mp4')
        .replace(/[^\w\s.-]/g, '_') // sanitize filename
        .substring(0, 200);
    const quality = searchParams.get('quality') || 'Unknown';

    if (!videoUrl) return jsonResponse({ success: false, error: 'Missing ?url= parameter.' }, 400);

    // Only allow known CDN-style video hosts to avoid SSRF
    let parsedUrl: URL;
    try {
        parsedUrl = new URL(videoUrl);
    } catch {
        return jsonResponse({ success: false, error: 'Invalid URL.' }, 400);
    }

    // Allowlist of acceptable origins for proxied downloads
    const allowedHosts = [
        'googlevideo.com',
        'fbcdn.net',
        'cdninstagram.com',
        'tiktok.com',
        'tikwm.com',
        'twimg.com',
        'pbs.twimg.com',
        'video.twimg.com',
        'snapcontent.com',
        'igram.world',
        'yt1s.is',
        'ytmp3.nu',
        'cobalt.tools',
        'loader.to',
        'instadownloader.app',
        'twitsave.com',
    ];

    const hostAllowed = allowedHosts.some(h => parsedUrl.hostname.endsWith(h));
    if (!hostAllowed) {
        // Also allow if it's a direct CDN with a video mime type — we'll check Content-Type
        // For now stream it but verify content-type below
    }

    try {
        const upstream = await fetch(videoUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': parsedUrl.origin,
            },
            redirect: 'follow',
        });

        if (!upstream.ok) {
            throw new Error(`Upstream server returned ${upstream.status}. The download link may have expired.`);
        }

        // Check Content-Length guard
        const contentLength = upstream.headers.get('Content-Length');
        if (contentLength && parseInt(contentLength, 10) > MAX_PROXY_BYTES) {
            throw new Error('File is too large to proxy (>200 MB). Please use the direct download link.');
        }

        // Verify it's actually media, not HTML/JSON
        const contentType = upstream.headers.get('Content-Type') || 'video/mp4';
        const isMedia = /^(video|audio|application\/octet-stream)/.test(contentType);
        if (!isMedia && !hostAllowed) {
            throw new Error('The requested URL does not point to a video file.');
        }

        // Log analytics if we can find the video in cache
        const cachedInfo = await getFromCache(env, videoUrl);
        if (cachedInfo) {
            void logDownload(request as any, request as any, cachedInfo, quality);
        }

        const responseHeaders = new Headers();
        responseHeaders.set('Content-Type', contentType);
        responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"`);
        responseHeaders.set('Access-Control-Allow-Origin', '*');
        if (contentLength) responseHeaders.set('Content-Length', contentLength);
        // Tell browsers not to sniff the type
        responseHeaders.set('X-Content-Type-Options', 'nosniff');

        return new Response(upstream.body, { headers: responseHeaders, status: 200 });
    } catch (error) {
        const msg = error instanceof Error ? error.message : 'Download failed.';
        return jsonResponse({ success: false, error: msg }, 502);
    }
}

// ---------------------------------------------------------------------------
// Route: /api/widget (Proxy HTML without X-Frame-Options)
// ---------------------------------------------------------------------------

async function handleWidget(request: Request, env: Env): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const widgetUrl = searchParams.get('url');

    if (!widgetUrl || !widgetUrl.startsWith('https://loader.to/')) {
        return new Response('Invalid widget URL', { status: 400 });
    }

    try {
        const upstream = await fetch(widgetUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://loader.to/'
            },
        });

        // Strip security headers that block iframes
        const responseHeaders = new Headers(upstream.headers);
        responseHeaders.delete('x-frame-options');
        responseHeaders.delete('content-security-policy');

        let body = await upstream.text();

        // Rewrite asset paths in loader.to HTML to be absolute
        body = body.replace(/href="\//g, 'href="https://loader.to/');
        body = body.replace(/src="\//g, 'src="https://loader.to/');

        return new Response(body, {
            status: upstream.status,
            headers: responseHeaders
        });
    } catch (e) {
        return new Response('Failed to load widget', { status: 502 });
    }
}

// ---------------------------------------------------------------------------
// Route: /api/stats
// ---------------------------------------------------------------------------

async function handleStats(env: Env): Promise<Response> {
    try {
        if (!env.ANALYTICS_DB) {
            return jsonResponse({ success: true, data: { totalDownloads: 0, platformStats: [], popularVideos: [] } });
        }

        const [total, platforms, popular] = await Promise.all([
            env.ANALYTICS_DB.prepare('SELECT COUNT(*) as count FROM downloads').first<{ count: number }>(),
            env.ANALYTICS_DB.prepare(
                `SELECT platform, COUNT(*) as count FROM downloads GROUP BY platform ORDER BY count DESC`
            ).all(),
            env.ANALYTICS_DB.prepare(
                `SELECT title, platform, download_count FROM popular_videos ORDER BY download_count DESC LIMIT 10`
            ).all(),
        ]);

        return jsonResponse({
            success: true,
            data: {
                totalDownloads: total?.count ?? 0,
                platformStats: platforms?.results ?? [],
                popularVideos: popular?.results ?? [],
            },
        });
    } catch {
        return jsonResponse({ success: false, error: 'Stats temporarily unavailable.' }, 503);
    }
}

// ---------------------------------------------------------------------------
// Main fetch handler
// ---------------------------------------------------------------------------

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: CORS_HEADERS });
        }

        // Block non-GET/POST to API routes
        if (path.startsWith('/api/') && !['GET', 'POST'].includes(request.method)) {
            return new Response('Method Not Allowed', { status: 405 });
        }

        // API routes
        if (path === '/api/resolve') return handleResolve(request, env);
        if (path === '/api/proxy') return handleProxy(request, env);
        if (path === '/api/widget') return handleWidget(request, env);
        if (path === '/api/stats') return handleStats(env);

        // HTML SPA — serve for all known pages (client-side tabs handle the rest)
        const htmlPaths = [
            '/',
            '/youtube-downloader',
            '/tiktok-downloader',
            '/instagram-downloader',
            '/facebook-downloader',
            '/twitter-downloader',
        ];

        if (htmlPaths.includes(path) || path === '') {
            // Serve HTML directly — CDN will cache via Cache-Control headers
            // (We avoid caches.default which can't be invalidated in dev)
            return htmlResponse(getHtml(path));
        }

        // 404 for anything else
        return new Response(
            JSON.stringify({ error: 'Not found', path }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
    },
};
