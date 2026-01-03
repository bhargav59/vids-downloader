export interface VideoFormat {
    quality: string;
    format: string; // 'mp4', 'mp3', etc.
    url: string;
    size?: string;
    hasAudio: boolean;
    hasVideo: boolean;
    isAdaptive?: boolean; // True if it requires merging (audio+video)
}

export interface VideoInfo {
    platform: string;
    title: string;
    thumbnail: string;
    duration: string; // 'MM:SS'
    author: string;
    formats: VideoFormat[];
    originalUrl: string; // The original YouTube URL for yt-dlp downloads
}

export interface ExtractionResult {
    success: boolean;
    data?: VideoInfo;
    error?: string;
}
