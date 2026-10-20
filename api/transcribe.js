// POST raw media bytes (<4MB, Vercel limit) or JSON {url, duration}. Returns {segments:[{start,end,text}], mock}
import { readRaw, AI_BASE, mockSegments } from './_util.js'
export const config = { api: { bodyParser: false } }
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const raw = await readRaw(req)
  const ct = req.headers['content-type'] || ''
  let json = {}; if (ct.includes('json')) { try { json = JSON.parse(raw.toString() || '{}') } catch {} }
  const key = (process.env.OPENAI_API_KEY || '').startsWith('REPLACE') ? '' : process.env.OPENAI_API_KEY
  if (!key) return res.json({ mock: true, segments: mockSegments(json.duration) })
  try {
    let bytes = raw, type = ct, name = decodeURIComponent(req.headers['x-filename'] || 'audio.mp4')
    if (ct.includes('json')) {
      if (!json.url) return res.json({ mock: true, segments: mockSegments(json.duration) })
      const r = await fetch(json.url); if (!r.ok) throw new Error('fetch media ' + r.status)
      bytes = Buffer.from(await r.arrayBuffer()); type = r.headers.get('content-type') || 'video/mp4'; name = json.url.split('/').pop().split('?')[0] || name
      if (bytes.length > 25 * 1024 * 1024) throw new Error('media too large for transcription API (25MB)')
    }
    const fd = new FormData()
    fd.append('file', new Blob([bytes], { type }), name)
    fd.append('model', process.env.TRANSCRIBE_MODEL || 'whisper-1')
    fd.append('response_format', 'verbose_json')
    const r = await fetch(`${AI_BASE()}/audio/transcriptions`, { method: 'POST', headers: { Authorization: `Bearer ${key}` }, body: fd })
    if (!r.ok) throw new Error(await r.text())
    const j = await r.json()
    const segments = (j.segments || [{ start: 0, end: j.duration || 0, text: j.text }]).map((s) => ({ start: s.start, end: s.end, text: s.text.trim() }))
    res.json({ mock: false, segments })
  } catch (e) {
    res.json({ mock: true, error: String(e.message || e).slice(0, 300), segments: mockSegments(json.duration) })
  }
}
