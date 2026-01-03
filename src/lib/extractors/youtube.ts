import { spawn } from 'child_process';
import { VideoInfo, VideoFormat } from '../types';

interface YtDlpFormat {
    format_id: string;
    ext: string;
    resolution?: string;
    height?: number;
    width?: number;
    filesize?: number;
    filesize_approx?: number;
    vcodec?: string;
    acodec?: string;
    format_note?: string;
    tbr?: number;
    abr?: number;
}

interface YtDlpInfo {
    id: string;
    title: string;
    thumbnail: string;
    thumbnails?: { url: string }[];
    duration: number;
    uploader: string;
    channel?: string;
    extractor?: string;
    extractor_key?: string;
    formats: YtDlpFormat[];
    webpage_url: string;
}

/**
 * Executes yt-dlp and returns the parsed JSON output.
 * yt-dlp supports 1000+ sites including YouTube, Instagram, TikTok, Facebook, Twitter, etc.
 */
const runYtDlp = (args: string[]): Promise<YtDlpInfo> => {
    return new Promise((resolve, reject) => {
        const proc = spawn('yt-dlp', args);
        let stdout = '';
        let stderr = '';

        proc.stdout.on('data', (data) => { stdout += data.toString(); });
        proc.stderr.on('data', (data) => { stderr += data.toString(); });

        proc.on('close', (code) => {
            if (code === 0) {
                try {
                    resolve(JSON.parse(stdout));
                } catch (e) {
                    reject(new Error(`Failed to parse video info: ${stdout.substring(0, 200)}`));
                }
            } else {
                // Provide more helpful error messages
                if (stderr.includes('empty media response') || stderr.includes('Login required')) {
                    reject(new Error('This platform requires login. Please try a public video or use cookies.'));
                } else if (stderr.includes('HTTP Error 404') || stderr.includes('not found')) {
                    reject(new Error('Video not found. Please check the URL.'));
                } else if (stderr.includes('Private')) {
                    reject(new Error('This video is private and cannot be downloaded.'));
                } else if (stderr.includes('not granting access')) {
                    reject(new Error('Platform API blocked access. Try with browser cookies.'));
                } else {
                    reject(new Error(`Extraction failed: ${stderr.substring(0, 200)}`));
                }
            }
        });

        proc.on('error', (err) => {
            reject(new Error(`Failed to run yt-dlp: ${err.message}`));
        });
    });
};

const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatSize = (bytes: number | undefined): string => {
    if (!bytes) return 'Unknown';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
};

const detectPlatform = (url: string, extractor?: string): string => {
    if (extractor) {
        const ext = extractor.toLowerCase();
        if (ext.includes('youtube')) return 'YouTube';
        if (ext.includes('instagram')) return 'Instagram';
        if (ext.includes('tiktok')) return 'TikTok';
        if (ext.includes('facebook') || ext.includes('fb')) return 'Facebook';
        if (ext.includes('twitter') || ext.includes('x.com')) return 'Twitter';
        if (ext.includes('vimeo')) return 'Vimeo';
        if (ext.includes('reddit')) return 'Reddit';
        return extractor;
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('facebook.com') || url.includes('fb.watch')) return 'Facebook';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'Twitter';
    return 'Video';
};

/**
 * Universal video extractor - supports all yt-dlp compatible sites
 */
export const extractVideo = async (url: string): Promise<VideoInfo> => {
    // Build yt-dlp arguments
    // Use --cookies-from-browser to handle sites that need login (Instagram, etc.)
    const args = [
        '--dump-json',
        '--no-warnings',
        '--no-playlist',
        '--cookies-from-browser', 'brave', // Try to use Brave cookies for authenticated content
        url
    ];

    let info: YtDlpInfo;

    try {
        info = await runYtDlp(args);
    } catch (e) {
        // If cookies fail, try without cookies
        const argsNoCookies = [
            '--dump-json',
            '--no-warnings',
            '--no-playlist',
            url
        ];
        info = await runYtDlp(argsNoCookies);
    }

    const thumbnail = info.thumbnail || info.thumbnails?.[0]?.url || '';

    // Process formats - simplified approach
    const allFormats: VideoFormat[] = [];
    const seenQualities = new Set<string>();

    // Sort formats by quality (height) descending
    const sortedFormats = [...(info.formats || [])].sort((a, b) => (b.height || 0) - (a.height || 0));

    for (const f of sortedFormats) {
        const hasVideo = f.vcodec && f.vcodec !== 'none';
        const hasAudio = f.acodec && f.acodec !== 'none';
        const height = f.height || 0;
        const ext = f.ext || 'mp4';
        const size = f.filesize || f.filesize_approx;

        // For video formats
        if (hasVideo) {
            const qualityLabel = height > 0 ? `${height}p` : (f.format_note || 'Video');
            const key = `${qualityLabel}-${hasAudio ? 'av' : 'v'}`;

            if (!seenQualities.has(key)) {
                seenQualities.add(key);
                allFormats.push({
                    quality: qualityLabel,
                    format: ext,
                    url: f.format_id,
                    size: formatSize(size),
                    hasAudio: !!hasAudio,
                    hasVideo: true,
                    isAdaptive: !hasAudio
                });
            }
        }
    }

    // Add one audio-only option if available
    const audioFormat = sortedFormats.find(f =>
        (!f.vcodec || f.vcodec === 'none') && f.acodec && f.acodec !== 'none'
    );
    if (audioFormat) {
        allFormats.push({
            quality: 'Audio Only',
            format: audioFormat.ext || 'm4a',
            url: audioFormat.format_id,
            size: formatSize(audioFormat.filesize || audioFormat.filesize_approx),
            hasAudio: true,
            hasVideo: false,
            isAdaptive: false
        });
    }

    // If no formats found, add a "best" option
    if (allFormats.length === 0) {
        allFormats.push({
            quality: 'Best Available',
            format: 'mp4',
            url: 'best',
            size: 'Unknown',
            hasAudio: true,
            hasVideo: true,
            isAdaptive: false
        });
    }

    return {
        platform: detectPlatform(url, info.extractor_key || info.extractor),
        title: info.title || 'Untitled Video',
        thumbnail: thumbnail,
        duration: formatDuration(info.duration),
        author: info.uploader || info.channel || 'Unknown',
        formats: allFormats,
        originalUrl: info.webpage_url || url
    };
};

export const extractYouTube = extractVideo;
