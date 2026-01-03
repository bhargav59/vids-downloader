'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Link } from 'lucide-react';

export default function UrlInput() {
    const [url, setUrl] = useState('');
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (url.trim()) {
            router.push(`/download?url=${encodeURIComponent(url.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}>
                    <Link size={20} />
                </div>
                <input
                    type="text"
                    placeholder="Paste video URL here..."
                    className="input-field"
                    style={{ paddingLeft: '3.5rem', paddingRight: '140px', height: '60px', fontSize: '1.2rem' }}
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                />
                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ position: 'absolute', right: '8px', top: '8px', bottom: '8px', height: 'auto', padding: '0 1.5rem' }}
                >
                    Download <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                </button>
            </div>
        </form>
    );
}
