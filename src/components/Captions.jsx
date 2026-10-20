import { useState } from 'react'
const TONES = ['Hype', 'Funny', 'Professional', 'Web3/Crypto', 'Chill']
export default function Captions({ context, onPick }) {
  const [tone, setTone] = useState('Web3/Crypto')
  const [list, setList] = useState([])
  const [busy, setBusy] = useState(false)
  const [src, setSrc] = useState('')
  const run = async () => {
    setBusy(true)
    try {
      const r = await fetch('/api/captions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tone, context }) })
      const j = await r.json(); setList(j.suggestions || []); setSrc(j.source)
    } catch { setList(localTemplates(tone, context)); setSrc('template') }
    setBusy(false)
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-end">
        <div className="flex-1"><label className="label" htmlFor="tone">Caption tone</label>
          <select id="tone" className="input" value={tone} onChange={(e) => setTone(e.target.value)}>{TONES.map((t) => <option key={t}>{t}</option>)}</select></div>
        <button className="btn-cyan" onClick={run} disabled={busy}>{busy ? '…' : '✨ Suggest'}</button>
      </div>
      {src === 'template' && list.length > 0 && <p className="text-xs text-slate-500">Template suggestions (add OPENAI_API_KEY for AI).</p>}
      <ul className="space-y-1">{list.map((s, i) => <li key={i}><button className="w-full text-left text-sm rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 hover:border-purple-brand" onClick={() => onPick(s)}>{s}</button></li>)}</ul>
    </div>
  )
}
export function localTemplates(tone, context = '') {
  const t = (context || 'this moment').slice(0, 60)
  const m = {
    'Web3/Crypto': [`gm. ${t} 🚀 #web3`, `WAGMI energy only ⚡ ${t}`, `ser, you need to see this 👀 #crypto`],
    Hype: [`NO WAY 🔥 ${t}`, `This is the clip of the year 😤`, `Watch till the end 👀`],
    Funny: [`I can't stop rewatching this 😂`, `POV: ${t}`, `Nobody: … Me: 🤡`],
    Professional: [`Key takeaway: ${t}`, `A 30-second insight worth your time.`, `Highlights from today's session.`],
    Chill: [`just vibes ✨ ${t}`, `a little moment for your feed 🌊`, `saving this one 💜`],
  }
  return m[tone] || m.Hype
}
