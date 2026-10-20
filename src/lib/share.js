export const shareX = (text, url) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
export const shareTelegram = (text, url) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
export async function postDiscord({ webhook, content }) {
  const r = await fetch('/api/discord', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ webhook, content }) })
  if (!r.ok) throw new Error(await r.text())
}
export const fmt = (s) => { s = Math.max(0, s || 0); const m = Math.floor(s / 60); return `${m}:${(s % 60).toFixed(1).padStart(4, '0')}` }
