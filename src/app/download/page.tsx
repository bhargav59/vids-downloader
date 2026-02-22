import { extractVideoInfo } from '@/lib/extractors';
import DownloadOptions from '@/components/download/DownloadOptions';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function DownloadPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const url = typeof searchParams.url === 'string' ? searchParams.url : null;

    if (!url) {
        return (
            <div className="container flex-center flex-col" style={{ minHeight: '60vh', textAlign: 'center' }}>
                <AlertCircle size={64} color="var(--color-error)" style={{ marginBottom: '1rem' }} />
                <h1 className="text-h2">No URL Provided</h1>
                <p className="text-body" style={{ marginBottom: '2rem' }}>Please enter a valid video URL to start downloading.</p>
                <Link href="/" className="btn btn-secondary">
                    <ArrowLeft size={20} style={{ marginRight: '8px' }} /> Go Back
                </Link>
            </div>
        );
    }

    try {
        const videoData = await extractVideoInfo(url);

        return <DownloadOptions data={videoData} />;

    } catch (error: any) {
        return (
            <div className="container flex-center flex-col" style={{ minHeight: '60vh', textAlign: 'center' }}>
                <AlertCircle size={64} color="var(--color-error)" style={{ marginBottom: '1rem' }} />
                <h1 className="text-h2">Extraction Failed</h1>
                <p className="text-body" style={{ marginBottom: '1rem', maxWidth: '600px' }}>
                    {error.message || 'We could not extract the video information. Please check the URL and try again.'}
                </p>
                <p className="text-body" style={{ fontSize: '0.9rem', marginBottom: '2rem', opacity: 0.5 }}>
                    Currently supporting: YouTube
                </p>
                <Link href="/" className="btn btn-secondary">
                    <ArrowLeft size={20} style={{ marginRight: '8px' }} /> Try Another
                </Link>
            </div>
        );
    }
}
