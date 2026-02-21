/**
 * Type definitions for VidsDownloader Cloudflare Worker
 */

/** Individual downloadable format */
export interface VideoFormat {
    quality: string;
    format: string;
    url: string;
    size: string;
    hasAudio: boolean;
    hasVideo: boolean;
    isAdaptive: boolean;
    /** If true, this URL opens an external download page rather than a direct file */
    isExternal?: boolean;
}

/** Resolved video information */
export interface VideoInfo {
    platform: string;
    title: string;
    thumbnail: string;
    duration: string;
    author: string;
    formats: VideoFormat[];
    originalUrl: string;
}

/** Standard API response envelope */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/** Cloudflare environment bindings */
export interface Env {
    ENVIRONMENT: string;
    /** KV Namespace — video metadata cache (1GB free) */
    VIDEO_CACHE: KVNamespace;
    /** D1 Database — analytics & error logging (5GB free) */
    ANALYTICS_DB: D1Database;
    /**
     * Optional: Instagram session cookies string for private/rate-limited access.
     * Set via: npx wrangler secret put INSTAGRAM_COOKIE
     * Value: the full "Cookie" header string from a logged-in browser session.
     * Example: "sessionid=abc123; ds_user_id=456; csrftoken=xyz"
     * Get from: DevTools → Network tab → any instagram.com request → Request Headers → Cookie
     */
    INSTAGRAM_COOKIE?: string;
}

/** KV cache entry */
export interface CacheEntry {
    videoInfo: VideoInfo;
    timestamp: number;
    expiresAt: number;
}
