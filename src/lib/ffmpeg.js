// Cutting: server (/server FFmpeg service via VITE_API_URL) first, ffmpeg.wasm in-browser fallback.
const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
export const serverConfigured = Boolean(API)
const DIMS = { '9:16': [720, 1280], '1:1': [1080, 1080], '16:9': [1280, 720] }

export function filterFor(aspect, watermark, isAudio) {
  if (isAudio) return null
  const [w, h] = DIMS[aspect] || DIMS['16:9']
  let vf = `scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h}`
  if (watermark) vf += `,drawbox=x=iw-250:y=ih-70:w=230:h=50:color=0x8A2BE2@0.6:t=fill`
  return vf
}

export async function cutOnServer({ file, url, start, end, aspect, watermark }) {
  const fd = new FormData()
  if (file) fd.append('file', file); else fd.append('url', url)
  fd.append('start', start); fd.append('end', end); fd.append('aspect', aspect); fd.append('watermark', watermark ? '1' : '0')
  const r = await fetch(`${API}/clip`, { method: 'POST', body: fd })
  if (!r.ok) throw new Error((await r.text()) || 'Server cut failed')
  return r.blob()
}

let ff
async function loadWasm(onLog) {
  if (ff) return ff
  const { FFmpeg } = await import('@ffmpeg/ffmpeg')
  const { toBlobURL } = await import('@ffmpeg/util')
  ff = new FFmpeg()
  if (onLog) ff.on('log', ({ message }) => onLog(message))
  const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm'
  await ff.load({
    coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
  })
  return ff
}

export async function cutInBrowser({ file, url, start, end, aspect, watermark, isAudio, onProgress }) {
  const { fetchFile } = await import('@ffmpeg/util')
  const f = await loadWasm()
  if (onProgress) f.on('progress', ({ progress }) => onProgress(Math.max(0, Math.min(1, progress))))
  const inName = 'in' + (isAudio ? '.mp3' : '.mp4')
  await f.writeFile(inName, await fetchFile(file || url))
  const out = isAudio ? 'out.mp3' : 'out.mp4'
  const vf = filterFor(aspect, watermark, isAudio)
  const args = ['-ss', String(start), '-i', inName, '-t', String(end - start)]
  if (vf) args.push('-vf', vf, '-c:v', 'libx264', '-preset', 'ultrafast', '-c:a', 'aac')
  args.push(out)
  await f.exec(args)
  const data = await f.readFile(out)
  return new Blob([data.buffer], { type: isAudio ? 'audio/mpeg' : 'video/mp4' })
}

export async function cutClip(opts) {
  if (serverConfigured) {
    try { return { blob: await cutOnServer(opts), via: 'server' } } catch (e) { console.warn('server failed, falling back', e) }
  }
  return { blob: await cutInBrowser(opts), via: 'browser' }
}
