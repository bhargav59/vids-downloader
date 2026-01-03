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
 * Cloudflare environment bindings (Free tier only)
 */
export interface Env {
    ENVIRONMENT: string;

    // KV Namespace - Video metadata caching (1GB free)
    VIDEO_CACHE: KVNamespace;

    // D1 Database - Analytics and error logging (5GB free)
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
