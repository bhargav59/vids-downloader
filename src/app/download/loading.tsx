export default function Loading() {
    return (
        <div className="container flex-center flex-col" style={{ minHeight: '60vh' }}>
            <div className="loader" style={{
                width: '48px',
                height: '48px',
                border: '4px solid rgba(255,255,255,0.1)',
                borderTopColor: 'var(--color-primary)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
            }}></div>
            <h2 className="text-h3" style={{ marginTop: '2rem' }}>Analyzing Video...</h2>
            <p className="text-body">Please wait while we fetch the best quality links for you.</p>

            <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
