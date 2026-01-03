import UrlInput from '@/components/home/UrlInput';
import { Camera, Film, Shield, Zap } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Instagram Video Downloader - Reels, Stories & Posts | VidsDoldr',
    description: 'Download Instagram Reels, Stories, and Videos for free. Save Instagram content in HD quality. No login required. Fast & unlimited downloads.',
    keywords: 'instagram video downloader, instagram downloader, download instagram video, instagram reels downloader, save instagram video, instagram story downloader',
    openGraph: {
        title: 'Instagram Video Downloader - Reels, Stories & Posts',
        description: 'Download Instagram Reels, Stories, and Videos for free in HD.',
    },
};

export default function InstagramDownloaderPage() {
    return (
        <div className="flex-col">
            {/* Hero */}
            <section style={{ padding: '6rem 0', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(225,48,108,0.1) 0%, transparent 70%)' }}>
                <div className="container">
                    <h1 className="text-h1" style={{ marginBottom: '1.5rem' }}>
                        Instagram Video Downloader
                        <br />
                        <span style={{ fontSize: '0.6em', opacity: 0.8 }}>Save Reels, Stories &amp; Videos</span>
                    </h1>
                    <p className="text-body" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Download Instagram Reels, Stories, IGTV, and post videos in HD quality. Free, fast, and no login required.
                    </p>
                    <UrlInput />
                </div>
            </section>

            {/* Features */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>Download All Instagram Content</h2>
                <div className="grid-cols-3">
                    <div className="card">
                        <Film size={32} style={{ marginBottom: '1rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">Instagram Reels</h3>
                        <p className="text-body">Download Instagram Reels in full HD quality with audio.</p>
                    </div>
                    <div className="card">
                        <Camera size={32} style={{ marginBottom: '1rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">Stories &amp; Highlights</h3>
                        <p className="text-body">Save Instagram Stories and Highlights before they disappear.</p>
                    </div>
                    <div className="card">
                        <Zap size={32} style={{ marginBottom: '1rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">Fast &amp; Easy</h3>
                        <p className="text-body">Just paste the link and download. No login or app needed.</p>
                    </div>
                </div>
            </section>

            {/* How to Download */}
            <section style={{ background: 'var(--color-surface)', padding: '4rem 0' }}>
                <div className="container">
                    <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>How to Download Instagram Videos</h2>
                    <div className="grid-cols-3" style={{ textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>1</div>
                            <h3 className="text-h3">Copy Instagram Link</h3>
                            <p className="text-body">Open Instagram, tap the three dots on any post/reel, and copy the link.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>2</div>
                            <h3 className="text-h3">Paste URL</h3>
                            <p className="text-body">Paste the Instagram URL in the downloader above.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>3</div>
                            <h3 className="text-h3">Download in HD</h3>
                            <p className="text-body">Click download and save the video to your device.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 className="text-h2" style={{ marginBottom: '2rem' }}>Save Instagram Reels &amp; Videos - Free Online Downloader</h2>
                <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                    VidsDoldr is the easiest way to download Instagram videos, Reels, Stories, and IGTV content. Our Instagram video downloader is completely free and works without any login or registration.
                </p>
                <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                    Whether you want to save a funny Reel, download your own content, or archive Stories before they expire, our tool makes it simple. Just copy the Instagram link and paste it in our downloader.
                </p>
                <h3 className="text-h3" style={{ marginTop: '2rem', marginBottom: '1rem' }}>What You Can Download:</h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '2rem' }}>
                    <li className="text-body">Instagram Reels (short videos)</li>
                    <li className="text-body">Instagram Stories (before they disappear)</li>
                    <li className="text-body">IGTV videos (long-form content)</li>
                    <li className="text-body">Video posts from public profiles</li>
                    <li className="text-body">Photos and carousel posts</li>
                </ul>
            </section>

            {/* CTA */}
            <section style={{ padding: '4rem 0', textAlign: 'center', background: 'var(--color-surface)' }}>
                <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>Download Instagram Videos Now</h2>
                <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Go to Downloader</Link>
            </section>
        </div>
    );
}
