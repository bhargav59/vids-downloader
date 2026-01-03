import Link from 'next/link';

export default function Header() {
    return (
        <header style={{
            borderBottom: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <div className="container" style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--color-primary)' }}>Vids</span>Doldr
                </Link>

                <nav style={{ display: 'flex', gap: '2rem' }}>
                    <Link href="/#how-it-works" className="text-body" style={{ color: 'white', fontWeight: 500 }}>How it works</Link>
                    <Link href="/#faq" className="text-body" style={{ color: 'white', fontWeight: 500 }}>FAQ</Link>
                </nav>
            </div>
        </header>
    );
}
