const signals = [
  { label: "years shipping web and business systems", value: "10+" },
  { label: "PostgreSQL tables designed in one live ERP", value: "94" },
  { label: "automated tests guarding it", value: "1,380+" },
  { label: "business units served as embedded owner", value: "8+" },
];

export default function HeroSection() {
  return (
    <section className="space-y-7">
      <div className="max-w-[44rem] space-y-5">
        <p className="font-mono text-sm font-semibold text-slate-400">
          Controlled boundaries.
        </p>
        <h1 className="text-5xl font-bold leading-[0.98] text-slate-100 md:text-7xl">
          I design the system, then build it.
        </h1>
        <p className="max-w-3xl text-lg leading-8 text-slate-300">
          Lehakoe Thinane. Systems designer and architect, AI engineer. Ten years
          of shipping web and business systems, now focused on AI that stays
          inside controlled boundaries.
        </p>
        <p className="font-mono text-sm text-slate-500">
          Johannesburg, South Africa - open to remote, hybrid and client-embedded work
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <a
          href="#cv"
          className="rounded-full bg-[#ff8248] px-5 py-3 text-sm font-bold text-[#1f1008] transition-colors hover:bg-[#ff9a68]"
        >
          Match me to your role
        </a>
        <a
          href="https://app.mmnexus.co.za"
          className="rounded-full border border-[#274363] bg-[#0a1b2c]/75 px-5 py-3 text-sm font-bold text-slate-300 transition-colors hover:border-[#446a91]"
        >
          See the live ERP
        </a>
        <a
          href="mailto:lehakoe.thinane@gmail.com"
          className="rounded-full border border-[#274363] bg-[#0a1b2c]/75 px-5 py-3 text-sm font-bold text-slate-300 transition-colors hover:border-[#446a91]"
        >
          Email me
        </a>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {signals.map((signal) => (
          <article
            key={signal.value}
            className="min-h-[8rem] rounded-2xl border border-[#274363] bg-[#0d2238]/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
          >
            <p className="font-mono text-4xl font-bold leading-none text-slate-100 md:text-5xl">
              {signal.value}
            </p>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-400">
              {signal.label}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
