'use client';

import { VideoInfo, VideoFormat } from '@/lib/types';
import { Download, FileVideo, Music, Link, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DownloadOptions({ data }: { data: VideoInfo }) {
    const [newUrl, setNewUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeWidget, setActiveWidget] = useState<string | null>(null);
    const router = useRouter();

    const handleDownload = (format: VideoFormat) => {
        if (format.isWidget && format.url) {
            setActiveWidget(format.url);
            return;
        }
        // Preserve Unicode letters (Hindi, Chinese, etc), only remove unsafe filesystem chars
        const safeTitle = data.title
            .replace(/[<>:"/\\|?*]/g, '') // Remove filesystem-unsafe characters
            .replace(/\s+/g, '_')          // Replace spaces with underscores
            .substring(0, 100);            // Limit length
        const info = format.quality === 'Audio Only' ? 'audio' : `${format.quality}`;
        const ext = format.isAdaptive ? 'mp4' : format.format;
        const filename = `${safeTitle}_${info}.${ext}`;

        const params = new URLSearchParams({
            url: data.originalUrl,
            formatId: format.url,
            filename: filename,
            isAdaptive: format.isAdaptive ? 'true' : 'false'
        });

        window.location.href = `/api/proxy?${params.toString()}`;
    };

    const handleNewSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl.trim()) return;
        setLoading(true);
        router.push(`/download?url=${encodeURIComponent(newUrl.trim())}`);
    };

    return (
        <div className="container" style={{ padding: '2rem 0 4rem' }}>
            {/* Search Box */}
            <form onSubmit={handleNewSearch} style={{ marginBottom: '2rem' }}>
                <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    maxWidth: '700px',
                    margin: '0 auto',
                    background: 'var(--color-surface)',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', padding: '0 0.75rem', opacity: 0.5 }}>
                        <Link size={18} />
                    </div>
                    <input
                        type="text"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="Paste another video URL..."
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '1rem',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        {loading ? 'Loading...' : 'Download'}
                        {!loading && <ArrowRight size={16} style={{ marginLeft: '6px' }} />}
                    </button>
                </div>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 400px) 1fr', gap: '4rem', alignItems: 'start' }}>
                {/* Left: Video Preview */}
                <div className="card">
                    <img
                        src={data.thumbnail}
                        alt={`${data.title} thumbnail`}
                        style={{ width: '100%', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', aspectRatio: '16/9', objectFit: 'cover' }}
                    />
                    <h2 className="text-h3" style={{ marginBottom: '0.5rem', lineHeight: '1.4' }}>{data.title}</h2>
                    <div className="text-body" style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', opacity: 0.8 }}>
                        <span>{data.author}</span>
                        <span>{data.duration}</span>
                    </div>
                </div>

                {/* Right: Download Options */}
                <div>
                    <h1 className="text-h2">Download Options</h1>

                    {/* Widget Iframe Modal overlay if activeWidget is set */}
                    {activeWidget && (
                        <div style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}>
                            <div style={{ width: '100%', maxWidth: '600px', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h3 style={{ margin: 0, color: 'var(--color-text)' }}>Native Download Proxy</h3>
                                    <button onClick={() => setActiveWidget(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
                                </div>
                                <iframe
                                    src={`/api/widget?url=${encodeURIComponent(activeWidget)}`}
                                    style={{ width: '100%', height: '100px', border: 'none', background: 'transparent' }}
                                    title="Download Proxy"
                                />
                                <div style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', opacity: 0.6, textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
                                    Click the button in the frame above to instantly save the file to your device.
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-col" style={{ gap: '1rem' }}>
                        {data.formats.map((format, idx) => (
                            <div
                                key={idx}
                                className="card"
                                style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        background: format.hasVideo ? 'rgba(0, 240, 255, 0.1)' : 'rgba(0, 224, 176, 0.1)',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        color: format.hasVideo ? 'var(--color-accent)' : 'var(--color-success)'
                                    }}>
                                        {format.hasVideo ? <FileVideo size={24} /> : <Music size={24} />}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                                            {format.quality || 'Standard'}
                                            <span style={{ fontSize: '0.8rem', opacity: 0.6, marginLeft: '8px', textTransform: 'uppercase' }}>
                                                {format.format}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>
                                            {format.size} • {format.hasVideo ? 'Video + Audio' : 'Audio Only'}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDownload(format)}
                                    className="btn btn-primary"
                                    style={{ padding: '0.5rem 1.5rem', fontSize: '0.9rem' }}
                                >
                                    <Download size={16} style={{ marginRight: '8px' }} /> Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
