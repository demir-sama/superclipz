// Post a message to a Discord webhook (user-supplied or DISCORD_WEBHOOK_URL default).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { webhook, content } = req.body || {}
  const def = process.env.DISCORD_WEBHOOK_URL || ''
  const url = webhook || (def.startsWith('REPLACE') ? '' : def)
  if (!url) return res.status(400).send('No webhook URL provided and DISCORD_WEBHOOK_URL not set')
  if (!/^https:\/\/(discord|discordapp)\.com\/api\/webhooks\//.test(url)) return res.status(400).send('Not a Discord webhook URL')
  const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: String(content || '').slice(0, 1900), username: 'SuperClipz' }) })
  if (!r.ok) return res.status(502).send('Discord error ' + r.status)
  res.json({ ok: true })
}
