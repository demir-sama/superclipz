import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listClips, deleteClip } from '../lib/clips'
import { useAuth } from '../lib/auth'
import { fmt } from '../lib/share'
import ShareBar from '../components/ShareBar'

export default function Dashboard() {
  const { user } = useAuth()
  const [clips, setClips] = useState([])
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')
  const load = () => listClips(user).then(setClips).catch((e) => setErr(e.message))
  useEffect(() => { load() }, [user])
  const del = async (c) => { if (!confirm(`Delete "${c.title}"?`)) return; await deleteClip(user, c); load() }
  const copy = async (c) => { await navigator.clipboard.writeText(c.url?.startsWith('blob:') ? window.location.origin : c.url); setMsg('Link copied') }
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between"><h1 className="text-3xl font-extrabold">Your clips</h1><Link to="/clip" className="btn-primary">+ New clip</Link></div>
      {!user && <p className="mt-2 text-sm text-slate-500">Demo library stored in this browser. {' '}<Link to="/login" className="underline">Log in</Link> to sync with Supabase.</p>}
      {err && <p role="alert" className="mt-4 text-red-600">{err}</p>}
      <p aria-live="polite" className="text-sm mt-2">{msg}</p>
      {clips.length === 0 && <p className="mt-10 text-center text-slate-500">No clips yet.</p>}
      <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {clips.map((c) => (
          <li key={c.id} className="card !p-4 flex flex-col">
            {c.url ? <video src={c.url} controls preload="metadata" className="rounded-lg bg-black aspect-video w-full object-contain" aria-label={c.title} />
                   : <div className="rounded-lg bg-slate-200 dark:bg-slate-800 aspect-video grid place-items-center text-sm text-slate-500">Video only available in the session it was created (demo mode)</div>}
            <h2 className="mt-3 font-bold truncate">{c.title}</h2>
            <p className="text-xs text-slate-500">{c.aspect} · {fmt(c.start)}–{fmt(c.end)} · {new Date(c.created_at).toLocaleDateString()}</p>
            {c.caption && <p className="text-sm mt-1 line-clamp-2">{c.caption}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {c.url && <a className="btn-cyan !py-1.5 text-sm" href={c.url} download={`${c.title}.mp4`}>Download</a>}
              <button className="btn-ghost !py-1.5 text-sm" onClick={() => copy(c)}>Copy link</button>
              <button className="btn-ghost !py-1.5 text-sm text-red-600" onClick={() => del(c)}>Delete</button>
            </div>
            <div className="mt-3"><ShareBar text={c.caption || c.title} url={c.url} /></div>
          </li>
        ))}
      </ul>
    </div>
  )
}
