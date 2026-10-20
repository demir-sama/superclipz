import { useState } from 'react'
import { fmt } from '../lib/share'
export default function Transcript({ segments, loading, mock, onSeek, current, onRun, canRun }) {
  const [q, setQ] = useState('')
  const list = segments.filter((s) => s.text.toLowerCase().includes(q.toLowerCase()))
  return (
    <section className="card" aria-labelledby="tr-h">
      <div className="flex items-center justify-between gap-2">
        <h2 id="tr-h" className="font-bold text-lg">Transcript</h2>
        <button className="btn-ghost !py-1.5 text-sm" onClick={onRun} disabled={!canRun || loading}>{loading ? 'Transcribing…' : 'Transcribe'}</button>
      </div>
      {mock && <p className="text-xs mt-1 text-orange-600 dark:text-orange-brand">Mock transcript — add OPENAI_API_KEY in Vercel for real transcription.</p>}
      <label className="sr-only" htmlFor="tr-search">Search transcript</label>
      <input id="tr-search" className="input mt-3" placeholder="Search transcript…" value={q} onChange={(e) => setQ(e.target.value)} />
      <ul className="mt-3 max-h-64 overflow-auto space-y-1">
        {list.length === 0 && <li className="text-sm text-slate-500">{segments.length ? 'No matches.' : 'Load media, then press Transcribe.'}</li>}
        {list.map((s, i) => {
          const on = current >= s.start && current < s.end
          return (
            <li key={i}><button onClick={() => onSeek(s.start)} className={`w-full text-left rounded-lg px-2 py-1 hover:bg-cyan-brand/20 ${on ? 'bg-purple-brand/15' : ''}`}>
              <span className="font-mono text-xs text-purple-brand mr-2">{fmt(s.start)}</span>{s.text}
            </button></li>
          )
        })}
      </ul>
    </section>
  )
}
