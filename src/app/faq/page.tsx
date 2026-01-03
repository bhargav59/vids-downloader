import { ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions - Video Downloader Help | VidsDoldr',
    description: 'Find answers to common questions about downloading videos from YouTube, TikTok, Instagram, Facebook and more. Get help with video quality, formats, and troubleshooting.',
    keywords: 'video downloader faq, how to download videos, video downloader help, youtube downloader questions, tiktok downloader help',
};

const faqCategories = [
    {
        title: 'General Questions',
        questions: [
            { q: 'Is VidsDoldr completely free?', a: 'Yes, VidsDoldr is 100% free with unlimited downloads. There are no hidden fees, premium tiers, or subscription requirements.' },
            { q: 'Do I need to create an account?', a: 'No registration is required. Simply paste your video URL and download instantly without signing up.' },
            { q: 'Is it safe to use this video downloader?', a: 'Absolutely. We don\'t store your videos or personal data. All connections are encrypted and we don\'t inject any malware or ads into downloads.' },
            { q: 'Does it work on mobile devices?', a: 'Yes! VidsDoldr works on all devices including iPhones, Android phones, iPads, and tablets. No app installation needed.' },
        ]
    },
    {
        title: 'Supported Platforms',
        questions: [
            { q: 'Which platforms do you support?', a: 'We support 50+ platforms including YouTube, TikTok, Instagram, Facebook, Twitter/X, Vimeo, Dailymotion, Reddit, Pinterest, LinkedIn, and many more.' },
            { q: 'Can I download YouTube videos?', a: 'Yes, you can download YouTube videos in various qualities from 144p to 8K, including YouTube Shorts and audio extraction.' },
            { q: 'Does the TikTok downloader remove watermarks?', a: 'Yes! Our TikTok downloader automatically removes the TikTok watermark so you get clean, original-quality videos.' },
            { q: 'Can I download Instagram Reels?', a: 'Yes, you can download Instagram Reels, Stories, IGTV videos, and regular post videos from public profiles.' },
        ]
    },
    {
        title: 'Video Quality & Formats',
        questions: [
            { q: 'What video quality can I download?', a: 'We support all available qualities from 144p to 8K Ultra HD, depending on what the source video offers.' },
            { q: 'What video formats are available?', a: 'Primarily MP4 and WebM formats, which are compatible with all devices and media players.' },
            { q: 'Can I download audio only (MP3)?', a: 'Yes, we offer audio-only download options for platforms like YouTube, perfect for music and podcasts.' },
            { q: 'Why is the quality limited on some videos?', a: 'Video quality depends on what the uploader provided. We always offer the highest quality available from the source.' },
        ]
    },
    {
        title: 'Privacy & Legal',
        questions: [
            { q: 'Is it legal to download videos?', a: 'Downloading videos for personal use is generally allowed in most jurisdictions. However, redistributing copyrighted content without permission is illegal. Always respect copyright laws.' },
            { q: 'Do you store my downloaded videos?', a: 'No, we never store your videos. Downloads are streamed directly from the source to your device in real-time.' },
            { q: 'Can I download private videos?', a: 'No, we can only download publicly available videos. Private, restricted, or age-gated content cannot be accessed.' },
            { q: 'Is my data safe?', a: 'We don\'t collect or store any personal data. We don\'t use cookies for tracking and all connections are encrypted.' },
        ]
    },
    {
        title: 'Troubleshooting',
        questions: [
            { q: 'Why is my download not starting?', a: 'Make sure you\'ve copied the correct video URL. Some private or restricted videos cannot be downloaded. Try refreshing and pasting the link again.' },
            { q: 'The video URL is not recognized', a: 'Ensure you\'re copying the full URL from the address bar or share button. Some shortened URLs may not work correctly.' },
            { q: 'Download is slow', a: 'Download speed depends on your internet connection and the video size. Large 4K videos may take longer to process and download.' },
            { q: 'Video has no sound', a: 'Some platforms provide separate audio and video streams. Make sure to select a format that includes audio, or wait for the merge to complete.' },
        ]
    },
];

export default function FAQPage() {
    return (
        <div className="flex-col">
            {/* Hero */}
            <section style={{ padding: '4rem 0', textAlign: 'center', background: 'var(--color-surface)' }}>
                <div className="container">
                    <h1 className="text-h1" style={{ marginBottom: '1rem' }}>Frequently Asked Questions</h1>
                    <p className="text-body" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Find answers to common questions about downloading videos with VidsDoldr.
                    </p>
                </div>
            </section>

            {/* FAQ Categories */}
            <section className="container" style={{ padding: '4rem 0' }}>
                {faqCategories.map((category, catIdx) => (
                    <div key={catIdx} style={{ marginBottom: '3rem' }}>
                        <h2 className="text-h2" style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>{category.title}</h2>
                        <div className="flex-col" style={{ gap: '1rem' }}>
                            {category.questions.map((faq, idx) => (
                                <details key={idx} className="card" style={{ padding: '1.5rem', cursor: 'pointer' }}>
                                    <summary style={{ fontWeight: 600, fontSize: '1.05rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {faq.q}
                                        <ChevronDown size={20} style={{ opacity: 0.5, flexShrink: 0 }} />
                                    </summary>
                                    <p className="text-body" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>{faq.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                ))}
            </section>

            {/* CTA */}
            <section style={{ padding: '4rem 0', textAlign: 'center', background: 'var(--color-surface)' }}>
                <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>Still Have Questions?</h2>
                <p className="text-body" style={{ marginBottom: '2rem' }}>Can't find what you're looking for? Try our video downloader!</p>
                <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Go to Downloader</Link>
            </section>
        </div>
    );
}
