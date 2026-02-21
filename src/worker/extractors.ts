/**
 * VidsDownloader - Platform Extractors
 *
 * All extractors use free public APIs/scraping approaches that work
 * inside Cloudflare Workers (no Node.js APIs, no binaries).
 *
 * Platforms supported:
 *  - YouTube  → noembed.com (metadata) + yt1s.is (download links)
 *  - TikTok   → tikwm.com free public API
 *  - Instagram → igram.world free API
 *  - Facebook  → fdownloader.net scraping
 *  - Twitter/X → twitsave.com scraping
 */

import { VideoInfo, VideoFormat } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format seconds → M:SS */
const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

/** Format bytes → "X.XX MB" */
const formatSize = (bytes: number | undefined): string => {
    if (!bytes || bytes <= 0) return 'Unknown';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

/** Common browser-like headers to avoid blocks */
const browserHeaders = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
};

// ---------------------------------------------------------------------------
// YouTube
// ---------------------------------------------------------------------------

/**
 * Extract YouTube video info + download links.
 *
 * Strategy:
 *  1. Parse video ID from URL
 *  2. Get metadata from noembed.com (always works, free, no key)
 *  3. Get actual mp4/webm download links from yt1s.is API
 *     (popular free service, no sign-up)
 */
export async function extractYouTube(url: string): Promise<VideoInfo> {
    // --- Step 1: Parse video ID ---
    const videoIdMatch = url.match(
        /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    if (!videoIdMatch) throw new Error('Invalid YouTube URL. Please use a watch, shorts, or youtu.be link.');
    const videoId = videoIdMatch[1];

    // --- Step 2: Video metadata via noembed ---
    const metaResp = await fetch(
        `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`,
        { headers: browserHeaders }
    );

    if (!metaResp.ok) throw new Error('Could not fetch YouTube video information.');

    const meta = await metaResp.json() as {
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
        error?: string;
    };

    if (meta.error || !meta.title) {
        throw new Error('Video is unavailable or private. Please try a public video.');
    }

    // --- Step 3: Download links via yt1s.is ---
    const formats: VideoFormat[] = [];

    try {
        // Attempt yt1s API for real download links
        const analyzeResp = await fetch('https://yt1s.is/api/ajaxSearch/index', {
            method: 'POST',
            headers: {
                ...browserHeaders,
                'Content-Type': 'application/x-www-form-urlencoded',
                Origin: 'https://yt1s.is',
                Referer: 'https://yt1s.is/',
            },
            body: `q=https://www.youtube.com/watch?v=${videoId}&vt=home`,
        });

        if (analyzeResp.ok) {
            const analyzeData = await analyzeResp.json() as {
                status?: string;
                mess?: string;
                page?: string;
                vid?: string;
                kc?: string;
                links?: {
                    mp4?: Record<string, { size: string; f: string; q: string; q_text: string; k: string }>;
                    mp3?: Record<string, { size: string; f: string; q: string; q_text: string; k: string }>;
                };
            };

            if (analyzeData.status === 'ok' && analyzeData.links) {
                // Build convert requests for each quality
                const kc = analyzeData.kc || '';
                const vid = analyzeData.vid || videoId;
                const mp4Links = analyzeData.links.mp4 || {};
                const mp3Links = analyzeData.links.mp3 || {};

                // Priority qualities
                const wantedQualities = ['1080', '720', '480', '360'];

                for (const q of wantedQualities) {
                    const link = mp4Links[q];
                    if (!link) continue;

                    try {
                        const convertResp = await fetch('https://yt1s.is/api/ajaxConvert/convert', {
                            method: 'POST',
                            headers: {
                                ...browserHeaders,
                                'Content-Type': 'application/x-www-form-urlencoded',
                                Origin: 'https://yt1s.is',
                                Referer: 'https://yt1s.is/',
                            },
                            body: `vid=${vid}&k=${encodeURIComponent(link.k)}`,
                        });

                        if (convertResp.ok) {
                            const convertData = await convertResp.json() as { status?: string; dlink?: string };
                            if (convertData.status === 'ok' && convertData.dlink) {
                                formats.push({
                                    quality: `${q}p`,
                                    format: 'mp4',
                                    url: convertData.dlink,
                                    size: link.size || 'Unknown',
                                    hasAudio: true,
                                    hasVideo: true,
                                    isAdaptive: false,
                                });
                            }
                        }
                    } catch {
                        // Skip failed quality
                    }
                }

                // Add MP3
                const mp3Link = mp3Links['128'] || mp3Links['192'] || Object.values(mp3Links)[0];
                if (mp3Link) {
                    try {
                        const mp3Resp = await fetch('https://yt1s.is/api/ajaxConvert/convert', {
                            method: 'POST',
                            headers: {
                                ...browserHeaders,
                                'Content-Type': 'application/x-www-form-urlencoded',
                                Origin: 'https://yt1s.is',
                                Referer: 'https://yt1s.is/',
                            },
                            body: `vid=${vid}&k=${encodeURIComponent(mp3Link.k)}`,
                        });
                        if (mp3Resp.ok) {
                            const mp3Data = await mp3Resp.json() as { status?: string; dlink?: string };
                            if (mp3Data.status === 'ok' && mp3Data.dlink) {
                                formats.push({
                                    quality: 'MP3 Audio',
                                    format: 'mp3',
                                    url: mp3Data.dlink,
                                    size: mp3Link.size || 'Unknown',
                                    hasAudio: true,
                                    hasVideo: false,
                                    isAdaptive: false,
                                });
                            }
                        }
                    } catch { /* skip */ }
                }
            }
        }
    } catch {
        // yt1s failed — fall through to cobalt fallback below
    }

    // --- Fallback: cobalt.tools API ---
    if (formats.length === 0) {
        try {
            const cobaltResp = await fetch('https://api.cobalt.tools/', {
                method: 'POST',
                headers: {
                    ...browserHeaders,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    vQuality: '1080',
                    filenameStyle: 'pretty',
                }),
            });

            if (cobaltResp.ok) {
                const cobaltData = await cobaltResp.json() as { status?: string; url?: string; urls?: string[] };
                if (cobaltData.status === 'redirect' || cobaltData.status === 'stream') {
                    const dlUrl = cobaltData.url || (cobaltData.urls && cobaltData.urls[0]);
                    if (dlUrl) {
                        formats.push({ quality: '1080p', format: 'mp4', url: dlUrl, size: 'HD', hasAudio: true, hasVideo: true, isAdaptive: false });
                    }
                }
            }
        } catch { /* skip */ }
    }

    // --- Last resort: redirect to a real YouTube download page ---
    if (formats.length === 0) {
        formats.push({
            quality: 'Best Quality (MP4)',
            format: 'mp4',
            url: `https://ssyoutube.com/watch?v=${videoId}`,
            size: 'Variable',
            hasAudio: true,
            hasVideo: true,
            isAdaptive: false,
            isExternal: true,
        } as VideoFormat & { isExternal: boolean });
        formats.push({
            quality: 'MP3 Audio',
            format: 'mp3',
            url: `https://ytmp3.nu/api/widget/?url=https://www.youtube.com/watch?v=${videoId}`,
            size: 'Variable',
            hasAudio: true,
            hasVideo: false,
            isAdaptive: false,
            isExternal: true,
        } as VideoFormat & { isExternal: boolean });
    }

    return {
        platform: 'YouTube',
        title: meta.title || 'YouTube Video',
        thumbnail: meta.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: '0:00', // oEmbed/noembed doesn't provide duration
        author: meta.author_name || 'Unknown',
        formats,
        originalUrl: `https://www.youtube.com/watch?v=${videoId}`,
    };
}

