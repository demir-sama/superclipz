import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
const Ctx = createContext({ user: null, plan: 'free' })
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null))
    return () => data.subscription.unsubscribe()
  }, [])
  const plan = user?.user_metadata?.plan || 'free'
  return <Ctx.Provider value={{ user, plan }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
