import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Timeline from '../components/Timeline'
import Transcript from '../components/Transcript'
import Captions from '../components/Captions'
import { cutClip, serverConfigured, API as API_BASE } from '../lib/ffmpeg'
import { saveClip } from '../lib/clips'
import { useAuth } from '../lib/auth'
import { fmt } from '../lib/share'

const ASPECTS = { '9:16': 'aspect-[9/16] max-h-[70vh]', '1:1': 'aspect-square max-h-[70vh]', '16:9': 'aspect-video' }
const SAMPLE = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
const isPlatform = (u) => /youtube\.com|youtu\.be|twitch\.tv/i.test(u)

export default function Clipper() {
  const { user, plan } = useAuth()
  const nav = useNavigate()
  const media = useRef(null)
  const [urlInput, setUrlInput] = useState('')
  const [src, setSrc] = useState(null) // { url, file, isAudio, name }
  const [duration, setDuration] = useState(0)
  const [range, setRange] = useState([0, 0])
  const [current, setCurrent] = useState(0)
  const [caption, setCaption] = useState('')
  const [aspect, setAspect] = useState('9:16')
  const [watermark, setWatermark] = useState(true)
  const [rights, setRights] = useState(false)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const [segments, setSegments] = useState([])
  const [trBusy, setTrBusy] = useState(false)
  const [mock, setMock] = useState(false)
  const locked = plan === 'free'
  useEffect(() => { if (locked) setWatermark(true) }, [locked])

  const loadUrl = (u) => {
    u = u.trim(); if (!u) return
    if (isPlatform(u) && !serverConfigured) { setStatus('YouTube/Twitch links need the SuperClipz server with yt-dlp (set VITE_API_URL). Use a direct media URL or upload a file.'); return }
    const playable = isPlatform(u) ? `${API_BASE}/proxy?url=${encodeURIComponent(u)}` : u
    setSrc({ url: playable, original: u, isAudio: /\.(mp3|wav|m4a|ogg|aac)(\?|$)/i.test(u), name: u.split('/').pop().split('?')[0] })
    setSegments([]); setStatus('')
  }
  const onFile = (f) => { if (!f) return; setSrc({ url: URL.createObjectURL(f), file: f, isAudio: f.type.startsWith('audio'), name: f.name }); setSegments([]); setStatus('') }

  const onMeta = () => { const d = media.current.duration || 0; setDuration(d); setRange([0, Math.min(d, 30)]) }
  const onTime = () => {
    const t = media.current.currentTime; setCurrent(t)
    if (t >= range[1] && !media.current.paused) { media.current.currentTime = range[0] }
  }
  const seek = (t) => { if (media.current) { media.current.currentTime = t; setCurrent(t) } }
  const playRange = () => { seek(range[0]); media.current.play() }

  const transcribe = async () => {
    setTrBusy(true)
    try {
      let r
      if (src.file && src.file.size < 4 * 1024 * 1024) r = await fetch('/api/transcribe', { method: 'POST', headers: { 'Content-Type': src.file.type || 'application/octet-stream', 'x-filename': encodeURIComponent(src.file.name) }, body: src.file })
      else r = await fetch('/api/transcribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: src.original || null, duration }) })
      const j = await r.json(); setSegments(j.segments || []); setMock(!!j.mock)
    } catch { setSegments(mockSegments(duration)); setMock(true) }
    setTrBusy(false)
  }

  const exportClip = async () => {
    setBusy(true); setStatus(serverConfigured ? 'Cutting on server…' : 'Loading in-browser FFmpeg (first time ~30MB)…')
    const [start, end] = range
    try {
      const { blob, via } = await cutClip({ file: src.file, url: src.original || src.url, start, end, aspect, watermark, isAudio: src.isAudio, onProgress: (p) => setStatus(`Cutting in browser… ${Math.round(p * 100)}%`) })
      await saveClip(user, { title: caption.slice(0, 60) || src.name || 'Untitled clip', caption, start, end, aspect, watermark, source_url: src.file ? null : (src.original || src.url), ext: src.isAudio ? 'mp3' : 'mp4' }, blob)
      setStatus(`Exported via ${via} ✅`); nav('/dashboard')
    } catch (e) {
      console.error(e)
      setStatus('Export failed: ' + (e.message || e) + (src.file ? '' : ' — remote URLs must allow CORS for in-browser cutting; try uploading the file.'))
    }
    setBusy(false)
  }

  const selectedText = segments.filter((s) => s.end > range[0] && s.start < range[1]).map((s) => s.text).join(' ')

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold">Clipper</h1>
      <div className="mt-6 card grid gap-4 md:grid-cols-[1fr_auto_auto] items-end">
        <form onSubmit={(e) => { e.preventDefault(); loadUrl(urlInput) }} className="flex gap-2 items-end">
          <div className="flex-1"><label className="label" htmlFor="url">Paste a media URL</label>
            <input id="url" className="input" type="url" placeholder="https://…/video.mp4" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} /></div>
          <button className="btn-primary">Load</button>
        </form>
        <label className="btn-ghost cursor-pointer">Upload file<input type="file" accept="video/*,audio/*" className="sr-only" onChange={(e) => onFile(e.target.files[0])} /></label>
        <button className="btn-ghost" onClick={() => { setUrlInput(SAMPLE); loadUrl(SAMPLE) }}>Try sample</button>
        <p className="md:col-span-3 text-xs text-slate-500">Direct media URLs (.mp4, .webm, .mp3…) work. YouTube/Twitch need the SuperClipz server with yt-dlp{serverConfigured ? ' (connected).' : ' (not connected).'}</p>
      </div>

      {src && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-4">
            <div className="card">
              <div className="flex justify-center bg-slate-900 rounded-xl p-3">
                <div className={`relative overflow-hidden rounded-lg bg-black ${src.isAudio ? 'w-full' : ASPECTS[aspect] + ' w-full'}`} style={aspect === '9:16' && !src.isAudio ? { width: 'auto', height: '70vh' } : aspect === '1:1' && !src.isAudio ? { maxWidth: '70vh' } : {}}>
                  {src.isAudio
                    ? <audio ref={media} src={src.url} controls className="w-full" onLoadedMetadata={onMeta} onTimeUpdate={onTime} />
                    : <video ref={media} src={src.url} controls playsInline className="absolute inset-0 h-full w-full object-cover" onLoadedMetadata={onMeta} onTimeUpdate={onTime} />}
                  {!src.isAudio && caption && <p className="absolute bottom-14 inset-x-3 text-center text-white font-bold text-lg drop-shadow-[0_2px_4px_rgba(0,0,0,.9)] pointer-events-none">{caption}</p>}
                  {!src.isAudio && watermark && <img src="/brand/logo-dark.png" alt="" className="absolute top-3 right-3 h-6 opacity-80 pointer-events-none" />}
                </div>
              </div>
              <div className="mt-4"><Timeline duration={duration} start={range[0]} end={range[1]} current={current} onChange={(a, b) => { setRange([a, b]); seek(a) }} onSeek={seek} /></div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button className="btn-cyan !py-1.5 text-sm" onClick={playRange}>▶ Play selection</button>
                <button className="btn-ghost !py-1.5 text-sm" onClick={() => setRange([Math.min(current, range[1] - 0.5), range[1]])}>Set start = {fmt(current)}</button>
                <button className="btn-ghost !py-1.5 text-sm" onClick={() => setRange([range[0], Math.max(current, range[0] + 0.5)])}>Set end = {fmt(current)}</button>
              </div>
            </div>
            <Transcript segments={segments} loading={trBusy} mock={mock} onSeek={seek} current={current} onRun={transcribe} canRun={!!src} />
          </div>

          <div className="space-y-4">
            <div className="card space-y-4">
              <fieldset><legend className="label">Aspect ratio</legend>
                <div className="flex gap-2" role="radiogroup">
                  {Object.keys(ASPECTS).map((a) => <button key={a} role="radio" aria-checked={aspect === a} onClick={() => setAspect(a)} className={`btn !px-4 !py-1.5 border ${aspect === a ? 'bg-purple-brand text-white border-purple-brand' : 'border-slate-300 dark:border-slate-700'}`}>{a}</button>)}
                </div>
              </fieldset>
              <div><label className="label" htmlFor="cap">Caption</label>
                <textarea id="cap" rows={3} className="input" maxLength={280} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Say something about this clip…" />
                <p className="text-xs text-right text-slate-500">{caption.length}/280</p></div>
              <Captions context={selectedText || caption || src.name} onPick={setCaption} />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={watermark} disabled={locked} onChange={(e) => setWatermark(e.target.checked)} className="h-5 w-5 accent-purple-600" />
                <span>Watermark {locked && <span className="text-xs text-slate-500">(locked on for Free plan — <a href="/#pricing" className="underline">upgrade</a>)</span>}</span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" required checked={rights} onChange={(e) => setRights(e.target.checked)} className="h-5 w-5 mt-0.5 accent-purple-600" />
                <span>I have the right to clip this. <Link to="/terms" className="underline text-purple-brand" target="_blank">Terms</Link></span>
              </label>
              <button className="btn-primary w-full text-lg" disabled={!rights || busy || !duration} onClick={exportClip}>{busy ? 'Exporting…' : `Export ${fmt(range[1] - range[0])} clip`}</button>
              <p role="status" aria-live="polite" className="text-sm">{status}</p>
            </div>
          </div>
        </div>
      )}
      {!src && <p className="mt-10 text-center text-slate-500">{status || 'Load a URL or upload a file to start clipping.'}</p>}
      {src && status && !busy && <p className="sr-only">{status}</p>}
    </div>
  )
}

export function mockSegments(d = 60) {
  const lines = ['gm everyone, welcome back to the stream.', "Today we're talking about the new drop.", 'This part right here is the moment you want to clip.', "Mint opens tomorrow, so don't miss it.", 'Thanks for watching — share it everywhere!']
  const step = Math.max(2, (d || 60) / lines.length)
  return lines.map((text, i) => ({ start: +(i * step).toFixed(1), end: +((i + 1) * step).toFixed(1), text }))
}
