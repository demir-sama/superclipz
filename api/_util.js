export const readRaw = async (req) => { const chunks = []; for await (const c of req) chunks.push(c); return Buffer.concat(chunks) }
export const AI_BASE = () => (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '')
export function mockSegments(d = 60) {
  const lines = ['gm everyone, welcome back to the stream.', "Today we're talking about the new drop.", 'This part right here is the moment you want to clip.', "Mint opens tomorrow, so don't miss it.", 'Thanks for watching — share it everywhere!']
  const step = Math.max(2, (d || 60) / lines.length)
  return lines.map((text, i) => ({ start: +(i * step).toFixed(1), end: +((i + 1) * step).toFixed(1), text }))
}
