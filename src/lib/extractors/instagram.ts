import { spawn } from 'child_process';
import { VideoInfo, VideoFormat } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Extract the shortcode from an Instagram URL
 * Handles: /reel/SHORTCODE, /p/SHORTCODE, /tv/SHORTCODE
 */
const extractShortcode = (url: string): string | null => {
    const patterns = [
        /instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/stories\/[^\/]+\/(\d+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

/**
 * Run instaloader to download Instagram content
 */
const runInstaloader = (shortcode: string, outputDir: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // instaloader downloads to current dir with specific naming
        const args = [
            '--no-metadata-json',
            '--no-captions',
            '--no-profile-pic',
            '--dirname-pattern', outputDir,
            '--filename-pattern', '{shortcode}',
            '--', `-${shortcode}`  // The -- tells instaloader this is a shortcode, not username
        ];

        console.log('Running instaloader:', args.join(' '));

        const proc = spawn('instaloader', args);
        let stderr = '';

        proc.stderr.on('data', (data) => {
            stderr += data.toString();
            console.log('instaloader:', data.toString());
        });

        proc.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                if (stderr.includes('Login required')) {
                    reject(new Error('Instagram requires login. Please try with a public post.'));
                } else if (stderr.includes('Not Found')) {
                    reject(new Error('Instagram post not found. Check the URL.'));
                } else {
                    reject(new Error(`Instaloader failed: ${stderr.substring(0, 200)}`));
                }
            }
        });

        proc.on('error', (err) => {
            reject(new Error(`Failed to run instaloader: ${err.message}`));
        });
    });
};

/**
 * Extract Instagram video/image info
 */
export const extractInstagram = async (url: string): Promise<VideoInfo> => {
    const shortcode = extractShortcode(url);

    if (!shortcode) {
        throw new Error('Invalid Instagram URL. Please provide a valid reel, post, or IGTV link.');
    }

    // Create temp dir for download
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'insta-'));

    try {
        await runInstaloader(shortcode, tmpDir);

        // Find downloaded file
        const files = fs.readdirSync(tmpDir);
        const videoFile = files.find(f => f.endsWith('.mp4'));
        const imageFile = files.find(f => f.endsWith('.jpg') || f.endsWith('.png'));

        if (!videoFile && !imageFile) {
            throw new Error('No media found. The post may be private or require login.');
        }

        const mediaFile = videoFile || imageFile;
        const mediaPath = path.join(tmpDir, mediaFile!);
        const stats = fs.statSync(mediaPath);
        const isVideo = !!videoFile;

        // For simplicity, we'll return a format that points to the downloaded file
        // The proxy will serve this file
        const formats: VideoFormat[] = [{
            quality: isVideo ? 'HD' : 'Original',
            format: isVideo ? 'mp4' : 'jpg',
            url: mediaPath, // Store the local file path
            size: (stats.size / 1024 / 1024).toFixed(2) + ' MB',
            hasAudio: isVideo,
            hasVideo: isVideo,
            isAdaptive: false
        }];

        return {
            platform: 'Instagram',
            title: `Instagram ${isVideo ? 'Reel' : 'Post'} - ${shortcode}`,
            thumbnail: imageFile ? path.join(tmpDir, imageFile) : '',
            duration: '0:00',
            author: 'Instagram User',
            formats,
            originalUrl: url
        };

    } catch (error) {
        // Cleanup on error
        try {
            fs.rmSync(tmpDir, { recursive: true });
        } catch { }
        throw error;
    }
};

/**
 * Check if URL is Instagram
 */
export const isInstagramUrl = (url: string): boolean => {
    return url.includes('instagram.com');
};
