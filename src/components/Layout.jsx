import { Link, NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../lib/auth'
import { supabase, supabaseReady } from '../lib/supabase'
import SupabaseNotice from './SupabaseNotice'

export function Logo({ className = 'h-9' }) {
  return (<>
    <img src="/brand/logo.png" alt="SuperClipz" className={`${className} dark:hidden`} />
    <img src="/brand/logo-dark.png" alt="SuperClipz" className={`${className} hidden dark:block`} />
  </>)
}

function ThemeToggle() {
  const [dark, setDark] = useState(document.documentElement.classList.contains('dark'))
  const toggle = () => { const d = !dark; setDark(d); document.documentElement.classList.toggle('dark', d); localStorage.theme = d ? 'dark' : 'light' }
  return <button onClick={toggle} className="btn-ghost !px-3" aria-label={`Switch to ${dark ? 'light' : 'dark'} mode`} aria-pressed={dark}>{dark ? '☀️' : '🌙'}</button>
}

export default function Layout() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const nav = 'px-3 py-2 rounded-lg font-semibold hover:text-purple-brand'
  const active = ({ isActive }) => `${nav} ${isActive ? 'text-purple-brand' : ''}`
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:p-2 focus:bg-cyan-brand">Skip to content</a>
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-950/85 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
          <Link to="/" aria-label="SuperClipz home"><Logo /></Link>
          <nav className={`${open ? 'flex' : 'hidden'} md:flex absolute md:static top-16 inset-x-0 flex-col md:flex-row gap-1 bg-white dark:bg-slate-950 md:bg-transparent p-4 md:p-0 border-b md:border-0 border-slate-200 dark:border-slate-800`} aria-label="Main">
            <NavLink to="/clip" className={active} onClick={() => setOpen(false)}>Clipper</NavLink>
            <NavLink to="/dashboard" className={active} onClick={() => setOpen(false)}>Dashboard</NavLink>
            <a href="/#pricing" className={nav} onClick={() => setOpen(false)}>Pricing</a>
            {user ? <button className={nav + ' text-left'} onClick={() => supabase.auth.signOut()}>Sign out</button>
                  : <NavLink to="/login" className={active} onClick={() => setOpen(false)}>Log in</NavLink>}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/clip" className="btn-primary hidden sm:inline-flex">Start Clipping</Link>
            <button className="btn-ghost !px-3 md:hidden" aria-expanded={open} aria-label="Menu" onClick={() => setOpen(!open)}>☰</button>
          </div>
        </div>
      </header>
      {!supabaseReady && <SupabaseNotice />}
      <main id="main" className="flex-1"><Outlet /></main>
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 grid gap-6 sm:grid-cols-3 text-sm">
          <div><Logo className="h-8" /><p className="mt-3 text-slate-500">Clip the moment. Share it everywhere.</p></div>
          <nav aria-label="Footer" className="flex flex-col gap-2">
            <Link to="/clip">Clipper</Link><Link to="/dashboard">Dashboard</Link><Link to="/terms">Terms</Link>
          </nav>
          <p className="text-slate-500">© {new Date().getFullYear()} SuperClipz. Built for creators. Only clip content you have the right to share.</p>
        </div>
      </footer>
    </div>
  )
}
