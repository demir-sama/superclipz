import { fmt } from '../lib/share'
// Dual-handle range timeline. Keyboard accessible (native range inputs).
export default function Timeline({ duration, start, end, current, onChange, onSeek }) {
  const d = duration || 1
  const pct = (v) => `${(v / d) * 100}%`
  return (
    <div>
      <div className="relative h-12 select-none">
        <div className="absolute inset-y-2 inset-x-0 rounded-lg bg-slate-200 dark:bg-slate-800 cursor-pointer"
          onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); onSeek(((e.clientX - r.left) / r.width) * d) }} />
        <div className="absolute inset-y-2 rounded-lg bg-cyan-brand/40 border-2 border-cyan-brand pointer-events-none" style={{ left: pct(start), width: pct(end - start) }} />
        <div className="absolute inset-y-0 w-0.5 bg-orange-brand pointer-events-none" style={{ left: pct(current) }} aria-hidden />
        <input type="range" aria-label="Clip start" min={0} max={d} step={0.1} value={start}
          onChange={(e) => onChange(Math.min(+e.target.value, end - 0.5), end)}
          className="range-thumb absolute inset-0 w-full h-12" />
        <input type="range" aria-label="Clip end" min={0} max={d} step={0.1} value={end}
          onChange={(e) => onChange(start, Math.max(+e.target.value, start + 0.5))}
          className="range-thumb absolute inset-0 w-full h-12" />
      </div>
      <div className="flex justify-between text-sm mt-1 font-mono">
        <span>Start {fmt(start)}</span><span className="font-bold text-purple-brand">Length {fmt(end - start)}</span><span>End {fmt(end)}</span>
      </div>
    </div>
  )
}
