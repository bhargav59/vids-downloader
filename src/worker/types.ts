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