// ---------------------------------------------------------------------------
// TikTok
// ---------------------------------------------------------------------------

/**
 * Extract TikTok video using tikwm.com free public API.
 * No API key required, handles watermarked + watermark-free versions.
 */
export async function extractTikTok(url: string): Promise<VideoInfo> {
    // tikwm.com is a well-known free TikTok API
    const apiResp = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`, {
        headers: {
            ...browserHeaders,
            Referer: 'https://www.tikwm.com/',
        },
    });

    if (!apiResp.ok) throw new Error('TikTok extraction service is temporarily unavailable. Please try again.');

    const data = await apiResp.json() as {
        code?: number;
        msg?: string;
        data?: {
            title?: string;
            cover?: string;
            duration?: number;
            author?: { nickname?: string; unique_id?: string };
            play?: string;        // HD no-watermark
            hdplay?: string;      // Full HD
            wmplay?: string;      // Watermarked
            music?: string;       // Audio only
            music_info?: { title?: string };
            size?: number;
            hd_size?: number;
            wm_size?: number;
            music_size?: number;
        };
    };

    if (data.code !== 0 || !data.data) {
        throw new Error(data.msg || 'Could not extract TikTok video. The video may be private or deleted.');
    }

    const v = data.data;
    const formats: VideoFormat[] = [];

    if (v.hdplay) {
        formats.push({
            quality: 'Full HD (No Watermark)',
            format: 'mp4',
            url: v.hdplay,
            size: formatSize(v.hd_size),
            hasAudio: true,
            hasVideo: true,
            isAdaptive: false,
        });
    }

    if (v.play) {
        formats.push({
            quality: 'HD (No Watermark)',
            format: 'mp4',
            url: v.play,
            size: formatSize(v.size),
            hasAudio: true,
            hasVideo: true,
            isAdaptive: false,
        });
    }

    if (v.wmplay) {
        formats.push({
            quality: 'SD (Watermarked)',
            format: 'mp4',
            url: v.wmplay,
            size: formatSize(v.wm_size),
            hasAudio: true,
            hasVideo: true,
            isAdaptive: false,
        });
    }

    if (v.music) {
        formats.push({
            quality: 'Music / Audio',
            format: 'mp3',
            url: v.music,
            size: formatSize(v.music_size),
            hasAudio: true,
            hasVideo: false,
            isAdaptive: false,
        });
    }

    if (formats.length === 0) throw new Error('No downloadable formats found for this TikTok video.');

    return {
        platform: 'TikTok',
        title: v.title || 'TikTok Video',
        thumbnail: v.cover || '',
        duration: formatDuration(v.duration || 0),
        author: v.author?.nickname || v.author?.unique_id || 'TikTok User',
        formats,
        originalUrl: url,
    };
}

// ---------------------------------------------------------------------------
// Instagram
// ---------------------------------------------------------------------------

/**
 * Extract Instagram reels/posts.
 *
 * Based on yt-dlp's exact Instagram extractor logic (used by Seal Android app):
 *   https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/extractor/instagram.py
 *
 * Strategy:
 *  1. GET graphql/query?doc_id=8845758582119845 — works WITHOUT cookies for public posts!
 *     Returns xdt_shortcode_media with video_url directly.
 *  2. If INSTAGRAM_COOKIE set → use private mobile API (i.instagram.com/api/v1/media/{pk}/info/)
 *     for private/rate-limited posts.
 *  3. External download page links as fallback.
 *
 * This is the same method that yt-dlp, Seal, and every real downloader uses.
 */
export async function extractInstagram(url: string, cookie?: string): Promise<VideoInfo> {
    const shortcodeMatch = url.match(/instagram\.com\/(?:reel|p|tv|reels?(?!\/audio\/))\/([A-Za-z0-9_-]+)/);
    const shortcode = shortcodeMatch ? shortcodeMatch[1] : '';

    if (!shortcode) throw new Error('Invalid Instagram URL. Please use a Reel, post, or IGTV link.');

    // Common IG API headers (from yt-dlp source)
    const igApiHeaders: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459',
        'X-ASBD-ID': '198387',
        'X-IG-WWW-Claim': '0',
        'Origin': 'https://www.instagram.com',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
    };

    let title = 'Instagram Video';
    let thumbnail = '';
    let author = 'Instagram User';
    let duration = '0:00';

    // -----------------------------------------------------------------------
    // Method 1 (primary): yt-dlp's exact GET GraphQL query
    // Works for public posts WITHOUT any session cookie!
    // -----------------------------------------------------------------------
    try {
        const variables = JSON.stringify({
            shortcode,
            child_comment_count: 3,
            fetch_comment_count: 40,
            parent_comment_count: 24,
            has_threaded_comments: true,
        });
        const gqlUrl = `https://www.instagram.com/graphql/query/?doc_id=8845758582119845&variables=${encodeURIComponent(variables)}`;

        const resp = await fetch(gqlUrl, {
            headers: {
                ...igApiHeaders,
                'X-CSRFToken': '',
                'X-Requested-With': 'XMLHttpRequest',
                'Referer': `https://www.instagram.com/reel/${shortcode}/`,
                ...(cookie ? { Cookie: cookie } : {}),
            },
        });

        if (resp.ok) {
            const gql = await resp.json() as {
                data?: {
                    xdt_shortcode_media?: {
                        __typename?: string;
                        is_video?: boolean;
                        video_url?: string;
                        display_url?: string;
                        video_duration?: number;
                        owner?: { username?: string; full_name?: string };
                        edge_media_to_caption?: { edges?: Array<{ node?: { text?: string } }> };
                        // carousel posts
                        edge_sidecar_to_children?: {
                            edges?: Array<{
                                node?: { is_video?: boolean; video_url?: string; display_url?: string };
                            }>;
                        };
                    };
                };
            };

            const media = gql?.data?.xdt_shortcode_media;

            if (media) {
                // Extract metadata
                const captionText = media.edge_media_to_caption?.edges?.[0]?.node?.text;
                if (captionText) title = captionText.substring(0, 120);
                if (media.owner?.full_name) author = media.owner.full_name;
                else if (media.owner?.username) author = `@${media.owner.username}`;
                if (media.display_url) thumbnail = media.display_url;
                if (media.video_duration) duration = formatDuration(media.video_duration);

                const formats: VideoFormat[] = [];

                if (media.is_video && media.video_url) {
                    // Single video or Reel
                    formats.push({
                        quality: 'HD',
                        format: 'mp4',
                        url: media.video_url,
                        size: 'Unknown',
                        hasAudio: true,
                        hasVideo: true,
                        isAdaptive: false,
                    });
                } else if (media.edge_sidecar_to_children?.edges) {
                    // Carousel / multi-video post
                    media.edge_sidecar_to_children.edges.forEach((edge, i) => {
                        if (edge.node?.is_video && edge.node.video_url) {
                            formats.push({
                                quality: `Video ${i + 1}`,
                                format: 'mp4',
                                url: edge.node.video_url,
                                size: 'Unknown',
                                hasAudio: true,
                                hasVideo: true,
                                isAdaptive: false,
                            });
                        }
                    });
                }

                if (formats.length > 0) {
                    return { platform: 'Instagram', title, thumbnail, duration, author, formats, originalUrl: url };
                }
            }
        }
    } catch { /* fall through */ }

    // -----------------------------------------------------------------------
    // Method 2: Private mobile API (yt-dlp uses this when session cookie is set)
    // GET https://i.instagram.com/api/v1/media/{pk}/info/
    // -----------------------------------------------------------------------
    if (cookie) {
        try {
            // Decode shortcode to numeric pk (yt-dlp's _id_to_pk)
            const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
            let pk = BigInt(0);
            for (const c of shortcode) {
                pk = pk * BigInt(64) + BigInt(CHARS.indexOf(c));
            }
            const pkStr = pk.toString();

            const mobileResp = await fetch(`https://i.instagram.com/api/v1/media/${pkStr}/info/`, {
                headers: {
                    ...igApiHeaders,
                    'Cookie': cookie,
                    'X-CSRFToken': (cookie.match(/csrftoken=([^;]+)/) || [])[1] || '',
                },
            });

            if (mobileResp.ok) {
                const mobileData = await mobileResp.json() as {
                    items?: Array<{
                        video_versions?: Array<{ url: string; width: number; height: number }>;
                        image_versions2?: { candidates?: Array<{ url: string; width: number; height: number }> };
                        caption?: { text?: string };
                        user?: { username?: string; full_name?: string };
                        video_duration?: number;
                        carousel_media?: Array<{
                            video_versions?: Array<{ url: string; width: number; height: number }>;
                        }>;
                    }>;
                };

                const item = mobileData?.items?.[0];
                if (item) {
                    const captionText = item.caption?.text;
                    if (captionText) title = captionText.substring(0, 120);
                    if (item.user?.full_name) author = item.user.full_name;
                    else if (item.user?.username) author = `@${item.user.username}`;
                    if (item.video_duration) duration = formatDuration(item.video_duration);
                    const thumbs = item.image_versions2?.candidates || [];
                    if (thumbs.length > 0) thumbnail = thumbs[0].url;

                    const formats: VideoFormat[] = (item.video_versions || [])
                        .sort((a, b) => b.width - a.width)
                        .slice(0, 3)
                        .map((v, i) => ({
                            quality: i === 0 ? `${v.width}x${v.height} HD` : `${v.width}x${v.height}`,
                            format: 'mp4',
                            url: v.url,
                            size: 'Unknown',
                            hasAudio: true,
                            hasVideo: true,
                            isAdaptive: false,
                        }));

                    if (formats.length > 0) {
                        return { platform: 'Instagram', title, thumbnail, duration, author, formats, originalUrl: url };
                    }
                }
            }
        } catch { /* fall through */ }
    }

    // -----------------------------------------------------------------------
    // Method 3: External download pages — give user 3 good options
    // -----------------------------------------------------------------------
    // Try oEmbed for thumbnail at minimum
    try {
        const oe = await fetch(
            `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}&maxwidth=640&omitscript=1`,
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );
        if (oe.ok) {
            const oed = await oe.json() as { title?: string; thumbnail_url?: string; author_name?: string };
            if (oed.thumbnail_url) thumbnail = oed.thumbnail_url;
            if (oed.author_name) author = oed.author_name;
            if (oed.title) title = oed.title;
        }
    } catch { /* best-effort */ }

    return {
        platform: 'Instagram',
        title,
        thumbnail,
        duration,
        author,
        formats: [
            {
                quality: '↗ Open on igram.world',
                format: 'mp4',
                url: `https://igram.world/?url=${encodeURIComponent(url)}`,
                size: 'Opens download site',
                hasAudio: true,
                hasVideo: true,
                isAdaptive: false,
                isExternal: true,
            } as VideoFormat & { isExternal: boolean },
            {
                quality: '↗ Open on snapinsta.app',
                format: 'mp4',
                url: `https://snapinsta.app/?url=${encodeURIComponent(url)}`,
                size: 'Opens download site',
                hasAudio: true,
                hasVideo: true,
                isAdaptive: false,
                isExternal: true,
            } as VideoFormat & { isExternal: boolean },
            {
                quality: '↗ Open on saveig.app',
                format: 'mp4',
                url: `https://saveig.app/en?url=${encodeURIComponent(url)}`,
                size: 'Opens download site',
                hasAudio: true,
                hasVideo: true,
                isAdaptive: false,
                isExternal: true,
            } as VideoFormat & { isExternal: boolean },
        ],
        originalUrl: url,
    };
}





