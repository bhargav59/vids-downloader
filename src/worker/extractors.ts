import { VideoInfo, VideoFormat } from './types';

/**
 * Format duration from seconds to MM:SS
 */
const formatDuration = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

/**
 * Format file size from bytes
 */
const formatSize = (bytes: number | undefined): string => {
    if (!bytes) return 'Unknown';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

/**
 * Extract YouTube video - Workers limitation notice
 * YouTube downloads require signature deciphering which isn't possible in Cloudflare Workers.
 * Use the local Next.js version (npm run dev) for YouTube downloads.
 */
export async function extractYouTube(url: string): Promise<VideoInfo> {
    // Get video ID from URL
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
        throw new Error('Invalid YouTube URL');
    }

    throw new Error(
        '⚠️ YouTube downloads require the local version. ' +
        'Run "npm run dev" locally and use http://localhost:3000 for YouTube. ' +
        'This cloud version supports Instagram and TikTok only.'
    );
}

/**
 * Extract Instagram video (web scraping approach)
 */
export async function extractInstagram(url: string): Promise<VideoInfo> {
    const shortcodeMatch = url.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
    if (!shortcodeMatch) {
        throw new Error('Invalid Instagram URL');
    }

    const shortcode = shortcodeMatch[1];

    const response = await fetch(`https://www.instagram.com/p/${shortcode}/embed/`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
    });

    const html = await response.text();

    const videoMatch = html.match(/"video_url":"([^"]+)"/);
    const thumbnailMatch = html.match(/"thumbnail_src":"([^"]+)"/);
    const captionMatch = html.match(/"caption":"([^"]+)"/);

    if (!videoMatch) {
        throw new Error('Could not extract Instagram video. The post may be private or require login.');
    }

    const videoUrl = videoMatch[1].replace(/\\u0026/g, '&');
    const thumbnail = thumbnailMatch ? thumbnailMatch[1].replace(/\\u0026/g, '&') : '';
    const title = captionMatch ? captionMatch[1].substring(0, 100) : `Instagram Reel - ${shortcode}`;

    return {
        platform: 'Instagram',
        title,
        thumbnail,
        duration: '0:00',
        author: 'Instagram User',
        formats: [{
            quality: 'HD',
            format: 'mp4',
            url: videoUrl,
            size: 'Unknown',
            hasAudio: true,
            hasVideo: true,
            isAdaptive: false
        }],
        originalUrl: url
    };
}

/**
 * Extract TikTok video
 */
export async function extractTikTok(url: string): Promise<VideoInfo> {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        redirect: 'follow'
    });

    const html = await response.text();

    const scriptMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/);

    if (!scriptMatch) {
        throw new Error('Could not extract TikTok video data');
    }

    let data;
    try {
        data = JSON.parse(scriptMatch[1]);
    } catch {
        throw new Error('Failed to parse TikTok data');
    }

    const videoData = data?.['__DEFAULT_SCOPE__']?.['webapp.video-detail']?.itemInfo?.itemStruct;

    if (!videoData) {
        throw new Error('TikTok video not found or is private');
    }

    const videoUrl = videoData.video?.playAddr || videoData.video?.downloadAddr;

    if (!videoUrl) {
        throw new Error('Could not get TikTok video URL');
    }

    return {
        platform: 'TikTok',
        title: videoData.desc || 'TikTok Video',
        thumbnail: videoData.video?.cover || '',
        duration: formatDuration(videoData.video?.duration || 0),
        author: videoData.author?.nickname || 'TikTok User',
        formats: [{
            quality: 'HD',
            format: 'mp4',
            url: videoUrl,
            size: 'Unknown',
            hasAudio: true,
            hasVideo: true,
            isAdaptive: false
        }],
        originalUrl: url
    };
}

/**
 * Main extraction function - routes to appropriate extractor
 */
export async function extractVideo(url: string): Promise<VideoInfo> {
    const cleanUrl = url.trim();

    if (!cleanUrl) {
        throw new Error('Please enter a valid URL');
    }

    if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
        return extractYouTube(cleanUrl);
    }

    if (cleanUrl.includes('instagram.com')) {
        return extractInstagram(cleanUrl);
    }

    if (cleanUrl.includes('tiktok.com')) {
        return extractTikTok(cleanUrl);
    }

    throw new Error('Unsupported platform. Currently supporting: YouTube (local only), Instagram, TikTok');
}
