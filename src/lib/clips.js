// Clip storage: Supabase (table `clips` + bucket `clips`) when configured & signed in, else localStorage demo.
import { supabase } from './supabase'
const KEY = 'superclipz.clips'
const blobs = new Map() // in-memory blob URLs for this session (localStorage can't hold video)

const local = () => JSON.parse(localStorage.getItem(KEY) || '[]')
const saveLocal = (l) => localStorage.setItem(KEY, JSON.stringify(l))

export function seedDemo() {
  if (localStorage.getItem(KEY)) return
  saveLocal([{ id: 'demo-1', title: 'Demo: GM to the timeline', caption: 'gm frens ☀️ new drop incoming #web3', start: 3, end: 18, aspect: '9:16', source_url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', created_at: new Date().toISOString(), demo: true }])
}

export async function listClips(user) {
  if (supabase && user) {
    const { data, error } = await supabase.from('clips').select('*').order('created_at', { ascending: false })
    if (error) throw error
    return data.map((c) => ({ ...c, url: c.storage_path ? supabase.storage.from('clips').getPublicUrl(c.storage_path).data.publicUrl : c.source_url }))
  }
  seedDemo()
  return local().map((c) => ({ ...c, url: blobs.get(c.id) || c.url }))
}

export async function saveClip(user, meta, blob) {
  const id = crypto.randomUUID()
  if (supabase && user) {
    let storage_path = null
    if (blob) {
      storage_path = `${user.id}/${id}.${meta.ext || 'mp4'}`
      const { error } = await supabase.storage.from('clips').upload(storage_path, blob, { contentType: blob.type })
      if (error) throw error
    }
    const row = { id, user_id: user.id, title: meta.title, caption: meta.caption, start: meta.start, end: meta.end, aspect: meta.aspect, source_url: meta.source_url, storage_path, watermark: meta.watermark }
    const { error } = await supabase.from('clips').insert(row)
    if (error) throw error
    return row
  }
  const row = { id, ...meta, created_at: new Date().toISOString(), url: meta.source_url }
  if (blob) blobs.set(id, URL.createObjectURL(blob))
  saveLocal([row, ...local()])
  return row
}

export async function deleteClip(user, clip) {
  if (supabase && user) {
    if (clip.storage_path) await supabase.storage.from('clips').remove([clip.storage_path])
    const { error } = await supabase.from('clips').delete().eq('id', clip.id)
    if (error) throw error
    return
  }
  blobs.delete(clip.id)
  saveLocal(local().filter((c) => c.id !== clip.id))
}
