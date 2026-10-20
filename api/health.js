export default function handler(_req, res) {
  res.json({ ok: true, app: 'SuperClipz', ai: Boolean(process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith('REPLACE')), discordDefault: Boolean(process.env.DISCORD_WEBHOOK_URL) })
}
