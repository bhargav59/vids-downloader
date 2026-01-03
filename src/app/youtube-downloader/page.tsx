import UrlInput from '@/components/home/UrlInput';
import { Download, Play, Shield, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'YouTube Video Downloader - Free, Fast & HD Quality | VidsDoldr',
    description: 'Download YouTube videos in HD, 4K, 8K quality for free. Save YouTube Shorts, playlists, and music. No registration required. Fast & unlimited downloads.',
    keywords: 'youtube video downloader, youtube downloader, download youtube videos, youtube to mp4, youtube to mp3, youtube shorts downloader, download youtube video free',
    openGraph: {
        title: 'YouTube Video Downloader - Free, Fast & HD Quality',
        description: 'Download YouTube videos in HD, 4K, 8K quality for free.',
    },
};

export default function YouTubeDownloaderPage() {
    return (
        <div className="flex-col">
            {/* Hero */}
            <section style={{ padding: '6rem 0', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(255,0,0,0.1) 0%, transparent 70%)' }}>
                <div className="container">
                    <h1 className="text-h1" style={{ marginBottom: '1.5rem' }}>
                        YouTube Video Downloader
                        <br />
                        <span style={{ fontSize: '0.6em', opacity: 0.8 }}>Download Videos in HD, 4K &amp; 8K Quality</span>
                    </h1>
                    <p className="text-body" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Download YouTube videos, Shorts, and playlists in the highest quality available. Free, fast, and no registration required.
                    </p>
                    <UrlInput />
                </div>
            </section>

            {/* Features */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>Why Use Our YouTube Downloader?</h2>
                <div className="grid-cols-3">
                    <div className="card">
                        <Zap size={32} style={{ marginBottom: '1rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">Ultra-Fast Downloads</h3>
                        <p className="text-body">Download YouTube videos instantly with our optimized servers.</p>
                    </div>
                    <div className="card">
                        <Play size={32} style={{ marginBottom: '1rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">All Formats Supported</h3>
                        <p className="text-body">MP4, WebM, MP3 audio extraction, and more formats available.</p>
                    </div>
                    <div className="card">
                        <Shield size={32} style={{ marginBottom: '1rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">Safe &amp; Secure</h3>
                        <p className="text-body">No malware, no ads, no data tracking. Your privacy is protected.</p>
                    </div>
                </div>
            </section>

            {/* How to Download */}
            <section style={{ background: 'var(--color-surface)', padding: '4rem 0' }}>
                <div className="container">
                    <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>How to Download YouTube Videos</h2>
                    <div className="grid-cols-3" style={{ textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>1</div>
                            <h3 className="text-h3">Copy YouTube URL</h3>
                            <p className="text-body">Find the video on YouTube and copy its URL from the address bar.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>2</div>
                            <h3 className="text-h3">Paste &amp; Analyze</h3>
                            <p className="text-body">Paste the URL above and we'll fetch all available quality options.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>3</div>
                            <h3 className="text-h3">Download in HD</h3>
                            <p className="text-body">Select your preferred quality (up to 8K) and download instantly.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 className="text-h2" style={{ marginBottom: '2rem' }}>Download YouTube Videos Online - Free &amp; Unlimited</h2>
                <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                    Looking for the best way to download YouTube videos? VidsDoldr is your go-to solution for saving any YouTube video in high quality. Whether you want to download music videos, tutorials, documentaries, or entertainment content, our YouTube video downloader makes it simple and fast.
                </p>
                <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                    Our YouTube downloader supports all video resolutions from 144p to 8K Ultra HD. You can also extract audio from YouTube videos and save them as high-quality MP3 files - perfect for downloading music and podcasts.
                </p>
                <h3 className="text-h3" style={{ marginTop: '2rem', marginBottom: '1rem' }}>Features of Our YouTube Video Downloader:</h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '2rem' }}>
                    <li className="text-body">Download YouTube videos in 4K and 8K quality</li>
                    <li className="text-body">Save YouTube Shorts instantly</li>
                    <li className="text-body">Extract audio as MP3</li>
                    <li className="text-body">No registration or software installation</li>
                    <li className="text-body">Works on all devices (mobile, tablet, desktop)</li>
                    <li className="text-body">Unlimited free downloads</li>
                </ul>
            </section>

            {/* CTA */}
            <section style={{ padding: '4rem 0', textAlign: 'center', background: 'var(--color-surface)' }}>
                <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>Start Downloading YouTube Videos Now</h2>
                <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Go to Downloader</Link>
            </section>
        </div>
    );
}
