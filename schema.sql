-- D1 Schema for VidsDoldr Analytics
-- Run: wrangler d1 execute vids-analytics --file=./schema.sql

-- Download analytics table
CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_url TEXT NOT NULL,
    platform TEXT NOT NULL,
    quality TEXT,
    video_title TEXT,
    user_agent TEXT,
    country TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Popular videos cache
CREATE TABLE IF NOT EXISTS popular_videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    video_id TEXT UNIQUE NOT NULL,
    platform TEXT NOT NULL,
    title TEXT,
    thumbnail TEXT,
    download_count INTEGER DEFAULT 1,
    last_downloaded DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Error logs for debugging
CREATE TABLE IF NOT EXISTS error_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT,
    error_message TEXT,
    stack_trace TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_downloads_platform ON downloads(platform);
CREATE INDEX IF NOT EXISTS idx_downloads_created ON downloads(created_at);
CREATE INDEX IF NOT EXISTS idx_popular_count ON popular_videos(download_count DESC);
