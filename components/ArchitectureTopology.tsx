const nodes = [
  { title: "Clients", detail: "Next.js - Electron", className: "left-[1%] top-[47%]" },
  { title: "Edge", detail: "Caddy - Cloudflare", className: "left-[20%] top-[47%]" },
  { title: "API", detail: "modular monolith", className: "left-[40%] top-[47%]", hot: true },
  { title: "AI assistant", detail: "runs as the user", className: "left-[62%] top-[47%]" },
  { title: "Model providers", detail: "Groq-Claude-Ollama", className: "left-[83%] top-[47%]" },
  { title: "Event outbox", detail: "SKIP LOCKED claims", className: "left-[62%] top-[17%]" },
  { title: "Workers", detail: "Celery - Redis", className: "left-[83%] top-[17%]" },
  { title: "PostgreSQL 17", detail: "tenant data - audit log", className: "left-[40%] top-[77%]" },
  { title: "Human approval", detail: "live writes gated", className: "left-[62%] top-[77%]", dashed: true },
  { title: "Live systems", detail: "ERP - website - webhooks", className: "left-[83%] top-[77%]" },
];

export default function ArchitectureTopology() {
  return (
    <section id="topology" className="overflow-hidden rounded-2xl border border-[#274363] bg-[#0d2238]/92 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-2 border-b border-[#274363] px-4 py-3 font-mono text-xs font-bold text-slate-400 md:flex-row md:items-center md:justify-between">
        <p>FIG. 1 - High-level design of BiznizFlowPilot, a live multi-tenant ERP</p>
        <p>Solid: request - Orange: event flow</p>
      </div>
      <p className="px-4 py-3 font-mono text-xs font-bold text-slate-500">
        Select any component to read how it works.
      </p>

      <div className="relative h-[34rem] min-w-[56rem]">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1000 540"
          role="img"
          aria-label="BiznizFlowPilot architecture topology"
        >
          <defs>
            <marker id="arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
              <path d="M0,0 L8,4 L0,8 Z" fill="#8ba6bd" />
            </marker>
            <marker id="eventArrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
              <path d="M0,0 L8,4 L0,8 Z" fill="#ff8248" />
            </marker>
          </defs>
          <path d="M170 284 H236" stroke="#8ba6bd" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M354 284 H430" stroke="#8ba6bd" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M560 284 H650" stroke="#8ba6bd" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M760 284 H842" stroke="#8ba6bd" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M500 330 V420" stroke="#8ba6bd" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M700 330 V420" stroke="#8ba6bd" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M760 455 H850" stroke="#8ba6bd" strokeWidth="3" markerEnd="url(#arrow)" />
          <path
            d="M500 252 V160 H650"
            stroke="#ff8248"
            strokeDasharray="7 10"
            strokeWidth="3"
            markerEnd="url(#eventArrow)"
          />
          <path
            d="M760 160 H850"
            stroke="#ff8248"
            strokeDasharray="7 10"
            strokeWidth="3"
            markerEnd="url(#eventArrow)"
          />
          <circle cx="700" cy="284" r="5" fill="#ff8248" />
          <circle cx="700" cy="454" r="5" fill="#ff8248" />
          <text x="536" y="149" fill="#8ba6bd" fontFamily="monospace" fontSize="12" fontWeight="700">
            events, same tx
          </text>
          <text x="714" y="383" fill="#8ba6bd" fontFamily="monospace" fontSize="12" fontWeight="700">
            writes need approval
          </text>
        </svg>

        {nodes.map((node) => (
          <button
            key={node.title}
            className={`absolute w-[10.6rem] rounded-xl border p-4 text-left font-mono transition-transform hover:-translate-y-1 ${
              node.className
            } ${
              node.hot
                ? "border-[#ff8248] bg-[#49342b] shadow-[0_0_28px_rgba(255,130,72,0.55)]"
                : node.dashed
                  ? "border-dashed border-[#7894ab] bg-[#0d2238]"
                  : "border-[#7894ab] bg-[#0b1b2c]"
            }`}
          >
            <span className="block text-base font-bold text-slate-100">{node.title}</span>
            <span className="mt-2 block text-xs font-bold text-slate-500">{node.detail}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
