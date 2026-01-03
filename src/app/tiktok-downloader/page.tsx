import UrlInput from '@/components/home/UrlInput';
import { Download, Sparkles, Shield, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'TikTok Downloader - No Watermark, HD Quality | VidsDoldr',
    description: 'Download TikTok videos without watermark in HD quality. Save TikTok videos, sounds, and slideshows for free. Fast, unlimited, no registration.',
    keywords: 'tiktok downloader, tiktok video downloader, download tiktok video, tiktok downloader no watermark, save tiktok videos, tiktok video download',
    openGraph: {
        title: 'TikTok Downloader - No Watermark, HD Quality',
        description: 'Download TikTok videos without watermark in HD quality for free.',
    },
};

export default function TikTokDownloaderPage() {
    return (
        <div className="flex-col">
            {/* Hero */}
            <section style={{ padding: '6rem 0', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(0,255,255,0.1) 0%, transparent 70%)' }}>
                <div className="container">
                    <h1 className="text-h1" style={{ marginBottom: '1.5rem' }}>
                        TikTok Video Downloader
                        <br />
                        <span style={{ fontSize: '0.6em', opacity: 0.8 }}>Download Without Watermark</span>
                    </h1>
                    <p className="text-body" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Save TikTok videos without watermark in HD quality. Download any TikTok video, sound, or slideshow for free.
                    </p>
                    <UrlInput />
                </div>
            </section>

            {/* Features */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>Why Use Our TikTok Downloader?</h2>
                <div className="grid-cols-3">
                    <div className="card">
                        <Sparkles size={32} style={{ marginBottom: '1rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">No Watermark</h3>
                        <p className="text-body">Download clean TikTok videos without the TikTok watermark overlay.</p>
                    </div>
                    <div className="card">
                        <Zap size={32} style={{ marginBottom: '1rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">Instant Downloads</h3>
                        <p className="text-body">Super fast processing - your TikTok video is ready in seconds.</p>
                    </div>
                    <div className="card">
                        <Shield size={32} style={{ marginBottom: '1rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">Safe &amp; Private</h3>
                        <p className="text-body">No data collection, no login required. 100% secure downloads.</p>
                    </div>
                </div>
            </section>

            {/* How to Download */}
            <section style={{ background: 'var(--color-surface)', padding: '4rem 0' }}>
                <div className="container">
                    <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>How to Download TikTok Videos</h2>
                    <div className="grid-cols-3" style={{ textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>1</div>
                            <h3 className="text-h3">Copy TikTok Link</h3>
                            <p className="text-body">Open TikTok, tap "Share" on any video, and copy the link.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>2</div>
                            <h3 className="text-h3">Paste URL</h3>
                            <p className="text-body">Paste the TikTok URL in the downloader above.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>3</div>
                            <h3 className="text-h3">Download Without Watermark</h3>
                            <p className="text-body">Click download and save the video without watermark.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 className="text-h2" style={{ marginBottom: '2rem' }}>Save TikTok Videos Without Watermark - Free &amp; Fast</h2>
                <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                    Want to download TikTok videos without the annoying watermark? VidsDoldr's TikTok downloader is the best solution for saving TikTok content in pristine quality without any watermarks or logos.
                </p>
                <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                    Our TikTok video downloader works on all devices - iPhone, Android, Windows, and Mac. No app installation needed - just paste the link and download. We support all types of TikTok content including videos, slideshows, and sounds.
                </p>
                <h3 className="text-h3" style={{ marginTop: '2rem', marginBottom: '1rem' }}>Features of Our TikTok Downloader:</h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '2rem' }}>
                    <li className="text-body">Remove TikTok watermark automatically</li>
                    <li className="text-body">Download in HD quality</li>
                    <li className="text-body">Save TikTok sounds as MP3</li>
                    <li className="text-body">Download TikTok slideshows</li>
                    <li className="text-body">Works on mobile &amp; desktop</li>
                    <li className="text-body">Unlimited free downloads</li>
                </ul>
            </section>

            {/* CTA */}
            <section style={{ padding: '4rem 0', textAlign: 'center', background: 'var(--color-surface)' }}>
                <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>Download TikTok Videos Now</h2>
                <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Go to Downloader</Link>
            </section>
        </div>
    );
}
