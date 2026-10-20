import { useState } from 'react'
import { shareX, shareTelegram, postDiscord } from '../lib/share'
export default function ShareBar({ text, url }) {
  const [msg, setMsg] = useState('')
  const [hook, setHook] = useState(localStorage.discordHook || '')
  const [showHook, setShowHook] = useState(false)
  const shareable = url && !url.startsWith('blob:')
  const link = shareable ? url : (typeof window !== 'undefined' ? window.location.origin : '')
  const copy = async () => { await navigator.clipboard.writeText(`${text}\n${link}`); setMsg('Copied — paste it in Discord!') }
  const send = async () => {
    try { localStorage.discordHook = hook; await postDiscord({ webhook: hook, content: `${text}\n${link}` }); setMsg('Posted to Discord ✅') }
    catch (e) { setMsg('Discord failed: ' + e.message) }
  }
  return (
    <div className="flex flex-wrap items-center gap-2" aria-live="polite">
      <a className="btn-ghost !py-1.5 text-sm" target="_blank" rel="noopener noreferrer" href={shareX(text, link)}>Share on X</a>
      <a className="btn-ghost !py-1.5 text-sm" target="_blank" rel="noopener noreferrer" href={shareTelegram(text, link)}>Telegram</a>
      <button className="btn-ghost !py-1.5 text-sm" onClick={copy}>Discord (copy)</button>
      <button className="btn-ghost !py-1.5 text-sm" onClick={() => setShowHook(!showHook)} aria-expanded={showHook}>Discord webhook</button>
      {showHook && (
        <div className="w-full flex gap-2">
          <label className="sr-only" htmlFor="hook">Discord webhook URL</label>
          <input id="hook" className="input text-sm" placeholder="https://discord.com/api/webhooks/… (blank = server default)" value={hook} onChange={(e) => setHook(e.target.value)} />
          <button className="btn-cyan !py-1.5 text-sm" onClick={send}>Post</button>
        </div>
      )}
      {!shareable && url && <p className="w-full text-xs text-slate-500">Local clips aren't public yet — connect Supabase storage for shareable links.</p>}
      {msg && <p className="w-full text-sm">{msg}</p>}
    </div>
  )
}
