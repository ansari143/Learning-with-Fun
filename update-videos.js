// Learning with Fun — daily video updater.
// Reads the public YouTube channel pages (no API key needed) and writes data/videos.js.
// Run:  node update-videos.js
const fs = require('fs');
const path = require('path');

const HANDLE = '@LearningwithFunkid';
const OUT = path.join(__dirname, 'data', 'videos.js');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';
const MAX_PAGES = 15; // ~30 items per page

const walk = (o, key, out = []) => {
  if (Array.isArray(o)) o.forEach(v => walk(v, key, out));
  else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) { if (k === key) out.push(v); walk(v, key, out); }
  return out;
};

async function getPage(tab) {
  const res = await fetch(`https://www.youtube.com/${HANDLE}/${tab}`, {
    headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9', Cookie: 'CONSENT=YES+1' },
  });
  const html = await res.text();
  const i = html.indexOf('var ytInitialData = ');
  const j = html.indexOf(';</script>', i);
  if (i < 0) throw new Error(`Could not read YouTube ${tab} page`);
  const version = (html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/) || [])[1] || '2.20261116.00.00';
  return { data: JSON.parse(html.slice(i + 20, j)), version };
}

async function getContinuation(token, version) {
  const res = await fetch('https://www.youtube.com/youtubei/v1/browse?prettyPrint=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: version, hl: 'en', gl: 'US' } }, continuation: token }),
  });
  return res.json();
}

async function collect(tab, extract) {
  const { data, version } = await getPage(tab);
  const items = extract(data);
  let tokens = walk(data, 'continuationCommand').map(c => c.token);
  let token = tokens[tokens.length - 1];
  for (let p = 0; token && p < MAX_PAGES; p++) {
    const more = await getContinuation(token, version);
    const got = extract(more);
    if (!got.length) break;
    items.push(...got);
    tokens = walk(more, 'continuationCommand').map(c => c.token);
    token = tokens[tokens.length - 1];
  }
  const seen = new Set();
  return items.filter(v => v.id && !seen.has(v.id) && seen.add(v.id));
}

const parseViews = t => {
  if (!t) return 0;
  const m = String(t).replace(/,/g, '').match(/([\d.]+)\s*([KMB]?)/i);
  if (!m) return 0;
  return Math.round(parseFloat(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9 }[m[2].toUpperCase()] || 1));
};

// "8 hours ago" -> approximate ISO date
const agoToDate = (t, now) => {
  const m = (t || '').match(/(\d+)\s*(second|minute|hour|day|week|month|year)/i);
  if (!m) return now.toISOString();
  const ms = { second: 1e3, minute: 6e4, hour: 36e5, day: 864e5, week: 6048e5, month: 2592e6, year: 31536e6 }[m[2].toLowerCase()];
  return new Date(now - parseInt(m[1]) * ms).toISOString();
};

const extractLong = now => d => walk(d, 'lockupViewModel').map(l => {
  const meta = l.metadata?.lockupMetadataViewModel || {};
  const parts = walk(meta, 'metadataParts').flat();
  const viewsPart = parts.find(p => /view/i.test(p.accessibilityLabel || p.text?.content || ''));
  const agoPart = parts.find(p => /ago/i.test(p.accessibilityLabel || p.text?.content || ''));
  const badge = walk(l.contentImage, 'thumbnailBadgeViewModel')[0];
  return {
    id: l.contentId,
    title: meta.title?.content || '',
    duration: badge?.text || '',
    views: parseViews(viewsPart?.accessibilityLabel || viewsPart?.text?.content),
    published: agoToDate(agoPart?.accessibilityLabel || agoPart?.text?.content, now),
  };
});

const extractShorts = d => walk(d, 'shortsLockupViewModel').map(s => {
  const o = s.overlayMetadata || {};
  return {
    id: s.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId,
    title: o.primaryText?.content || '',
    views: parseViews(o.secondaryText?.content),
  };
});

(async () => {
  const now = new Date();
  const [videos, shorts] = await Promise.all([collect('videos', extractLong(now)), collect('shorts', extractShorts)]);

  // Keep the first-seen publish date stable between runs.
  let old = { videos: [] };
  try { old = JSON.parse(fs.readFileSync(OUT, 'utf8').replace(/^[^{]*/, '').replace(/;\s*$/, '')); } catch {}
  const oldDates = Object.fromEntries((old.videos || []).map(v => [v.id, v.published]));
  for (const v of videos) if (oldDates[v.id] && oldDates[v.id] < v.published) v.published = oldDates[v.id];

  const out = { updated: now.toISOString(), videos, shorts };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, 'window.LWF_DATA = ' + JSON.stringify(out, null, 1) + ';\n');
  console.log(`Saved ${videos.length} long videos and ${shorts.length} shorts -> ${OUT}`);
})().catch(e => { console.error(e); process.exit(1); });
