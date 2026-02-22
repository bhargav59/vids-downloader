/**
 * VidsDownloader - HTML served from Cloudflare Worker
 *
 * IMPORTANT: The JavaScript in this file MUST NOT use template literals (backticks)
 * inside the outer TypeScript template literal, because nested `\${}` escaping
 * causes the browser to receive literal `${...}` text instead of interpolated values.
 *
 * All browser-side JavaScript is written as plain ES5-compatible strings.
 * Dynamic content is handled via DOM APIs and data-* attributes, NOT inline onclick.
 */

export const getHtml = (_path = '/') => {

  // ---------------------------------------------------------------------------
  // CSS (static string — no escaping issues)
  // ---------------------------------------------------------------------------
  const CSS = `
  :root { color-scheme: dark; }
  body { font-family: 'Inter', system-ui, sans-serif; }
  .mesh-bg {
    background:
      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,.25) 0%, transparent 60%),
      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(168,85,247,.15) 0%, transparent 50%),
      #09090b;
  }
  .glass-card {
    background: rgba(24,24,30,.8);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,.06);
  }
  .url-input:focus { outline: none; box-shadow: 0 0 0 3px rgba(99,102,241,.35); border-radius: 12px; }
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  .shimmer {
    background: linear-gradient(90deg,rgba(255,255,255,.05) 25%,rgba(255,255,255,.10) 50%,rgba(255,255,255,.05) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 1s linear infinite; }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  .fade-in { animation: fadeIn .4s ease-out; }
  .slide-up { animation: slideUp .4s ease-out; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
  .pulse { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
  ::-webkit-scrollbar { width:6px }
  ::-webkit-scrollbar-thumb { background:rgba(255,255,255,.15); border-radius:3px }
  .dl-btn:disabled { opacity:.6; cursor:not-allowed; }
  .dl-btn { transition: background .15s, box-shadow .15s; }
  .dl-btn:not(:disabled):hover { background: #5254e0 !important; box-shadow: 0 0 20px rgba(99,102,241,.4); }
`;

  // ---------------------------------------------------------------------------
  // JavaScript (plain string — ZERO template literals, ZERO escaping issues)
  // ---------------------------------------------------------------------------
  // NOTE: All string interpolation happens at RUNTIME in the browser via DOM APIs.
  //       The download handler reads format data from window._currentFormats array
  //       (populated by displayResults). This avoids putting any URL inside an HTML
  //       attribute, which was the bug that caused downloads to not work.
  const JS = `
var PLATFORMS = [
  { id:'youtube',   name:'YouTube',    color:'bg-red-600',   urlPattern:/youtube\\.com|youtu\\.be/i },
  { id:'tiktok',    name:'TikTok',     color:'bg-black border border-white/20', urlPattern:/tiktok\\.com/i },
  { id:'instagram', name:'Instagram',  color:'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400', urlPattern:/instagram\\.com/i },
  { id:'facebook',  name:'Facebook',   color:'bg-blue-600',  urlPattern:/facebook\\.com|fb\\.watch|fb\\.com/i },
  { id:'twitter',   name:'Twitter/X',  color:'bg-black border border-white/20', urlPattern:/twitter\\.com|x\\.com/i }
];

var FAQS = [
  ['Is VidsDownloader free?', 'Yes! Completely free, no sign-up, no limits.'],
  ['Which platforms are supported?', 'YouTube, TikTok, Instagram (Reels), Facebook, Twitter/X.'],
  ['Can I download TikTok without watermark?', 'Yes! We provide HD no-watermark downloads via the TikTok API.'],
  ["Why can't I download private videos?", 'Only public videos can be downloaded. Private videos require authentication.'],
  ['Is it legal?', 'Download only for personal offline viewing. Always respect creator rights.']
];

var activeTab = 'youtube';
var isLoading = false;
window._currentFormats = [];

function init() {
  renderTabs();
  renderFaqs();
  var inp = document.getElementById('urlInput');
  inp.addEventListener('input', function(e) { detectPlatform(e.target.value); });
  inp.addEventListener('paste', function(e) { setTimeout(function(){ detectPlatform(inp.value); }, 50); });
  inp.addEventListener('keydown', function(e) { if (e.key === 'Enter' && !isLoading) startExtract(); });
  document.getElementById('downloadBtn').addEventListener('click', function() { if (!isLoading) startExtract(); });
  document.getElementById('resFormats').addEventListener('click', function(e) {
    var btn = e.target.closest('.dl-btn');
    if (!btn || btn.disabled) return;
    var idx = parseInt(btn.getAttribute('data-idx'), 10);
    var fmt = window._currentFormats[idx];
    if (fmt) handleDownloadClick(btn, fmt);
  });
}

function detectPlatform(url) {
  if (!url) return;
  var plat = PLATFORMS.find(function(p){ return p.urlPattern.test(url); });
  if (plat && plat.id !== activeTab) setTab(plat.id);
}

function setTab(id) {
  activeTab = id;
  renderTabs();
  var plat = PLATFORMS.find(function(p){ return p.id === id; });
  if (plat) document.getElementById('urlInput').placeholder = 'Paste ' + plat.name + ' URL here\u2026';
}

function renderTabs() {
  var el = document.getElementById('platformTabs');
  el.innerHTML = PLATFORMS.map(function(p) {
    var active = p.id === activeTab;
    var cls = active
      ? 'tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap text-white shadow-lg ' + p.color
      : 'tab-btn flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap text-white/40 hover:text-white/70 bg-white/5 hover:bg-white/10';
    return '<button class="' + cls + '" data-tabid="' + p.id + '">' + p.name + '</button>';
  }).join('');
  el.addEventListener('click', function(e){
    var btn = e.target.closest('[data-tabid]');
    if (btn) setTab(btn.getAttribute('data-tabid'));
  });
}

function renderFaqs() {
  document.getElementById('faqContainer').innerHTML = FAQS.map(function(f, i) {
    return '<div class="glass-card rounded-xl overflow-hidden mb-3">'
      + '<button class="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-white/80 hover:text-white faq-btn" data-faqidx="' + i + '">'
      + '<span>' + f[0] + '</span>'
      + '<svg id="fc' + i + '" class="w-5 h-5 text-white/30 shrink-0 ml-4" style="transition:transform .2s" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>'
      + '</button>'
      + '<div id="fa' + i + '" class="hidden px-5 pb-4 text-sm text-white/50 leading-relaxed">' + f[1] + '</div>'
      + '</div>';
  }).join('');
  document.getElementById('faqContainer').addEventListener('click', function(e){
    var btn = e.target.closest('.faq-btn');
    if (!btn) return;
    var i = btn.getAttribute('data-faqidx');
    var content = document.getElementById('fa' + i);
    var chevron = document.getElementById('fc' + i);
    var hidden = content.classList.contains('hidden');
    content.classList.toggle('hidden', !hidden);
    chevron.style.transform = hidden ? 'rotate(180deg)' : '';
  });
}

async function startExtract() {
  var url = document.getElementById('urlInput').value.trim();
  if (!url || isLoading) return;
  hideError();
  hideResults();
  showLoading(true);
  setBtnLoading(true);
  isLoading = true;
  try {
    detectPlatform(url);
    var res = await fetch('/api/resolve?url=' + encodeURIComponent(url));
    var json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to extract video');
    displayResults(json.data);
  } catch(err) {
    showError(err.message || 'An unexpected error occurred. Please try again.');
  } finally {
    showLoading(false);
    setBtnLoading(false);
    isLoading = false;
  }
}

function setBtnLoading(loading) {
  var btn = document.getElementById('downloadBtn');
  var txt = document.getElementById('btnText');
  btn.disabled = loading;
  txt.textContent = loading ? 'Fetching\u2026' : 'Download';
}

function displayResults(video) {
  window._currentFormats = video.formats || [];
  var plat = PLATFORMS.find(function(p){ return video.platform && video.platform.toLowerCase().replace('twitter/x','twitter') === p.id; }) || PLATFORMS[0];

  document.getElementById('resThumbnail').src = video.thumbnail || '';
  document.getElementById('resTitle').textContent = video.title || 'Untitled';
  document.getElementById('resAuthorText').textContent = video.author || '';

  var dur = document.getElementById('resDuration');
  if (video.duration && video.duration !== '0:00') {
    document.getElementById('resDurationText').textContent = video.duration;
    dur.classList.remove('hidden');
  } else { dur.classList.add('hidden'); }

  var badge = document.getElementById('resPlatformBadge');
  badge.textContent = video.platform;
  badge.className = 'absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-md text-white ' + plat.color;

  var formatsEl = document.getElementById('resFormats');
  formatsEl.innerHTML = window._currentFormats.map(function(f, idx) {
    var isAudio = !f.hasVideo;
    var isExt   = !!f.isExternal;
    var qColor  = isAudio ? 'color:#fcd34d;background:rgba(245,158,11,.15)' : 'color:#6ee7b7;background:rgba(16,185,129,.15)';
    var mediaInfo = (f.hasVideo && f.hasAudio) ? 'Video + Audio' : f.hasVideo ? 'Video only' : 'Audio only';
    var sizeStr = (f.size && f.size !== 'Unknown') ? f.size + ' \u00b7 ' : '';
    var extBadge = isExt ? '<span style="font-size:.7rem;color:rgba(255,255,255,.3);border:1px solid rgba(255,255,255,.1);padding:2px 8px;border-radius:99px;margin-left:4px">Opens page</span>' : '';
    return '<div class="glass-card" style="border-radius:12px;padding:16px 20px;display:flex;align-items:center;gap:16px;margin-bottom:10px">'
      + '<div style="flex:1;min-width:0">'
        + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">'
          + '<span style="font-size:.875rem;font-weight:600;color:#fff">' + f.quality + '</span>'
          + '<span style="font-size:.7rem;font-weight:600;padding:2px 8px;border-radius:99px;' + qColor + '">' + f.format.toUpperCase() + '</span>'
          + extBadge
        + '</div>'
        + '<div style="font-size:.75rem;color:rgba(255,255,255,.35)">' + sizeStr + mediaInfo + '</div>'
      + '</div>'
      + '<button class="dl-btn" data-idx="' + idx + '" style="background:#6366f1;color:#fff;font-size:.875rem;font-weight:600;padding:8px 16px;border-radius:8px;border:none;cursor:pointer;display:flex;align-items:center;gap:6px;flex-shrink:0">'
        + '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>'
        + 'Download'
      + '</button>'
    + '</div>';
  }).join('');

  showResults();
}

function handleDownloadClick(btn, fmt) {
  if (fmt.isWidget) {
    // Show native widget iframe in a modal
    var modalId = 'widgetModal_' + Date.now();
    var modalHtml = '<div id="' + modalId + '" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);backdrop-filter:blur(4px);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem">'
      + '<div style="width:100%;max-width:600px;background:#1e1b4b;border-radius:12px;overflow:hidden;position:relative;border:1px solid rgba(255,255,255,0.1)">'
      +   '<div style="display:flex;justify-content:space-between;padding:16px;border-bottom:1px solid rgba(255,255,255,0.1)">'
      +     '<h3 style="margin:0;color:#fff;font-size:1.1rem">Native Download Proxy</h3>'
      +     '<button onclick="document.getElementById(\'' + modalId + '\').remove()" style="background:transparent;border:none;color:#fff;cursor:pointer;font-size:1.5rem;line-height:1">&times;</button>'
      +   '</div>'
      +   '<iframe src="' + fmt.url + '" style="width:100%;height:100px;border:none;background:transparent" title="Download Proxy"></iframe>'
      +   '<div style="padding:12px 16px;font-size:0.8rem;color:rgba(255,255,255,0.6);text-align:center;background:rgba(0,0,0,0.2)">'
      +     'Click the button in the frame above to instantly save the file to your device.'
      +   '</div>'
      + '</div></div>';
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return;
  }

  if (fmt.isExternal) {
    window.open(fmt.url, '_blank', 'noopener noreferrer');
    return;
  }

  var titleEl = document.getElementById('resTitle');
  var rawTitle = titleEl ? (titleEl.textContent || 'video') : 'video';
  var safeTitle = rawTitle.replace(/[^a-zA-Z0-9 \\-_]/g,'').trim().replace(/\\s+/g,'_').substring(0,60) || 'video';
  var safeQuality = fmt.quality.replace(/[^a-zA-Z0-9]/g,'_');
  var filename = safeTitle + '_' + safeQuality + '.' + fmt.format;

  var origHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" opacity=".3"/><path d="M21 12a9 9 0 0 0-9-9"/></svg> Preparing\u2026';

  var proxyUrl = '/api/proxy?url=' + encodeURIComponent(fmt.url) + '&filename=' + encodeURIComponent(filename);

  // Use hidden iframe to trigger download without navigating away from page
  var iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:absolute;width:1px;height:1px;top:-9999px;left:-9999px;border:0';
  iframe.src = proxyUrl;
  document.body.appendChild(iframe);

  setTimeout(function() {
    btn.disabled = false;
    btn.innerHTML = origHTML;
    try { document.body.removeChild(iframe); } catch(e){}
  }, 6000);
}

function showLoading(show) {
  document.getElementById('loadingSkeleton').classList.toggle('hidden', !show);
  if(show) document.getElementById('featureSection').classList.add('hidden');
}
function showResults() {
  document.getElementById('results').classList.remove('hidden');
  document.getElementById('featureSection').classList.add('hidden');
}
function hideResults() { document.getElementById('results').classList.add('hidden'); }
function showError(msg) {
  var el = document.getElementById('errorBanner');
  document.getElementById('errorMsg').textContent = msg;
  el.style.display = 'flex';
  document.getElementById('featureSection').classList.remove('hidden');
}
function hideError() { document.getElementById('errorBanner').style.display = 'none'; }

init();
`;

  // ---------------------------------------------------------------------------
  // HTML template — static string, no nested template literals in JS sections
  // ---------------------------------------------------------------------------
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>VidsDownloader \u2014 Download YouTube, TikTok, Instagram Videos Free</title>
  <meta name="description" content="Download videos from YouTube, TikTok, Instagram, Facebook and Twitter instantly. Free, fast, no signup required."/>
  <meta property="og:title" content="VidsDownloader \u2014 Free Video Downloader"/>
  <meta property="og:description" content="Download videos from YouTube, TikTok, Instagram, Facebook & Twitter for free."/>
  <meta name="twitter:card" content="summary_large_image"/>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode:'class',
      theme:{
        extend:{
          fontFamily:{sans:['Inter','system-ui','sans-serif']},
          colors:{
            brand:{'50':'#f0f4ff','100':'#dde6ff','200':'#c2d1ff','300':'#9db3ff','400':'#7589ff','500':'#6366f1','600':'#5254e0','700':'#4240c4','800':'#37369d','900':'#31327d'},
            surface:{'900':'#09090b','800':'#111115','700':'#18181e','600':'#1e1e28','500':'#27272f'}
          }
        }
      }
    }
  </script>
  <style>${CSS}</style>
