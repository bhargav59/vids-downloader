import { extractVideo } from './youtube';
import { extractInstagram, isInstagramUrl } from './instagram';
import { VideoInfo } from '../types';

/**
 * Universal video info extractor
 * Supports:
 * - YouTube (via yt-dlp)
 * - Instagram (via instaloader)
 * - TikTok, Facebook, Twitter, Vimeo, etc (via yt-dlp)
 */
export const extractVideoInfo = async (url: string): Promise<VideoInfo> => {
    const cleanUrl = url.trim();

    if (!cleanUrl) {
        throw new Error('Please enter a valid URL');
    }

    // Route Instagram to dedicated extractor
    if (isInstagramUrl(cleanUrl)) {
        return await extractInstagram(cleanUrl);
    }

    // All other platforms use yt-dlp
    return await extractVideo(cleanUrl);
};
