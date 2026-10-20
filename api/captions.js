import { AI_BASE } from './_util.js'
const templates = (tone, ctx = '') => {
  const t = (ctx || 'this moment').slice(0, 60)
  return ({
    'Web3/Crypto': [`gm. ${t} 🚀 #web3`, `WAGMI energy only ⚡ ${t}`, `ser, you need to see this 👀 #crypto`],
    Hype: [`NO WAY 🔥 ${t}`, 'This is the clip of the year 😤', 'Watch till the end 👀'],
    Funny: ["I can't stop rewatching this 😂", `POV: ${t}`, 'Nobody: … Me: 🤡'],
    Professional: [`Key takeaway: ${t}`, 'A 30-second insight worth your time.', "Highlights from today's session."],
    Chill: [`just vibes ✨ ${t}`, 'a little moment for your feed 🌊', 'saving this one 💜'],
  })[tone] || [`${t} 🔥`, 'Clip of the day', 'You need to see this']
}
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { tone = 'Hype', context = '' } = req.body || {}
  const key = (process.env.OPENAI_API_KEY || '').startsWith('REPLACE') ? '' : process.env.OPENAI_API_KEY
  if (!key) return res.json({ source: 'template', suggestions: templates(tone, context) })
  try {
    const r = await fetch(`${AI_BASE()}/chat/completions`, {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.CAPTION_MODEL || 'gpt-4o-mini', temperature: 0.9, response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: 'You write short social captions (<200 chars) for video clips. Reply JSON {"suggestions":[3 strings]}. ' + (tone === 'Web3/Crypto' ? 'Use web3/crypto-native slang (gm, wagmi, ser, onchain) tastefully, 1-2 hashtags.' : '') },
          { role: 'user', content: `Tone: ${tone}\nClip content: ${String(context).slice(0, 2000)}` }] }),
    })
    if (!r.ok) throw new Error(await r.text())
    const j = await r.json()
    const s = JSON.parse(j.choices[0].message.content).suggestions
    res.json({ source: 'ai', suggestions: s.slice(0, 5) })
  } catch (e) { res.json({ source: 'template', error: String(e.message).slice(0, 200), suggestions: templates(tone, context) }) }
}