// ---------------------------------------------------------------------------
// Facebook
// ---------------------------------------------------------------------------

/**
 * Extract Facebook videos using fdownloader.net scraping.
 */
export async function extractFacebook(url: string): Promise<VideoInfo> {
    // Use getfvid.com API - common free Facebook video downloader
    const resp = await fetch('https://getfvid.com/downloader', {
        method: 'POST',
        headers: {
            ...browserHeaders,
            'Content-Type': 'application/x-www-form-urlencoded',
            Referer: 'https://getfvid.com/',
            Origin: 'https://getfvid.com',
        },
        body: `url=${encodeURIComponent(url)}`,
    });

    if (!resp.ok) {
        throw new Error('Facebook video extraction service is unavailable. Please try again later.');
    }

    const html = await resp.text();

    // Parse download links from response HTML
    const formats: VideoFormat[] = [];

    // Match HD link
    const hdMatch = html.match(/href="(https:\/\/[^"]+facebook[^"]+(?:&dl=1|download)[^"]*)"[^>]*>[^<]*HD/i) ||
        html.match(/<a[^>]+href="(https:\/\/[^"]+)"[^>]*class="[^"]*hd[^"]*"/i);

    // Match SD link  
    const sdMatch = html.match(/href="(https:\/\/[^"]+facebook[^"]+(?:&dl=1|download)[^"]*)"[^>]*>[^<]*SD/i) ||
        html.match(/<a[^>]+href="(https:\/\/[^"]+)"[^>]*class="[^"]*sd[^"]*"/i);

    // Generic download links
    const genericLinks = [...html.matchAll(/href="(https:\/\/[^"]*(?:fbcdn\.net|facebook\.com)[^"]*(?:&dl=1|\.mp4)[^"]*)"/gi)];

    if (hdMatch?.[1]) {
        formats.push({ quality: 'HD 720p', format: 'mp4', url: hdMatch[1], size: 'Unknown', hasAudio: true, hasVideo: true, isAdaptive: false });
    }
    if (sdMatch?.[1]) {
        formats.push({ quality: 'SD 480p', format: 'mp4', url: sdMatch[1], size: 'Unknown', hasAudio: true, hasVideo: true, isAdaptive: false });
    }

    for (const link of genericLinks) {
        if (formats.length >= 3) break;
        const linkUrl = link[1];
        if (!formats.some(f => f.url === linkUrl)) {
            formats.push({ quality: `Quality ${formats.length + 1}`, format: 'mp4', url: linkUrl, size: 'Unknown', hasAudio: true, hasVideo: true, isAdaptive: false });
        }
    }

    if (formats.length === 0) {
        throw new Error('Could not extract Facebook video. Make sure the video is public and the URL is correct.');
    }

    // Extract title from og:title or title tag
    const titleMatch = html.match(/(?:og:title|<title)[^>]*content="([^"]+)"|<title>([^<]+)<\/title>/i);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2]).replace(' | getfvid', '').trim() : 'Facebook Video';

    // Extract thumbnail
    const thumbMatch = html.match(/og:image[^>]*content="([^"]+)"|<img[^>]+src="(https:\/\/[^"]*scontent[^"]+)"/i);
    const thumbnail = thumbMatch ? (thumbMatch[1] || thumbMatch[2]) : '';

    return {
        platform: 'Facebook',
        title,
        thumbnail,
        duration: '0:00',
        author: 'Facebook User',
        formats,
        originalUrl: url,
    };
}

