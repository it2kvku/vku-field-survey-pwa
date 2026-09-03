export function GridBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-slate-50" />
      <div
        className="absolute inset-0 opacity-[0.45]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(226 232 240 / 0.7) 1px, transparent 1px), linear-gradient(to bottom, rgb(226 232 240 / 0.7) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />
      <div className="absolute left-1/2 top-[-180px] h-[420px] w-[640px] -translate-x-1/2 rounded-full bg-navy-100/70 blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"
        }}
      />
    </div>
  )
}
