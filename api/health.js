const isSet = (v) => Boolean(v && !String(v).startsWith('REPLACE'))
export default function handler(_req, res) {
  res.json({ ok: true, app: 'SuperClipz', ai: isSet(process.env.OPENAI_API_KEY), discordDefault: isSet(process.env.DISCORD_WEBHOOK_URL) })
}
