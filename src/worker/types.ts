/**
 * Video format interface
 */
export interface VideoFormat {
    quality: string;
    format: string;
    url: string;
    size: string;
    hasAudio: boolean;
    hasVideo: boolean;
    isAdaptive: boolean;
}

/**
 * Video information interface
 */
export interface VideoInfo {
    platform: string;
    title: string;
    thumbnail: string;
    duration: string;
    author: string;
    formats: VideoFormat[];
    originalUrl: string;
}

/**
 * API response interface
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Cloudflare environment bindings
 */
export interface Env {
    ENVIRONMENT: string;

    // KV Namespace for caching
    VIDEO_CACHE: KVNamespace;

    // R2 Bucket for video storage
    VIDEO_STORAGE: R2Bucket;

    // D1 Database for analytics
    ANALYTICS_DB: D1Database;
}

/**
 * Cache entry structure
 */
export interface CacheEntry {
    videoInfo: VideoInfo;
    timestamp: number;
    expiresAt: number;
}

/**
 * Analytics record
 */
export interface DownloadRecord {
    video_url: string;
    platform: string;
    quality: string;
    video_title: string;
    user_agent: string;
    country: string;
}
