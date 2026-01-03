import UrlInput from '@/components/home/UrlInput';
import { Film, Shield, Zap, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Facebook Video Downloader - Save Videos & Reels | VidsDoldr',
    description: 'Download Facebook videos and Reels in HD quality for free. Save Facebook Watch videos, live streams, and stories. No registration required.',
    keywords: 'facebook video downloader, download facebook video, facebook downloader, save facebook video, facebook reels downloader, fb video downloader',
    openGraph: {
        title: 'Facebook Video Downloader - Save Videos & Reels',
        description: 'Download Facebook videos and Reels in HD quality for free.',
    },
};

export default function FacebookDownloaderPage() {
    return (
        <div className="flex-col">
            {/* Hero */}
            <section style={{ padding: '6rem 0', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(24,119,242,0.1) 0%, transparent 70%)' }}>
                <div className="container">
                    <h1 className="text-h1" style={{ marginBottom: '1.5rem' }}>
                        Facebook Video Downloader
                        <br />
                        <span style={{ fontSize: '0.6em', opacity: 0.8 }}>Download Videos &amp; Reels Free</span>
                    </h1>
                    <p className="text-body" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Save Facebook videos, Reels, and Watch content in HD quality. Fast, free, and no login required.
                    </p>
                    <UrlInput />
                </div>
            </section>

            {/* Features */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>Download All Facebook Video Content</h2>
                <div className="grid-cols-3">
                    <div className="card">
                        <Film size={32} style={{ marginBottom: '1rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">Facebook Reels</h3>
                        <p className="text-body">Download Facebook Reels in high quality instantly.</p>
                    </div>
                    <div className="card">
                        <Users size={32} style={{ marginBottom: '1rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">Public Videos</h3>
                        <p className="text-body">Save any public Facebook video from pages and profiles.</p>
                    </div>
                    <div className="card">
                        <Zap size={32} style={{ marginBottom: 'rem', color: 'var(--color-accent)' }} />
                        <h3 className="text-h3">HD Quality</h3>
                        <p className="text-body">Get the best available quality up to Full HD 1080p.</p>
                    </div>
                </div>
            </section>

            {/* How to Download */}
            <section style={{ background: 'var(--color-surface)', padding: '4rem 0' }}>
                <div className="container">
                    <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '3rem' }}>How to Download Facebook Videos</h2>
                    <div className="grid-cols-3" style={{ textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>1</div>
                            <h3 className="text-h3">Copy Video Link</h3>
                            <p className="text-body">Click the three dots on any Facebook video and select "Copy link".</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>2</div>
                            <h3 className="text-h3">Paste URL</h3>
                            <p className="text-body">Paste the Facebook video URL in our downloader.</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-accent)', marginBottom: '1rem' }}>3</div>
                            <h3 className="text-h3">Download Video</h3>
                            <p className="text-body">Select quality and download the video to your device.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="container" style={{ padding: '4rem 0' }}>
                <h2 className="text-h2" style={{ marginBottom: '2rem' }}>Save Facebook Videos Online - Free HD Downloader</h2>
                <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                    Looking to download videos from Facebook? VidsDoldr makes it easy to save any public Facebook video, Reel, or Watch content. Our Facebook video downloader is completely free and requires no login or registration.
                </p>
                <p className="text-body" style={{ marginBottom: '1.5rem' }}>
                    Our tool works with all types of Facebook video content including regular posts, Reels, Facebook Watch videos, and live streams (after they've ended). Simply copy the video link and paste it in our downloader.
                </p>
                <h3 className="text-h3" style={{ marginTop: '2rem', marginBottom: '1rem' }}>Supported Facebook Content:</h3>
                <ul style={{ listStyle: 'disc', paddingLeft: '2rem' }}>
                    <li className="text-body">Facebook video posts</li>
                    <li className="text-body">Facebook Reels</li>
                    <li className="text-body">Facebook Watch videos</li>
                    <li className="text-body">Live videos (replay)</li>
                    <li className="text-body">Page and group videos</li>
                </ul>
            </section>

            {/* CTA */}
            <section style={{ padding: '4rem 0', textAlign: 'center', background: 'var(--color-surface)' }}>
                <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>Download Facebook Videos Now</h2>
                <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Go to Downloader</Link>
            </section>
        </div>
    );
}
