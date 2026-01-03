# VidsDoldr - Universal Video Downloader

A video downloader supporting YouTube, Instagram, and TikTok. Available as both a **local Next.js app** (full features) and a **Cloudflare Workers deployment** (limited features).

![Video Downloader](https://img.shields.io/badge/Video-Downloader-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)

## 🚀 Live Demo

**Cloudflare Workers:** https://vids-downloader.bhargavsah2026.workers.dev

> ⚠️ YouTube downloads work best with the local version due to signature restrictions.

---

## 📦 Features

| Platform | Local (Next.js) | Cloudflare Workers |
|----------|-----------------|-------------------|
| YouTube | ✅ Full support (yt-dlp) | ⚠️ Redirects to external services |
| Instagram | ✅ Works | ✅ Works |
| TikTok | ✅ Works | ✅ Works |
| Multi-language titles | ✅ Hindi, etc. | ✅ Hindi, etc. |

---

## 🏠 Local Development (Recommended)

### Prerequisites
- Node.js 18+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed (`brew install yt-dlp`)
- [instaloader](https://instaloader.github.io/) (optional, for Instagram)

### Installation

```bash
git clone https://github.com/bhargav59/vids-downloader.git
cd vids-downloader
npm install
```

### Run Locally

```bash
npm run dev
```

Open http://localhost:3000

---

## ☁️ Cloudflare Workers Deployment

### Prerequisites
- Cloudflare account
- Wrangler CLI (`npm install -g wrangler`)

### Deploy

```bash
# Login to Cloudflare
wrangler login

# Deploy
npm run deploy
```

### Cloudflare Services Used (Free Tier)

| Service | Usage | Free Limit |
|---------|-------|------------|
| KV | Video metadata caching | 1GB |
| D1 | Download analytics | 5GB |
| Cache API | Edge caching | Unlimited |

---

## 📁 Project Structure

```
VidsDoldr/
├── src/
│   ├── app/                    # Next.js pages
│   │   ├── api/
│   │   │   ├── proxy/          # Video download proxy
│   │   │   └── resolve/        # Video info extraction
│   │   └── download/           # Download page
│   ├── components/             # React components
│   ├── lib/
│   │   └── extractors/         # Platform extractors (Next.js)
│   └── worker/                 # Cloudflare Worker files
│       ├── index.ts            # Worker entry point
│       ├── extractors.ts       # Platform extractors (Workers)
│       └── html.ts             # Embedded frontend
├── wrangler.toml               # Cloudflare config
├── schema.sql                  # D1 database schema
└── package.json
```

---

## 🛠️ Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js locally |
| `npm run dev:worker` | Test Worker locally (port 8787) |
| `npm run deploy` | Deploy to Cloudflare Workers |
| `npm run build` | Build Next.js for production |

---

## 📝 API Endpoints

### `GET /api/resolve?url=<video_url>`
Extract video information and available formats.

### `GET /api/proxy?url=<video_url>&filename=<name>`
Download video file.

### `GET /api/stats` (Workers only)
Get download statistics.

---

## ⚠️ Known Limitations

1. **YouTube on Workers**: Due to signature deciphering requirements, YouTube downloads redirect to external services (y2mate, ssyoutube).
2. **Instagram**: May require login for private posts.
3. **TikTok**: May be blocked in some regions.

---

## 📄 License

MIT

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push and create a Pull Request
