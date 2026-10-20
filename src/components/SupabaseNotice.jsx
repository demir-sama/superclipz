import { useState } from 'react'
export default function SupabaseNotice() {
  const [hide, setHide] = useState(sessionStorage.sbHide === '1')
  if (hide) return null
  return (
    <div role="status" className="bg-orange-brand/15 border-b border-orange-brand/40 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <p>⚡ <strong>Demo mode:</strong> connect Supabase (set <code>VITE_SUPABASE_URL</code> + <code>VITE_SUPABASE_ANON_KEY</code>) to enable accounts and cloud storage. Clips are saved in this browser for now.</p>
        <button className="font-semibold underline" onClick={() => { sessionStorage.sbHide = '1'; setHide(true) }}>Dismiss</button>
      </div>
    </div>
  )
}
