import { Link } from 'react-router-dom'

const features = [
  { icon: '✂️', title: 'Frame-perfect cuts', body: 'Drag start and end handles on a timeline, preview instantly, export in 9:16, 1:1 or 16:9.' },
  { icon: '📝', title: 'Searchable transcripts', body: 'Auto-transcribe, search any word and jump straight to that moment in the clip.' },
  { icon: '🚀', title: 'Share everywhere', body: 'AI captions in your tone — including Web3/Crypto — and one-click share to X, Telegram and Discord.' },
]
const steps = [
  ['Drop it in', 'Paste a media link or upload a video or audio file.'],
  ['Clip it', 'Trim the moment, pick an aspect ratio, add a caption.'],
  ['Ship it', 'Export, save to your dashboard and share in one click.'],
]
// ✏️ EDITABLE: placeholder prices — change these before launch.
const plans = [
  { name: 'Free', price: '$0', note: 'forever', items: ['Unlimited clips in browser', 'SuperClipz watermark', 'Template captions', 'Share to X / Telegram / Discord'], cta: 'Start free' },
  { name: 'Pro', price: '$12', note: '/month (placeholder)', items: ['No watermark', 'AI transcripts & captions', 'Server-side fast exports', 'Cloud clip library'], cta: 'Go Pro', hot: true },
  { name: 'Team', price: '$39', note: '/month (placeholder)', items: ['Everything in Pro', '5 seats', 'Shared clip library', 'Discord webhook automations'], cta: 'Contact us' },
]
const faqs = [
  ['What links can I clip?', 'Direct media URLs (.mp4, .webm, .mp3…) work everywhere. YouTube and Twitch links need the SuperClipz server with yt-dlp enabled.'],
  ['Does exporting need a server?', 'No. If the clip server is unavailable, SuperClipz cuts clips right in your browser with ffmpeg.wasm.'],
  ['Can I remove the watermark?', 'The watermark is locked on for Free. Pro and Team plans can toggle it off.'],
  ['Is it legal to clip anything?', 'Only clip content you own or have permission to use. See our Terms.'],
]

export default function Landing() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-cyan-brand/30 blur-3xl" />
        <div aria-hidden className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-purple-brand/25 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
          <p className="inline-block rounded-full bg-orange-brand/15 text-orange-600 dark:text-orange-brand px-4 py-1 text-sm font-bold">Built for creators & web3 communities</p>
          <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight">Clip the moment.<br /><span className="bg-gradient-to-r from-cyan-brand via-purple-brand to-orange-brand bg-clip-text text-transparent">Share it everywhere.</span></h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">SuperClipz turns long streams, Spaces and videos into scroll-stopping clips with transcripts, AI captions and one-click sharing.</p>
          <div className="mt-10 flex flex-wrap gap-3 justify-center">
            <Link to="/clip" className="btn-primary text-lg px-8 py-3">Start Clipping</Link>
            <a href="#how" className="btn-ghost text-lg px-8 py-3">How it works</a>
          </div>
        </div>
      </section>

      <section aria-labelledby="features" className="max-w-6xl mx-auto px-4 py-16">
        <h2 id="features" className="sr-only">Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="card hover:-translate-y-1 transition">
              <div className="text-3xl" aria-hidden>{f.icon}</div>
              <h3 className="mt-4 text-xl font-bold">{f.title}</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" aria-labelledby="how-h" className="max-w-6xl mx-auto px-4 py-16">
        <h2 id="how-h" className="text-3xl font-extrabold text-center">How it works</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {steps.map(([t, b], i) => (
            <li key={t} className="card">
              <span className="grid place-items-center h-10 w-10 rounded-full bg-cyan-brand text-slate-900 font-extrabold">{i + 1}</span>
              <h3 className="mt-4 text-xl font-bold">{t}</h3><p className="mt-2 text-slate-600 dark:text-slate-300">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="pricing" aria-labelledby="pricing-h" className="max-w-6xl mx-auto px-4 py-16">
        <h2 id="pricing-h" className="text-3xl font-extrabold text-center">Pricing</h2>
        <p className="text-center mt-2 text-sm text-slate-500">Placeholder prices — editable in <code>src/pages/Landing.jsx</code>.</p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`card flex flex-col ${p.hot ? 'ring-2 ring-purple-brand' : ''}`}>
              {p.hot && <span className="self-start rounded-full bg-purple-brand text-white text-xs font-bold px-3 py-1 mb-2">Most popular</span>}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mt-2"><span className="text-4xl font-extrabold">{p.price}</span> <span className="text-slate-500">{p.note}</span></p>
              <ul className="mt-6 space-y-2 flex-1">{p.items.map((i) => <li key={i}>✓ {i}</li>)}</ul>
              <Link to="/clip" className={`mt-6 ${p.hot ? 'btn-primary' : 'btn-ghost'}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq-h" className="max-w-3xl mx-auto px-4 py-16">
        <h2 id="faq-h" className="text-3xl font-extrabold text-center">FAQ</h2>
        <div className="mt-8 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="card !p-4"><summary className="font-bold cursor-pointer">{q}</summary><p className="mt-2 text-slate-600 dark:text-slate-300">{a}</p></details>
          ))}
        </div>
      </section>
    </>
  )
}
