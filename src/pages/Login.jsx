import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, supabaseReady } from '../lib/supabase'
import { Logo } from '../components/Layout'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const nav = useNavigate()
  const submit = async (e) => {
    e.preventDefault(); setMsg('')
    if (!supabaseReady) return setMsg('Supabase is not connected yet — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    const fn = mode === 'login' ? supabase.auth.signInWithPassword : supabase.auth.signUp
    const { error } = await fn.call(supabase.auth, { email, password, options: { emailRedirectTo: `${window.location.origin}/dashboard` } })
    if (error) return setMsg(error.message)
    if (mode === 'signup') setMsg('Check your email to confirm your account.'); else nav('/dashboard')
  }
  const google = async () => {
    if (!supabaseReady) return setMsg('Supabase is not connected yet.')
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/dashboard` } })
    if (error) setMsg(error.message)
  }
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card">
        <div className="flex justify-center"><Logo className="h-10" /></div>
        <h1 className="mt-6 text-2xl font-extrabold text-center">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <button onClick={google} className="btn-ghost w-full mt-6">Continue with Google</button>
        <div className="my-4 text-center text-xs text-slate-500">or with email</div>
        <form onSubmit={submit} className="space-y-3">
          <div><label className="label" htmlFor="em">Email</label><input id="em" type="email" required autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><label className="label" htmlFor="pw">Password</label><input id="pw" type="password" required minLength={6} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="input" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <button className="btn-primary w-full">{mode === 'login' ? 'Log in' : 'Sign up'}</button>
        </form>
        <p role="status" aria-live="polite" className="mt-3 text-sm text-center">{msg}</p>
        <button className="mt-4 w-full text-sm underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? "New here? Create an account" : 'Have an account? Log in'}</button>
      </div>
    </div>
  )
}
