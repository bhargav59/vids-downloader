/**
 * Embedded HTML for the Cloudflare Worker
 * Single-page application served directly from the Worker
 */
export const getHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VidsDoldr - Free Video Downloader</title>
    <meta name="description" content="Download videos from YouTube, Instagram, TikTok and more. Free, fast, and no registration required.">
    <style>
        :root {
            --color-bg: #0a0a0f;
            --color-surface: #12121a;
            --color-text: #ffffff;
            --color-text-muted: rgba(255,255,255,0.6);
            --color-primary: #6366f1;
            --color-primary-hover: #818cf8;
            --color-accent: #00f0ff;
            --color-success: #00e0b0;
            --color-error: #ff6b6b;
            --radius: 12px;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--color-bg);
            color: var(--color-text);
            min-height: 100vh;
        }
        .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
        
        /* Header */
        header {
            text-align: center;
            padding: 2rem 0;
        }
        .logo {
            font-size: 2rem;
            font-weight: 700;
        }
        .logo span:first-child { color: var(--color-primary); }
        .logo span:last-child { color: var(--color-text); }
        
        /* Hero */
        .hero {
            text-align: center;
            padding: 3rem 0;
        }
        .hero h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .hero p {
            color: var(--color-text-muted);
            font-size: 1.1rem;
            margin-bottom: 2rem;
        }
        
        /* Search Box */
        .search-box {
            display: flex;
            gap: 0.5rem;
            background: var(--color-surface);
            padding: 0.5rem;
            border-radius: var(--radius);
            border: 1px solid rgba(255,255,255,0.1);
        }
        .search-box input {
            flex: 1;
            background: transparent;
            border: none;
            color: var(--color-text);
            font-size: 1rem;
            padding: 0.75rem 1rem;
            outline: none;
        }
        .search-box input::placeholder { color: var(--color-text-muted); }
        .btn {
            background: var(--color-primary);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn:hover { background: var(--color-primary-hover); }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        /* Results */
        .results {
            margin-top: 2rem;
            display: none;
        }
        .results.show { display: block; }
        
        .video-card {
            background: var(--color-surface);
            border-radius: var(--radius);
            padding: 1.5rem;
            display: grid;
            grid-template-columns: 200px 1fr;
            gap: 1.5rem;
        }
        .video-card img {
            width: 100%;
            border-radius: 8px;
            aspect-ratio: 16/9;
            object-fit: cover;
        }
        .video-info h2 {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
            line-height: 1.4;
        }
        .video-meta {
            color: var(--color-text-muted);
            font-size: 0.9rem;
            margin-bottom: 1rem;
        }
        
        /* Format List */
        .formats {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-top: 1.5rem;
        }
        .format-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255,255,255,0.05);
            padding: 0.75rem 1rem;
            border-radius: 8px;
        }
        .format-quality {
            font-weight: 600;
        }
        .format-details {
            color: var(--color-text-muted);
            font-size: 0.85rem;
        }
        .btn-download {
            background: var(--color-success);
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }
        .btn-download:hover { background: #00c99a; }
        
        /* Error */
        .error {
            background: rgba(255,107,107,0.1);
            border: 1px solid var(--color-error);
            color: var(--color-error);
            padding: 1rem;
            border-radius: var(--radius);
            margin-top: 1rem;
            display: none;
        }
        .error.show { display: block; }
        
        /* Loading */
        .loading {
            text-align: center;
            padding: 2rem;
            display: none;
        }
        .loading.show { display: block; }
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        /* Responsive */
        @media (max-width: 600px) {
            .video-card { grid-template-columns: 1fr; }
            .hero h1 { font-size: 1.8rem; }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo"><span>Vids</span><span>Doldr</span></div>
        </header>
        
        <section class="hero">
            <h1>Download Videos from Any Platform</h1>
            <p>YouTube, Instagram, TikTok and more. Free & unlimited.</p>
            
            <div class="search-box">
                <input type="text" id="urlInput" placeholder="Paste video URL here..." />
                <button class="btn" id="downloadBtn" onclick="extractVideo()">Download</button>
            </div>
        </section>
        
        <div class="error" id="error"></div>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Extracting video information...</p>
        </div>
        
        <section class="results" id="results">
            <div class="video-card">
                <img id="thumbnail" src="" alt="Video thumbnail" />
                <div class="video-info">
                    <h2 id="title"></h2>
                    <div class="video-meta">
                        <span id="author"></span> • <span id="duration"></span> • <span id="platform"></span>
                    </div>
                </div>
            </div>
            <div class="formats" id="formats"></div>
        </section>
    </div>
    
    <script>
        const urlInput = document.getElementById('urlInput');
        const downloadBtn = document.getElementById('downloadBtn');
        const results = document.getElementById('results');
        const loading = document.getElementById('loading');
        const error = document.getElementById('error');
        
        urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') extractVideo();
        });
        
        async function extractVideo() {
            const url = urlInput.value.trim();
            if (!url) {
                showError('Please enter a video URL');
                return;
            }
            
            hideError();
            results.classList.remove('show');
            loading.classList.add('show');
            downloadBtn.disabled = true;
            
            try {
                const response = await fetch('/api/resolve?url=' + encodeURIComponent(url));
                const data = await response.json();
                
                if (!data.success) {
                    throw new Error(data.error || 'Failed to extract video');
                }
                
                displayResults(data.data);
            } catch (err) {
                showError(err.message);
            } finally {
                loading.classList.remove('show');
                downloadBtn.disabled = false;
            }
        }
        
        function displayResults(video) {
            document.getElementById('thumbnail').src = video.thumbnail || '';
            document.getElementById('title').textContent = video.title;
            document.getElementById('author').textContent = video.author;
            document.getElementById('duration').textContent = video.duration;
            document.getElementById('platform').textContent = video.platform;
            
            const formatsEl = document.getElementById('formats');
            formatsEl.innerHTML = video.formats.map(f => \`
                <div class="format-item">
                    <div>
                        <span class="format-quality">\${f.quality}</span>
                        <span class="format-details">\${f.format.toUpperCase()} • \${f.hasVideo ? 'Video' : ''}\${f.hasVideo && f.hasAudio ? ' + ' : ''}\${f.hasAudio ? 'Audio' : ''} • \${f.size}</span>
                    </div>
                    <button class="btn btn-download" onclick="downloadFormat('\${encodeURIComponent(f.url)}', '\${f.quality}')">Download</button>
                </div>
            \`).join('');
            
            results.classList.add('show');
        }
        
        function downloadFormat(formatUrl, quality) {
            const decodedUrl = decodeURIComponent(formatUrl);
            // External download services or direct video URLs open in new tab
            if (decodedUrl.includes('y2mate.com') || 
                decodedUrl.includes('ssyoutube.com') || 
                decodedUrl.includes('10downloader.com') ||
                decodedUrl.includes('googlevideo.com') || 
                decodedUrl.includes('youtube.com')) {
                window.open(decodedUrl, '_blank');
            } else {
                // Use proxy for direct video URLs (Instagram, TikTok)
                const filename = document.getElementById('title').textContent.replace(/[^a-z0-9\\u0900-\\u097F]/gi, '_') + '_' + quality + '.mp4';
                window.location.href = '/api/proxy?url=' + encodeURIComponent(decodedUrl) + '&filename=' + encodeURIComponent(filename);
            }
        }
        
        function showError(msg) {
            error.textContent = msg;
            error.classList.add('show');
        }
        
        function hideError() {
            error.classList.remove('show');
        }
    </script>
</body>
</html>`;
