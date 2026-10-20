// SuperClipz FFmpeg clipper service. POST /clip (multipart: file | url, start, end, aspect, watermark) -> mp4/mp3
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'

const TMP = process.env.TMP_DIR || path.join(os.tmpdir(), 'superclipz')
await fs.mkdir(TMP, { recursive: true })
const app = express()
const origins = (process.env.ALLOWED_ORIGINS || '*').split(',').map((s) => s.trim())
app.use(cors({ origin: origins.includes('*') ? true : origins }))
const upload = multer({ dest: TMP, limits: { fileSize: 1024 * 1024 * 1024 } })
const DIMS = { '9:16': [720, 1280], '1:1': [1080, 1080], '16:9': [1280, 720] }
const FONT = process.env.FONT_FILE || '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
const PLATFORM = /youtube\.com|youtu\.be|twitch\.tv/i

const run = (cmd, args) => new Promise((ok, fail) => {
  const p = spawn(cmd, args); let err = ''
  p.stderr.on('data', (d) => { err += d; if (err.length > 8000) err = err.slice(-8000) })
  p.on('error', fail)
  p.on('close', (c) => (c === 0 ? ok() : fail(new Error(`${cmd} exited ${c}: ${err.slice(-500)}`))))
})

app.get('/health', (_q, r) => r.json({ ok: true }))

// Resolve a YouTube/Twitch URL to a direct stream URL via yt-dlp
async function resolveUrl(u) {
  if (!PLATFORM.test(u)) return u
  return new Promise((ok, fail) => {
    const p = spawn('yt-dlp', ['-f', 'best[ext=mp4]/best', '-g', u]); let out = ''
    p.stdout.on('data', (d) => (out += d)); p.on('error', fail)
    p.on('close', (c) => (c === 0 ? ok(out.trim().split('\n')[0]) : fail(new Error('yt-dlp failed'))))
  })
}

// Proxy for previewing platform links in the browser player
app.get('/proxy', async (req, res) => {
  try { res.redirect(await resolveUrl(String(req.query.url || ''))) } catch (e) { res.status(400).send(e.message) }
})

app.post('/clip', upload.single('file'), async (req, res) => {
  const id = crypto.randomUUID()
  const start = Math.max(0, parseFloat(req.body.start) || 0)
  const end = parseFloat(req.body.end)
  if (!(end > start)) return res.status(400).send('end must be > start')
  if (end - start > 60 * 30) return res.status(400).send('max clip length is 30 minutes')
  const aspect = DIMS[req.body.aspect] ? req.body.aspect : '16:9'
  const watermark = req.body.watermark === '1'
  let input
  try { input = req.file ? req.file.path : await resolveUrl(String(req.body.url || '')) } catch (e) { return res.status(400).send(e.message) }
  if (!input) return res.status(400).send('file or url required')
  const isAudio = (req.file?.mimetype || '').startsWith('audio') || /\.(mp3|wav|m4a|ogg|aac)(\?|$)/i.test(req.body.url || '')
  const out = path.join(TMP, `${id}.${isAudio ? 'mp3' : 'mp4'}`)
  const args = ['-y', '-ss', String(start), '-i', input, '-t', String(end - start)]
  if (!isAudio) {
    const [w, h] = DIMS[aspect]
    let vf = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`
    if (watermark) vf += `,drawtext=fontfile=${FONT}:text='SUPERCLIPZ':x=w-tw-24:y=24:fontsize=${Math.round(w / 22)}:fontcolor=white@0.85:box=1:boxcolor=0x8A2BE2@0.55:boxborderw=10`
    args.push('-vf', vf, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-c:a', 'aac', '-movflags', '+faststart')
  }
  args.push(out)
  try {
    await run('ffmpeg', args)
    res.setHeader('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4')
    const s = createReadStream(out); s.pipe(res)
    s.on('close', () => { fs.rm(out, { force: true }); if (req.file) fs.rm(req.file.path, { force: true }) })
  } catch (e) {
    if (req.file) fs.rm(req.file.path, { force: true })
    res.status(500).send(e.message)
  }
})

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`SuperClipz clipper on :${port}`))
