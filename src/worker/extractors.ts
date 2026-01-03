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
 * Extract YouTube video information using ytdl-core compatible fetch
 */
export async function extractYouTube(url: string): Promise<VideoInfo> {
    // Get video ID from URL - supports watch, shorts, embed, and youtu.be
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!videoIdMatch) {
        throw new Error('Invalid YouTube URL');
    }
    const videoId = videoIdMatch[1];

    // Fetch video page to get initial player response
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
        }
    });

    const html = await response.text();

    // Extract player response JSON
    const playerResponseMatch = html.match(/var ytInitialPlayerResponse\s*=\s*({.+?});/);
    if (!playerResponseMatch) {
        throw new Error('Could not extract video data from YouTube');
    }

    let playerResponse;
    try {
        playerResponse = JSON.parse(playerResponseMatch[1]);
    } catch {
        throw new Error('Failed to parse YouTube video data');
    }

    const videoDetails = playerResponse.videoDetails;
    const streamingData = playerResponse.streamingData;

    if (!videoDetails || !streamingData) {
        throw new Error('Video is unavailable or private');
    }

    // Process formats
    const formats: VideoFormat[] = [];
    const allFormats = [...(streamingData.formats || []), ...(streamingData.adaptiveFormats || [])];

    const seenQualities = new Set<string>();

    for (const f of allFormats) {
        if (!f.url) continue; // Skip formats that require signature deciphering

        const hasVideo = f.mimeType?.includes('video');
        const hasAudio = f.mimeType?.includes('audio') || (hasVideo && f.audioQuality);
        const height = f.height || 0;
        const quality = height > 0 ? `${height}p` : (f.audioQuality || 'Unknown');
        const format = f.mimeType?.split(';')[0]?.split('/')[1] || 'mp4';

        const key = `${quality}-${hasAudio ? 'av' : 'v'}`;
        if (seenQualities.has(key)) continue;
        seenQualities.add(key);

        formats.push({
            quality,
            format,
            url: f.url,
            size: formatSize(parseInt(f.contentLength) || 0),
            hasAudio: !!hasAudio,
            hasVideo: !!hasVideo,
            isAdaptive: !hasAudio && hasVideo
        });
    }

    // Sort by quality (video first, then by resolution)
    formats.sort((a, b) => {
        if (a.hasVideo && !b.hasVideo) return -1;
        if (!a.hasVideo && b.hasVideo) return 1;
        const resA = parseInt(a.quality) || 0;
        const resB = parseInt(b.quality) || 0;
        return resB - resA;
    });

    return {
        platform: 'YouTube',
        title: videoDetails.title || 'Untitled Video',
        thumbnail: videoDetails.thumbnail?.thumbnails?.slice(-1)[0]?.url || '',
        duration: formatDuration(parseInt(videoDetails.lengthSeconds) || 0),
        author: videoDetails.author || 'Unknown',
        formats,
        originalUrl: url
    };
}

/**
 * Extract Instagram video (web scraping approach)
 */
export async function extractInstagram(url: string): Promise<VideoInfo> {
    // Extract shortcode from URL
    const shortcodeMatch = url.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
    if (!shortcodeMatch) {
        throw new Error('Invalid Instagram URL');
    }

    const shortcode = shortcodeMatch[1];

    // Try to fetch the page
    const response = await fetch(`https://www.instagram.com/p/${shortcode}/embed/`, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
    });

    const html = await response.text();

    // Try to extract video URL from embed page
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
    // Fetch TikTok page
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        redirect: 'follow'
    });

    const html = await response.text();

    // Extract JSON data from script tag
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

    throw new Error('Unsupported platform. Currently supporting: YouTube, Instagram, TikTok');
}
