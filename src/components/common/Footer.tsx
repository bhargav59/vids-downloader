export default function Footer() {
    return (
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: 'var(--spacing-xl) 0', marginTop: 'var(--spacing-xl)' }}>
            <div className="container">
                <div className="grid-cols-3">
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1rem' }}>
                            <span style={{ color: 'var(--color-primary)' }}>Vids</span>Doldr
                        </div>
                        <p className="text-body">
                            The universal video downloader built for speed, privacy, and ease of use.
                        </p>
                    </div>

                    <div>
                        <div className="text-h3">Legal</div>
                        <ul style={{ listStyle: 'none' }}>
                            <li style={{ marginBottom: '0.5rem' }}><a href="#" className="text-body">Terms of Service</a></li>
                            <li style={{ marginBottom: '0.5rem' }}><a href="#" className="text-body">Privacy Policy</a></li>
                            <li style={{ marginBottom: '0.5rem' }}><a href="#" className="text-body">DMCA</a></li>
                        </ul>
                    </div>

                    <div>
                        <div className="text-h3">Connect</div>
                        <ul style={{ listStyle: 'none' }}>
                            <li style={{ marginBottom: '0.5rem' }}><a href="#" className="text-body">Contact Us</a></li>
                            <li style={{ marginBottom: '0.5rem' }}><a href="#" className="text-body">Twitter</a></li>
                        </ul>
                    </div>
                </div>
                <div style={{ marginTop: '3rem', textAlign: 'center', opacity: 0.5 }} className="text-body">
                    © {new Date().getFullYear()} VidsDoldr. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