// ---------------------------------------------------------------------------
// Twitter / X
// ---------------------------------------------------------------------------

/**
 * Extract Twitter/X videos using twitsave.com scraping.
 */
export async function extractTwitter(url: string): Promise<VideoInfo> {
    const tweetUrl = url.replace('x.com', 'twitter.com');

    const resp = await fetch(`https://twitsave.com/info?url=${encodeURIComponent(tweetUrl)}`, {
        headers: {
            ...browserHeaders,
            Referer: 'https://twitsave.com/',
        },
    });

    if (!resp.ok) {
        throw new Error('Twitter/X video extraction service is unavailable. Please try again.');
    }

    const html = await resp.text();

    const formats: VideoFormat[] = [];

    // Parse format links: <a ... class="..." href="...">1280x720</a>
    const linkMatches = [...html.matchAll(/<a[^>]+href="(https:\/\/[^"]+\.mp4[^"]*)"[^>]*>([^<]+)<\/a>/gi)];

    for (const match of linkMatches) {
        const dlUrl = match[1];
        const label = match[2].trim();
        const resMatch = label.match(/(\d+x\d+)/);
        const quality = resMatch ? resMatch[1] : label || 'HD';
        formats.push({ quality, format: 'mp4', url: dlUrl, size: 'Unknown', hasAudio: true, hasVideo: true, isAdaptive: false });
    }

    if (formats.length === 0) {
        // fallback: any mp4 link in the page
        const mp4Matches = [...html.matchAll(/href="(https:\/\/[^"]+\.mp4[^"]*)"/gi)];
        for (const match of mp4Matches) {
            if (formats.length >= 3) break;
            formats.push({ quality: `Quality ${formats.length + 1}`, format: 'mp4', url: match[1], size: 'Unknown', hasAudio: true, hasVideo: true, isAdaptive: false });
        }
    }

    if (formats.length === 0) {
        throw new Error('Could not extract Twitter/X video. Only public tweets with video are supported.');
    }

    const titleMatch = html.match(/class="[^"]*title[^"]*"[^>]*>([^<]+)<|<title>([^<|]+)/i);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2]).trim() : 'Twitter/X Video';

    const thumbMatch = html.match(/(?:poster|og:image)[^"]*"(https:\/\/[^"]+pbs\.twimg\.com[^"]+)"/i) ||
        html.match(/src="(https:\/\/[^"]+pbs\.twimg\.com\/[^"]+)"/i);
    const thumbnail = thumbMatch ? thumbMatch[1] : '';

    return {
        platform: 'Twitter/X',
        title,
        thumbnail,
        duration: '0:00',
        author: 'Twitter User',
        formats,
        originalUrl: url,
    };
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

/**
 * Detect platform and route to the appropriate extractor.
 * @param instagramCookie - Optional: full Cookie header string for Instagram session
 */
export async function extractVideo(url: string, instagramCookie?: string): Promise<VideoInfo> {
    const cleanUrl = url.trim();

    if (!cleanUrl) throw new Error('Please enter a valid URL.');

    try {
        // Validate URL format
        new URL(cleanUrl);
    } catch {
        throw new Error('Invalid URL format. Please paste the full video URL including https://');
    }

    const lower = cleanUrl.toLowerCase();

    if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
        return extractYouTube(cleanUrl);
    }
    if (lower.includes('tiktok.com')) {
        return extractTikTok(cleanUrl);
    }
    if (lower.includes('instagram.com')) {
        return extractInstagram(cleanUrl, instagramCookie);
    }
    if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) {
        return extractFacebook(cleanUrl);
    }
    if (lower.includes('twitter.com') || lower.includes('x.com')) {
        return extractTwitter(cleanUrl);
    }

    throw new Error(
        'Unsupported platform. Supported: YouTube, TikTok, Instagram, Facebook, Twitter/X.\n' +
        'Make sure you paste the full video URL.'
    );
}
