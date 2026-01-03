import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Free Video Downloader - Download Instagram, TikTok, YouTube Videos | VidsDoldr',
  description: 'Download videos from Instagram, TikTok, YouTube, Facebook & 50+ sites. Free, unlimited, HD quality, no watermark. No registration required.',
  keywords: 'video downloader, instagram video downloader, tiktok downloader, youtube downloader, download videos free, no watermark, hd video downloader, 4k video downloader',
  authors: [{ name: 'VidsDoldr' }],
  openGraph: {
    title: 'Free Video Downloader - Instagram, TikTok, YouTube',
    description: 'Download videos in HD from 50+ platforms. Free & unlimited.',
    type: 'website',
    url: 'https://vidsdoldr.com',
    siteName: 'VidsDoldr',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'VidsDoldr - Free Video Downloader',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Video Downloader - Instagram, TikTok, YouTube',
    description: 'Download videos in HD from 50+ platforms',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://vidsdoldr.com',
  },
};

// JSON-LD Schema
const schemaData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "VidsDoldr - Video Downloader",
  "applicationCategory": "MultimediaApplication",
  "operatingSystem": "Web, Windows, Mac, Android, iOS",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "10000"
  },
  "description": "Free online video downloader for Instagram, TikTok, YouTube, Facebook and 50+ platforms"
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is it free to download videos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our video downloader is completely free with unlimited downloads."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to register or sign up?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No registration required. Simply paste the video URL and download instantly."
      }
    },
    {
      "@type": "Question",
      "name": "What platforms are supported?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We support Instagram, TikTok, YouTube, Facebook, Twitter, Vimeo, and 50+ other platforms."
      }
    },
    {
      "@type": "Question",
      "name": "Can I download TikTok videos without watermark?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, our TikTok downloader removes watermarks automatically for clean downloads."
      }
    },
    {
      "@type": "Question",
      "name": "What video quality can I download?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We support HD, Full HD (1080p), 4K, and even 8K quality depending on the source video."
      }
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="schema-software"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <Script
          id="schema-faq"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: 1 }}>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
