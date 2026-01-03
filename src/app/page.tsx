import UrlInput from '@/components/home/UrlInput';
import { CheckCircle, Shield, Zap, Film, Download, Globe, HelpCircle, ChevronDown, Smartphone, Monitor, Play } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex-col">
      {/* Hero Section - Full viewport height, content positioned higher */}
      <section style={{
        minHeight: 'calc(100vh - 70px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '4vh',
        textAlign: 'center',
        background: 'radial-gradient(circle at center, rgba(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.15) 0%, transparent 70%)'
      }}>
        <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 className="text-h1" style={{ marginBottom: '1.5rem', maxWidth: '900px' }}>
            Download Videos from Instagram, TikTok, YouTube
            <br />
            <span style={{ opacity: 0.8, fontSize: '0.6em', background: 'none', WebkitTextFillColor: 'initial', color: 'white' }}>Free &amp; Unlimited</span>
          </h1>

          <p className="text-body" style={{ fontSize: '1.1rem', maxWidth: '600px', marginBottom: '2rem', opacity: 0.8 }}>
            Download videos in HD, 4K quality. No watermark, no registration required.
          </p>

          <UrlInput />

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', opacity: 0.6 }}>
            <Link href="/youtube-downloader" style={{ textDecoration: 'none', color: 'inherit' }}>YouTube</Link>
            <Link href="/tiktok-downloader" style={{ textDecoration: 'none', color: 'inherit' }}>TikTok</Link>
            <Link href="/instagram-downloader" style={{ textDecoration: 'none', color: 'inherit' }}>Instagram</Link>
            <Link href="/facebook-downloader" style={{ textDecoration: 'none', color: 'inherit' }}>Facebook</Link>
            <span>+50 more</span>
          </div>
        </div>
      </section>

      {/* How to Download Section */}
      <section id="how-it-works" style={{ background: 'var(--color-surface)', padding: '6rem 0' }}>
        <div className="container">
          <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>How to Download Videos in 3 Easy Steps</h2>
          <div className="grid-cols-3" style={{ textAlign: 'center' }}>
            <div className="flex-col" style={{ alignItems: 'center' }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: 'rgba(255,255,255,0.05)', marginBottom: '-2rem', zIndex: 0 }}>1</div>
              <p className="text-h3" style={{ zIndex: 1 }}>Copy Video URL</p>
              <p className="text-body">Copy the video link from YouTube, Instagram, TikTok, or any supported platform.</p>
            </div>
            <div className="flex-col" style={{ alignItems: 'center' }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: 'rgba(255,255,255,0.05)', marginBottom: '-2rem', zIndex: 0 }}>2</div>
              <p className="text-h3" style={{ zIndex: 1 }}>Paste &amp; Analyze</p>
              <p className="text-body">Paste the link into our downloader and we'll instantly fetch all available formats.</p>
            </div>
            <div className="flex-col" style={{ alignItems: 'center' }}>
              <div style={{ fontSize: '4rem', fontWeight: 900, color: 'rgba(255,255,255,0.05)', marginBottom: '-2rem', zIndex: 0 }}>3</div>
              <p className="text-h3" style={{ zIndex: 1 }}>Download in HD</p>
              <p className="text-body">Choose your preferred quality (360p to 8K) and download instantly. No watermark!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms Section */}
      <section style={{ padding: '6rem 0' }}>
        <div className="container">
          <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '2rem' }}>Supported Video Platforms</h2>
          <p className="text-body" style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem' }}>
            Download videos from all major social media and video streaming platforms.
          </p>
          <div className="grid-cols-3" style={{ gap: '1.5rem' }}>
            {[
              { name: 'YouTube', desc: 'Videos, Shorts, Playlists', link: '/youtube-downloader' },
              { name: 'TikTok', desc: 'Videos without watermark', link: '/tiktok-downloader' },
              { name: 'Instagram', desc: 'Reels, Stories, Posts', link: '/instagram-downloader' },
              { name: 'Facebook', desc: 'Videos, Reels, Stories', link: '/facebook-downloader' },
              { name: 'Twitter / X', desc: 'Videos, GIFs', link: '#' },
              { name: 'Vimeo', desc: 'HD Videos', link: '#' },
            ].map((platform, idx) => (
              <Link key={idx} href={platform.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}>
                  <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>{platform.name}</h3>
                  <p className="text-body" style={{ opacity: 0.7 }}>{platform.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container" style={{ padding: '6rem 0' }}>
        <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>Why Choose Our Video Downloader?</h2>
        <div className="grid-cols-3">
          <div className="card">
            <div style={{ background: 'rgba(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
              <Zap size={24} />
            </div>
            <h3 className="text-h3">Lightning Fast Downloads</h3>
            <p className="text-body">Our high-speed servers ensure you get your video downloads instantly. No queues, no waiting time.</p>
          </div>
          <div className="card">
            <div style={{ background: 'rgba(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
              <Shield size={24} />
            </div>
            <h3 className="text-h3">100% Secure &amp; Private</h3>
            <p className="text-body">We respect your privacy. No data logging, no tracking, and all connections are encrypted.</p>
          </div>
          <div className="card">
            <div style={{ background: 'rgba(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
              <Film size={24} />
            </div>
            <h3 className="text-h3">4K &amp; 8K HD Quality</h3>
            <p className="text-body">Download in the highest quality available. From 144p to 8K Ultra HD resolution.</p>
          </div>
          <div className="card">
            <div style={{ background: 'rgba(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
              <Download size={24} />
            </div>
            <h3 className="text-h3">No Watermark</h3>
            <p className="text-body">Download TikTok videos and more without any watermarks. Clean, original quality.</p>
          </div>
          <div className="card">
            <div style={{ background: 'rgba(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
              <Globe size={24} />
            </div>
            <h3 className="text-h3">50+ Platforms Supported</h3>
            <p className="text-body">YouTube, TikTok, Instagram, Facebook, Twitter, Vimeo, Dailymotion, and many more.</p>
          </div>
          <div className="card">
            <div style={{ background: 'rgba(var(--primary-hue), var(--primary-sat), var(--primary-light), 0.1)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
              <Smartphone size={24} />
            </div>
            <h3 className="text-h3">Works on All Devices</h3>
            <p className="text-body">Download videos on desktop, mobile, or tablet. No app installation required.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ background: 'var(--color-surface)', padding: '6rem 0' }}>
        <div className="container">
          <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '4rem' }}>Frequently Asked Questions</h2>
          <div style={{ maxWidth: '800px', margin: '0 auto' }} className="flex-col" >
            {[
              { q: 'Is this video downloader free?', a: 'Yes, VidsDoldr is completely free to use with unlimited downloads. No hidden fees, no premium subscriptions required.' },
              { q: 'Do I need to create an account?', a: 'No registration required. Simply paste your video URL and download instantly without any sign-up process.' },
              { q: 'What video quality can I download?', a: 'We support all available qualities from 144p to 8K Ultra HD, depending on what the source video offers.' },
              { q: 'Which platforms do you support?', a: 'We support 50+ platforms including YouTube, TikTok, Instagram, Facebook, Twitter, Vimeo, Dailymotion, Reddit, and more.' },
              { q: 'Can I download TikTok videos without watermark?', a: 'Yes! Our TikTok downloader automatically removes watermarks so you get clean, original-quality videos.' },
              { q: 'Is it legal to download videos?', a: 'Downloading videos for personal use is generally allowed. However, redistributing copyrighted content without permission is illegal.' },
              { q: 'How do I download Instagram Reels?', a: 'Simply copy the Instagram Reel URL, paste it in our downloader, and click download. It works for posts, stories, and reels.' },
              { q: 'Can I download private videos?', a: 'No, we can only download publicly available videos. Private or restricted content cannot be accessed.' },
              { q: 'Does it work on mobile phones?', a: 'Yes! Our downloader is fully responsive and works on all devices including iPhones, Android phones, and tablets.' },
              { q: 'How fast are the downloads?', a: 'Downloads are processed on our high-speed servers and typically complete within seconds, depending on video size.' },
              { q: 'Can I download YouTube videos?', a: 'Yes, you can download YouTube videos in various qualities from 144p to 8K, including YouTube Shorts.' },
              { q: 'Is my data safe and private?', a: 'Absolutely. We don\'t store your videos or personal data. All processing is done in real-time and immediately discarded.' },
              { q: 'What video formats are supported?', a: 'We primarily support MP4 and WebM formats, which are compatible with all devices and media players.' },
              { q: 'Can I download audio only (MP3)?', a: 'Yes, we offer audio-only download options for platforms like YouTube, perfect for music and podcasts.' },
              { q: 'Do you store downloaded videos?', a: 'No, we don\'t store any videos. Downloads are streamed directly from the source to your device.' },
            ].map((faq, idx) => (
              <details key={idx} className="card" style={{ padding: '1.5rem', cursor: 'pointer' }}>
                <summary style={{ fontWeight: 600, fontSize: '1.1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {faq.q}
                  <ChevronDown size={20} style={{ opacity: 0.5, flexShrink: 0 }} />
                </summary>
                <p className="text-body" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>{faq.a}</p>
              </details>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link href="/faq" className="btn btn-secondary">View All FAQs</Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '6rem 0', textAlign: 'center' }}>
        <div className="container">
          <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>Ready to Download Videos?</h2>
          <p className="text-body" style={{ marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
            Start downloading your favorite videos in HD quality. Free, fast, and unlimited.
          </p>
          <Link href="/" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
            Download Now - It&apos;s Free
          </Link>
        </div>
      </section>
    </div>
  );
}