</head>
<body class="mesh-bg text-white min-h-screen antialiased">

<!-- NAVBAR -->
<nav class="sticky top-0 z-50 border-b border-white/5 glass-card">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
    <a href="/" class="flex items-center gap-2 group">
      <div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      </div>
      <span class="font-bold text-lg tracking-tight">Vids<span class="text-brand-400">Downloader</span></span>
    </a>
    <div class="hidden md:flex items-center gap-6 text-sm text-white/60" id="navLinks"></div>
    <div class="text-xs font-medium bg-brand-600/20 text-brand-300 border border-brand-500/30 px-3 py-1.5 rounded-full">Free &amp; Unlimited</div>
  </div>
</nav>

<!-- MAIN -->
<main class="max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-8">

  <!-- Badge -->
  <div class="flex justify-center mb-6">
    <span class="inline-flex items-center gap-2 text-xs font-semibold bg-brand-600/15 text-brand-300 border border-brand-500/25 px-4 py-1.5 rounded-full fade-in">
      <span class="w-2 h-2 rounded-full bg-green-400 pulse"></span>
      5 Platforms &middot; HD Quality &middot; No Signup
    </span>
  </div>

  <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-center leading-tight mb-4 slide-up">
    Download Videos
    <span class="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-violet-400 to-pink-400">Instantly</span>
  </h1>
  <p class="text-center text-white/50 text-lg mb-10 max-w-lg mx-auto slide-up">
    YouTube, TikTok, Instagram, Facebook &amp; Twitter &mdash; HD quality, completely free.
  </p>

  <!-- Platform tabs -->
  <div id="platformTabs" class="flex gap-2 mb-6 overflow-x-auto pb-1 slide-up"></div>

  <!-- URL input -->
  <div class="glass-card rounded-2xl p-1.5 flex gap-2 mb-8 slide-up shadow-2xl">
    <input id="urlInput" type="url" inputmode="url" autocomplete="off" spellcheck="false"
      placeholder="Paste video URL here&hellip;"
      class="url-input flex-1 bg-transparent text-white placeholder:text-white/30 text-base px-4 py-3.5 rounded-xl min-w-0"/>
    <button id="downloadBtn"
      class="shrink-0 bg-brand-600 disabled:opacity-50 text-white font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-lg">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
      <span id="btnText">Download</span>
    </button>
  </div>

  <!-- Error banner -->
  <div id="errorBanner" style="display:none" class="mb-6 items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3.5 text-sm fade-in">
    <svg class="w-5 h-5 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <span id="errorMsg"></span>
  </div>

  <!-- Loading skeleton -->
  <div id="loadingSkeleton" class="hidden fade-in">
    <div class="glass-card rounded-2xl p-6 flex gap-5 mb-4">
      <div class="shimmer rounded-xl w-44 h-28 shrink-0"></div>
      <div class="flex-1 space-y-3 pt-1">
        <div class="shimmer h-5 rounded-lg w-3/4"></div>
        <div class="shimmer h-4 rounded-lg w-1/2"></div>
        <div class="shimmer h-4 rounded-lg w-1/3"></div>
      </div>
    </div>
    <div class="space-y-3">
      <div class="shimmer h-14 rounded-xl"></div>
      <div class="shimmer h-14 rounded-xl"></div>
      <div class="shimmer h-14 rounded-xl"></div>
    </div>
  </div>

  <!-- Results -->
  <div id="results" class="hidden fade-in">
    <div class="glass-card rounded-2xl p-5 mb-4 flex gap-5">
      <div class="relative shrink-0">
        <img id="resThumbnail" src="" alt="thumbnail" class="w-44 h-28 object-cover rounded-xl bg-surface-700"
          onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22176%22 height=%22112%22%3E%3Crect width=%22176%22 height=%22112%22 fill=%22%2318181e%22/%3E%3Ctext x=%2288%22 y=%2256%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 font-size=%2228%22%3E%F0%9F%8E%AC%3C/text%3E%3C/svg%3E'"/>
        <div id="resPlatformBadge" class="absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-md text-white"></div>
      </div>
      <div class="flex-1 min-w-0 pt-1">
        <h2 id="resTitle" class="font-semibold text-base leading-snug mb-2 line-clamp-2 text-white/90"></h2>
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/40">
          <span class="flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            <span id="resAuthorText"></span>
          </span>
          <span id="resDuration" class="hidden flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span id="resDurationText"></span>
          </span>
        </div>
      </div>
    </div>
    <p class="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3 px-1">Choose Format</p>
    <div id="resFormats"></div>
  </div>

  <!-- Feature cards -->
  <div id="featureSection" class="grid sm:grid-cols-3 gap-4 mt-16 mb-12">
    <div class="glass-card rounded-2xl p-5 text-center">
      <div class="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
        <svg class="w-5 h-5 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      </div>
      <h3 class="font-semibold mb-1">Lightning Fast</h3>
      <p class="text-sm text-white/40">Powered by Cloudflare&rsquo;s global edge network for instant downloads worldwide.</p>
    </div>
    <div class="glass-card rounded-2xl p-5 text-center">
      <div class="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
        <svg class="w-5 h-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
      </div>
      <h3 class="font-semibold mb-1">No Watermarks</h3>
      <p class="text-sm text-white/40">Download TikTok videos without watermarks. Clean, original quality.</p>
    </div>
    <div class="glass-card rounded-2xl p-5 text-center">
      <div class="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center mx-auto mb-3">
        <svg class="w-5 h-5 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <h3 class="font-semibold mb-1">Secure &amp; Private</h3>
      <p class="text-sm text-white/40">No account needed. We don&rsquo;t store your downloads or personal data.</p>
    </div>
  </div>

  <!-- FAQ -->
  <div class="mb-16">
    <h2 class="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
    <div id="faqContainer"></div>
  </div>
</main>

<!-- FOOTER -->
<footer class="border-t border-white/5 py-8">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/30">
    <span>&copy; 2025 VidsDownloader. For personal use only.</span>
    <div class="flex gap-6">
      <a href="#" class="hover:text-white/60">Privacy</a>
      <a href="#" class="hover:text-white/60">Terms</a>
      <a href="#" class="hover:text-white/60">DMCA</a>
    </div>
  </div>
</footer>

<script>${JS}</script>
</body>
</html>`;
};
