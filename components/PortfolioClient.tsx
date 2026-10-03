"use client";

import { useEffect, useMemo, useState } from "react";

const navItems = [
  { label: "Architecture", href: "#hld", id: "hld" },
  { label: "Live demo", href: "#demo", id: "demo" },
  { label: "Components", href: "#systems", id: "systems" },
  { label: "Decisions", href: "#adr", id: "adr" },
  { label: "Interactive CV", href: "#cv", id: "cv" },
];

const heroStats = [
  { value: 10, suffix: "+", label: "years shipping web and business systems" },
  { value: 94, suffix: "", label: "PostgreSQL tables designed in one live ERP" },
  { value: 1380, suffix: "+", label: "automated tests guarding it" },
  { value: 8, suffix: "+", label: "business units served as embedded owner" },
];

const diagramNodes = [
  { id: "clients", title: "Clients", sub: "Next.js · Electron", x: 36, y: 280, w: 166, h: 86, text: "The client layer presents web and desktop surfaces for people using the ERP." },
  { id: "edge", title: "Edge", sub: "Caddy · Cloudflare", x: 220, y: 280, w: 166, h: 86, text: "The edge handles routing, TLS and platform boundaries before requests reach application code." },
  { id: "api", title: "API", sub: "modular monolith", x: 414, y: 280, w: 166, h: 86, text: "The API is the selected control point: business changes, tenant scope and event persistence happen here." },
  { id: "assistant", title: "AI assistant", sub: "runs as the user", x: 622, y: 280, w: 166, h: 86, text: "The assistant uses the asking user's role and business scope. It cannot read more than that user can read." },
  { id: "models", title: "Model providers", sub: "Groq·Claude·Ollama", x: 816, y: 280, w: 166, h: 86, text: "Model providers help with language, but rules and permissions decide what actions are allowed." },
  { id: "outbox", title: "Event outbox", sub: "SKIP LOCKED claims", x: 622, y: 128, w: 166, h: 86, text: "Events are written with the business change, then claimed safely by workers for retries and delivery." },
  { id: "workers", title: "Workers", sub: "Celery · Redis", x: 816, y: 128, w: 166, h: 86, text: "Workers process event flow outside the request path while keeping duplicate actions harmless." },
  { id: "db", title: "PostgreSQL 17", sub: "tenant data · audit log", x: 414, y: 426, w: 166, h: 86, text: "PostgreSQL stores operational data, tenant boundaries and audit history for the live ERP." },
  { id: "approval", title: "Human approval", sub: "live writes gated", x: 622, y: 426, w: 166, h: 86, dashed: true, text: "Risky writes are paused for a person to approve before they touch live systems." },
  { id: "live", title: "Live systems", sub: "ERP · website · webhooks", x: 816, y: 426, w: 166, h: 86, text: "Approved changes land in real operational systems, websites and webhooks." },
];

const eventStages = [
  "1. API commits the business change and event together.",
  "2. Event outbox stores the durable work item.",
  "3. Workers claim the event with SKIP LOCKED and process it.",
];

const systems = [
  {
    component: "BiznizFlowPilot",
    status: "live",
    link: "https://app.mmnexus.co.za",
    purpose: "ERP for South African SMEs: inventory, sales, invoicing with VAT, finance, HR/payroll and an AI assistant.",
    boundary: "Every query is tenant-scoped, and a CI guard fails the build on queries outside the repository layer.",
    stack: "FastAPI, PostgreSQL, Celery, Next.js, Azure",
  },
  {
    component: "AI Growth Platform",
    status: "MVP",
    link: "https://github.com/LehakoeThinane",
    purpose: "Agent runtime for growth planning and incident triage.",
    boundary: "One validated tool call per step. Write permission comes from the operator, never the model.",
    stack: ".NET 10, EF Core, OpenAI function calling",
  },
  {
    component: "SEO-GEO Agent",
    status: "MVP",
    link: "https://github.com/LehakoeThinane",
    purpose: "Crawls a site, finds SEO issues, and applies approved fixes to WordPress.",
    boundary: "Rules decide what is safe to apply. The LLM only improves wording.",
    stack: "FastAPI, WordPress REST API, OpenAI/Groq/Ollama",
  },
];

const adrs = [
  {
    title: "Persist events in the same transaction as the change",
    context: "Workflows must fire when business data changes, and a lost event means a missed invoice email or webhook.",
    decision: "Write the event with the business change. Workers claim events with FOR UPDATE SKIP LOCKED. Retries use capped backoff, and stable action IDs act as idempotency keys.",
    tradeoff: "No promise of exactly-once delivery. Duplicates are made harmless instead.",
  },
  {
    title: "Let rules decide, let the model write",
    context: "Automated changes to a client's live website need to be explainable.",
    decision: "Deterministic rules own detection, scoring and apply-safety. The LLM only rewords recommendations, with fallback across providers and a heuristic engine last.",
    tradeoff: "Less flexible than a free-running agent, and far easier to audit.",
  },
  {
    title: "Give the assistant the user's permissions, not its own",
    context: "An in-app AI that can read business data is a new way to leak it.",
    decision: "Tools run as the asking user, with that user's role and business scope, and every data access is logged.",
    tradeoff: "The assistant can never know more than the person asking.",
  },
  {
    title: "Integrate with existing platforms instead of replacing them",
    context: "A multi-subsidiary group already ran on HubSpot, a CRM and an ERP, with mirrored operations in South Africa and Egypt.",
    decision: "Layer custom automations and AI workflows on top of what exists.",
    tradeoff: "Depends on third-party APIs, and avoids duplicate systems and a risky migration.",
  },
];

const measuredResults = [
  { value: "25%", label: "better order-processing efficiency, from a React product configurator" },
  { value: "30%", label: "more e-commerce conversions, from cart-abandonment automation and a redesigned checkout" },
  { value: "90+", label: "average Google PageSpeed score across 10+ production client sites" },
];

const experience = [
  {
    title: "Tax Consulting South Africa",
    role: "Embedded solution design and AI engineering · 2024 - now",
    points: [
      "Technical owner for consultants across 8+ business units, aligning each design with the CTO before build.",
      "2-4 concurrent projects, about 75-80% AI and automation on .NET, Azure and AWS.",
      "Deployed AI agents for marketing, and built authentication, encryption, audit logging and backups into systems holding financial data.",
    ],
  },
  {
    title: "Baher Al-Damasy Group",
    role: "Integration-first automation · 2022 - 2024",
    points: [
      "Layered automations and AI workflows onto existing HubSpot, CRM and ERP platforms.",
      "Ran infrastructure on OCI, AWS and Azure, codified with Terraform and OCI CLI.",
    ],
  },
  {
    title: "EQ4 Digital Communication",
    role: "Team lead, web and development · 2020 - 2022",
    points: [
      "Architected a multi-tenant marketplace where vendors rent storefronts.",
      "Scoped work from briefs, choosing WordPress or custom builds.",
    ],
  },
  {
    title: "Godlove Group, Hadithi Ya Africa",
    role: "Automation and CMS platforms · 2015 - 2020",
    points: [
      "Enquiry chatbots for a fixed-date launch, and CRM integration workflows.",
      "Custom WordPress themes, Adobe Experience Manager, Drupal, Shopify.",
    ],
  },
  {
    title: "BiznizFlowPilot",
    role: "Project · live multi-tenant ERP",
    points: [
      "FastAPI, PostgreSQL, Celery, Next.js. Event-driven workflows and tenant isolation enforced in CI.",
      "Role-scoped AI assistant with audited data access.",
    ],
  },
  {
    title: "AI Growth Platform",
    role: "Project · .NET 10 agent runtime",
    points: ["Schema-validated tool calls, step limits, and runs marked complete only after server re-checks."],
  },
  {
    title: "SEO-GEO Agent",
    role: "Project · approval-gated web agent",
    points: ["Rules decide, LLM words. Provider fallback and human approval before live writes."],
  },
];

const processSteps = [
  "Map the real operating pressure and the systems already in play.",
  "Draw the boundaries: tenant scope, permissions, data flow and approval points.",
  "Build a thin working path before widening the workflow.",
  "Instrument the system with logs, tests, backups and release checks.",
  "Hand over a system that the team can operate after launch.",
];

const roles = ["Owner", "Sales rep", "Intern"];
const requests = [
  "Show overdue invoices for my business",
  "Read payroll totals for this month",
  "Send a discount campaign",
  "Update a WordPress landing page",
  "Summarize inventory risk",
];

function formatStat(value: number, suffix: string, active: boolean) {
  if (!active) return `0${suffix}`;
  return `${value.toLocaleString()}${suffix}`;
}

export default function PortfolioClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hld");
  const [statsVisible, setStatsVisible] = useState(false);
  const [selectedNode, setSelectedNode] = useState("api");
  const [openAdr, setOpenAdr] = useState(0);
  const [role, setRole] = useState("Owner");
  const [request, setRequest] = useState("");
  const [demoLines, setDemoLines] = useState<string[]>([]);
  const [audit, setAudit] = useState<string[]>(["Nothing logged yet."]);
  const [jobText, setJobText] = useState("");
  const [matched, setMatched] = useState(false);
  const [openExperience, setOpenExperience] = useState<string | null>(null);

  useEffect(() => {
    const sections = navItems.map((item) => document.getElementById(item.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-25% 0px -60% 0px" },
    );
    sections.forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    window.setTimeout(() => setStatsVisible(true), 250);
    const targets = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (entry.target.id === "stats-row") setStatsVisible(true);
          }
        });
      },
      { threshold: 0.16 },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!request) return;
    const scenario = buildScenario(role, request);
    setDemoLines([]);
    setAudit([]);
    scenario.forEach((line, index) => {
      window.setTimeout(() => {
        setDemoLines((current) => [...current, line]);
        setAudit((current) => [...current, `${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} ${line}`]);
      }, 280 * (index + 1));
    });
  }, [role, request]);

  const cvResult = useMemo(() => scoreJob(jobText), [jobText]);
  const selected = diagramNodes.find((node) => node.id === selectedNode) ?? diagramNodes[2];

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--navy-950)] text-[var(--foreground)] selection:bg-[var(--accent)]/30">
      <div className="pointer-events-none fixed inset-0 blueprint-bg" />
      <div className="relative z-10 mx-auto max-w-[62rem] px-4 pb-20">
        <header className="sticky top-3 z-30 pt-3">
          <div className="mb-2 flex items-center gap-1 text-sm text-slate-300">
            <span>Lehakoe Thinane — Systems Designer & Architect</span>
            <span className="text-slate-500">⌄</span>
          </div>
          <nav className="panel rounded-[20px] bg-[rgba(9,28,49,0.82)] px-2 py-2 backdrop-blur-xl" aria-label="Primary">
            <div className="flex items-center justify-between gap-3">
              <a href="#contact" className="focus-orange flex items-center gap-2 rounded-full px-2 py-3 font-mono text-sm font-semibold text-[var(--muted)]">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#1a3848]">
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--green)]" />
                </span>
                <span className="hidden sm:inline">Available for new roles</span>
              </a>
              <div className="hidden items-center gap-6 md:flex">
                {navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`focus-orange font-mono text-xs font-bold tracking-[0.05em] transition-colors ${
                      activeSection === item.id ? "text-slate-100" : "text-[var(--muted)] hover:text-slate-200"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
              <button
                type="button"
                className="focus-orange rounded-full border border-[var(--line)] px-4 py-3 font-mono text-xs font-bold text-slate-200 md:hidden"
                onClick={() => setMenuOpen((current) => !current)}
              >
                Menu
              </button>
              <a
                href="mailto:lehakoe.thinane@gmail.com?subject=CV%20request"
                className="focus-orange rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-extrabold text-[var(--accent-dark)] shadow-[0_10px_35px_rgba(255,138,76,0.22)] transition-colors hover:bg-[#ffa06b]"
              >
                Request CV
              </a>
            </div>
            {menuOpen ? (
              <div className="mt-3 grid gap-2 border-t border-[var(--line)] pt-3 md:hidden">
                {navItems.map((item) => (
                  <a key={item.href} href={item.href} className="focus-orange rounded-full px-3 py-2 font-mono text-sm text-[var(--muted)]" onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </a>
                ))}
              </div>
            ) : null}
          </nav>
        </header>

        <section className="reveal pt-6">
          <div className="max-w-[45rem]">
            <p className="font-mono text-sm font-bold text-[var(--muted)]">Controlled boundaries.</p>
            <h1 className="mt-3 text-[clamp(2.65rem,5.2vw,4.7rem)] font-black leading-[0.95] tracking-normal text-slate-100">
              I design the system, then build it.
            </h1>
            <p className="mt-4 max-w-[42rem] text-base leading-7 text-[var(--muted)]">
              Lehakoe Thinane. Systems designer and architect, AI engineer. Ten years of shipping web and business systems, now focused on AI that stays inside controlled boundaries.
            </p>
            <p className="mt-3 font-mono text-sm text-[var(--dim)]">
              Johannesburg, South Africa · open to remote, hybrid and client-embedded work
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a className="focus-orange rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-extrabold text-[var(--accent-dark)]" href="#cv">Match me to your role</a>
            <a className="focus-orange rounded-full border border-[var(--line)] bg-[#0b1d31]/75 px-5 py-3 text-sm font-extrabold text-slate-300" href="https://app.mmnexus.co.za" target="_blank" rel="noopener noreferrer">See the live ERP</a>
            <a className="focus-orange rounded-full border border-[var(--line)] bg-[#0b1d31]/75 px-5 py-3 text-sm font-extrabold text-slate-300" href="mailto:lehakoe.thinane@gmail.com">Email me</a>
          </div>
        </section>

        <section id="stats-row" className="reveal mt-5 grid gap-3 md:grid-cols-4" aria-label="Portfolio statistics">
          {heroStats.map((stat) => (
            <article key={stat.label} className="panel min-h-[7rem] rounded-[20px] p-4">
              <p className="font-mono text-[2.5rem] font-black leading-none text-slate-100 md:text-[3rem]">
                {formatStat(stat.value, stat.suffix, statsVisible)}
              </p>
              <p className="mt-3 text-sm font-bold leading-6 text-[var(--muted)]">{stat.label}</p>
            </article>
          ))}
        </section>

        <ArchitectureDiagram selected={selected} selectedNode={selectedNode} onSelect={setSelectedNode} />

        <LiveDemo role={role} setRole={setRole} request={request} setRequest={setRequest} lines={demoLines} audit={audit} />

        <ComponentsTable />

        <section id="adr" className="reveal mt-16">
          <SectionTitle eyebrow="Decision records" title="The choices behind the diagram" copy="The choices behind the diagram, written the way I write them for clients." />
          <div className="mt-6 grid gap-3">
            {adrs.map((adr, index) => (
              <article key={adr.title} className="panel overflow-hidden rounded-[20px]">
                <button type="button" className="focus-orange flex w-full items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpenAdr(openAdr === index ? -1 : index)}>
                  <span className="text-lg font-bold text-slate-100">{adr.title}</span>
                  <span className="font-mono text-[var(--accent)]">{openAdr === index ? "−" : "+"}</span>
                </button>
                {openAdr === index ? (
                  <dl className="grid gap-4 border-t border-[var(--line)] px-5 py-5 text-sm leading-6 text-[var(--muted)] md:grid-cols-3">
                    <AdrTerm label="Context" value={adr.context} />
                    <AdrTerm label="Decision" value={adr.decision} />
                    <AdrTerm label="Trade-off" value={adr.tradeoff} />
                  </dl>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="reveal mt-16">
          <SectionTitle eyebrow="How I work" title="From first conversation to release" copy="The path every embedded project follows, from first conversation to release." />
          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {processSteps.map((step, index) => (
              <article key={step} className="panel rounded-[20px] p-4">
                <p className="font-mono text-sm font-black text-[var(--accent)]">0{index + 1}</p>
                <p className="mt-4 text-sm font-semibold leading-6 text-[var(--muted)]">{step}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="reveal mt-16">
          <SectionTitle eyebrow="Measured results" title="Outcomes from earlier client work" />
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {measuredResults.map((result) => (
              <article key={result.value} className="panel rounded-[20px] p-5">
                <p className="font-mono text-5xl font-black text-slate-100">{result.value}</p>
                <p className="mt-4 text-sm font-bold leading-6 text-[var(--muted)]">{result.label}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="cv" className="reveal mt-16">
          <SectionTitle eyebrow="Interactive CV" title="Paste a job description" copy="You get an honest match score, the evidence behind it, and the gaps." />
          <div className="mt-6 grid items-stretch gap-4 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="panel flex h-full flex-col rounded-[20px] p-5">
              <label htmlFor="job" className="font-mono text-sm font-bold text-[var(--muted)]">Job description</label>
              <textarea id="job" className="focus-orange mt-3 min-h-40 flex-1 w-full resize-y rounded-2xl border border-[var(--line)] bg-[#071421] p-4 text-sm leading-6 text-slate-100 placeholder:text-[var(--dim)]" placeholder="Paste a job description" value={jobText} onChange={(event) => setJobText(event.target.value)} />
              <button type="button" className="focus-orange mt-4 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-extrabold text-[var(--accent-dark)]" onClick={() => setMatched(true)}>
                Match me
              </button>
            </div>
            <div className="panel h-full rounded-[20px] p-5">
              <p className="font-mono text-sm font-bold text-[var(--muted)]">Match score</p>
              <div className="mt-4 h-4 rounded-full bg-[#071421]">
                <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-700" style={{ width: `${matched ? cvResult.score : 0}%` }} />
              </div>
              <p className="mt-4 font-mono text-4xl font-black text-slate-100">{matched ? cvResult.score : 0}%</p>
              <div className="mt-5 grid gap-4 text-sm leading-6 text-[var(--muted)] md:grid-cols-2">
                <div>
                  <p className="font-mono font-bold text-[var(--accent)]">Evidence</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    {(matched ? cvResult.evidence : ["Paste a role and run the matcher."]).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <p className="font-mono font-bold text-[var(--accent)]">Honest gaps</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5">
                    {(matched ? cvResult.gaps : ["Gaps appear after matching."]).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="relative mt-5 grid gap-3 before:absolute before:bottom-2 before:left-[1.125rem] before:top-2 before:hidden before:w-px before:bg-[var(--line)] md:before:block">
            {experience.map((entry) => (
              <article key={entry.title} className="relative pl-12">
                <span className="absolute left-[1.125rem] top-7 hidden h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-[var(--accent)] bg-[var(--navy-950)] shadow-[0_0_18px_rgba(255,138,76,0.48)] md:block" />
                <div className="panel rounded-[20px]">
                  <button
                    type="button"
                    aria-expanded={openExperience === entry.title}
                    className="focus-orange flex w-full items-center justify-between gap-4 px-5 py-5 text-left"
                    onClick={() => setOpenExperience((current) => (current === entry.title ? null : entry.title))}
                  >
                    <span className="text-lg font-bold text-slate-100">{entry.title}</span>
                    <span className="font-mono text-sm font-black text-[var(--accent)]">
                      {openExperience === entry.title ? "close" : "open"}
                    </span>
                  </button>

                  {openExperience === entry.title ? (
                    <div className="border-t border-[var(--line)] px-5 pb-5 pt-4">
                      <p className="font-mono text-xs font-bold leading-5 text-[var(--accent)]">{entry.role}</p>
                      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted)]">
                        {entry.points.map((point) => <li key={point}>{point}</li>)}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer id="contact" className="reveal mt-16 border-t border-[var(--line)] py-12">
          <h2 className="text-3xl font-black text-slate-100">Have a system that needs designing?</h2>
          <div className="mt-6 flex flex-wrap gap-4 font-mono text-sm font-bold text-[var(--muted)]">
            <a className="focus-orange hover:text-slate-100" href="mailto:lehakoe.thinane@gmail.com">lehakoe.thinane@gmail.com</a>
            <a className="focus-orange hover:text-slate-100" href="tel:+27812439693">+27 81 243 9693</a>
            <a className="focus-orange hover:text-slate-100" href="https://github.com/LehakoeThinane">GitHub</a>
            <a className="focus-orange hover:text-slate-100" href="https://linkedin.com/in/lehakoe-stanley-thinane-38b854188">LinkedIn</a>
          </div>
        </footer>
      </div>
    </main>
  );
}

function ArchitectureDiagram({ selected, selectedNode, onSelect }: { selected: (typeof diagramNodes)[number]; selectedNode: string; onSelect: (id: string) => void }) {
  const [eventStage, setEventStage] = useState(0);
  const [glowIndex, setGlowIndex] = useState(0);
  const glowNode = diagramNodes[glowIndex % diagramNodes.length]?.id;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setEventStage((current) => (current + 1) % eventStages.length);
    }, 1400);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setGlowIndex((current) => (current + 1) % diagramNodes.length);
    }, 900);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="hld" className="mt-5 overflow-hidden rounded-[20px] border border-[var(--line)] bg-[#0d2238]/90 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="flex flex-col gap-2 border-b border-[var(--line)] px-4 py-3 font-mono text-xs font-bold text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        <p>FIG. 1 — High-level design of BiznizFlowPilot, a live multi-tenant ERP</p>
        <p>Solid: request · Orange: event flow</p>
      </div>
      <div className="grid gap-3 px-4 py-3 font-mono text-xs font-bold text-[var(--muted)] md:grid-cols-[1fr_1.15fr] md:items-center">
        <p className="leading-5">{selected.text}</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {eventStages.map((stage, index) => (
            <span
              key={stage}
              className={`rounded-full border px-3 py-2 leading-4 transition-all duration-300 ${
                eventStage === index
                  ? "border-[var(--accent)] bg-[var(--accent)]/12 text-[var(--accent)] shadow-[0_0_18px_rgba(255,138,76,0.18)]"
                  : "border-[var(--line)] text-[var(--dim)]"
              }`}
            >
              {stage}
            </span>
          ))}
        </div>
      </div>
      <div className="overflow-hidden">
        <svg className="block h-auto w-full" viewBox="0 0 1000 540" role="img" aria-label="High-level design of BiznizFlowPilot">
          <defs>
            <marker id="arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4"><path d="M0,0 L8,4 L0,8 Z" fill="#8fa3bf" /></marker>
          </defs>
          <path d="M202 323 H220" stroke="#8fa3bf" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M386 323 H414" stroke="#8fa3bf" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M580 323 H622" stroke="#8fa3bf" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M788 323 H816" stroke="#8fa3bf" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M497 366 V426" stroke="#8fa3bf" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M705 366 V426" stroke="#8fa3bf" strokeWidth="3" markerEnd="url(#arrow)" />
          <path d="M788 469 H816" stroke="#8fa3bf" strokeWidth="3" markerEnd="url(#arrow)" />
          <path id="apiToOutbox" d="M497 280 V171 H622" stroke="#ff8a4c" strokeDasharray="7 10" strokeWidth="3" fill="none" />
          <path id="outboxToWorkers" d="M788 171 H816" stroke="#ff8a4c" strokeDasharray="7 10" strokeWidth="3" fill="none" />
          <path d="M614 163 L630 171 L614 179 Z" fill="#ff8a4c" />
          <path d="M808 163 L824 171 L808 179 Z" fill="#ff8a4c" />
          <circle cx="497" cy="280" r="5" fill="#ff8a4c" />
          <circle cx="622" cy="171" r="5" fill="#ff8a4c" />
          <circle cx="816" cy="171" r="5" fill="#ff8a4c" />
          <circle r="5.5" fill="#ff8a4c">
            <animateMotion dur="4.2s" repeatCount="indefinite" rotate="0">
              <mpath href="#apiToOutbox" />
            </animateMotion>
          </circle>
          <circle r="5.5" fill="#ff8a4c">
            <animateMotion dur="4.2s" repeatCount="indefinite" begin="1.9s" rotate="0">
              <mpath href="#outboxToWorkers" />
            </animateMotion>
          </circle>
          <text x="534" y="160" fill="#8fa3bf" fontFamily="var(--font-geist-mono)" fontSize="12" fontWeight="800">events, same txn</text>
          <text x="715" y="394" fill="#8fa3bf" fontFamily="var(--font-geist-mono)" fontSize="12" fontWeight="800">writes need approval</text>
          {diagramNodes.map((node) => (
            <g key={node.id} role="button" tabIndex={0} aria-label={`${node.title}: ${node.sub}`} onClick={() => onSelect(node.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect(node.id); }} className="cursor-pointer outline-none">
              <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="12" fill={node.id === selectedNode ? "#49342b" : "#0b1b2c"} stroke={node.id === selectedNode ? "#ff8a4c" : glowNode === node.id ? "#ff8a4c" : "#8fa3bf"} strokeWidth={node.id === selectedNode || glowNode === node.id ? 3 : 2} strokeDasharray={node.dashed ? "8 7" : undefined} filter={node.id === selectedNode || glowNode === node.id ? "drop-shadow(0 0 14px rgba(255,138,76,.75))" : undefined} />
              <text x={node.x + 14} y={node.y + 27} fill="#eef5ff" fontFamily="var(--font-geist-mono)" fontSize="15" fontWeight="900">{node.title}</text>
              <text x={node.x + 14} y={node.y + 50} fill="#8fa3bf" fontFamily="var(--font-geist-mono)" fontSize="11" fontWeight="800">{node.sub}</text>
              <text x={node.x + 14} y={node.y + 72} fill="#ff8a4c" fontFamily="var(--font-geist-mono)" fontSize="9.5" fontWeight="900">click me for more explanation</text>
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
}

function LiveDemo({ role, setRole, request, setRequest, lines, audit }: { role: string; setRole: (role: string) => void; request: string; setRequest: (request: string) => void; lines: string[]; audit: string[] }) {
  return (
    <section id="demo" className="reveal mt-10">
      <SectionTitle eyebrow="Live demo: AI with boundaries" title="Every action is checked, logged and gated" copy="A simulated version of the assistant inside BiznizFlowPilot. Pick who is asking, then pick a request. Every action is checked, logged and gated." />
      <div className="panel mt-6 grid gap-4 rounded-[20px] p-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-sm font-bold text-[var(--muted)]">Asking as</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.map((item) => <button key={item} type="button" className={`focus-orange rounded-full px-4 py-2 font-mono text-sm font-bold ${role === item ? "bg-[var(--accent)] text-[var(--accent-dark)]" : "border border-[var(--line)] text-[var(--muted)]"}`} onClick={() => setRole(item)}>{item}</button>)}
          </div>
          <p className="mt-6 font-mono text-sm font-bold text-[var(--muted)]">Request</p>
          <div className="mt-3 grid gap-2">
            {requests.map((item) => <button key={item} type="button" className={`focus-orange rounded-2xl border px-4 py-3 text-left text-sm font-bold ${request === item ? "border-[var(--accent)] text-slate-100" : "border-[var(--line)] text-[var(--muted)]"}`} onClick={() => setRequest(item)}>{item}</button>)}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--line)] bg-[#071421] p-4">
          <p className="font-mono text-sm font-bold text-[var(--muted)]">Assistant output</p>
          <div className="mt-4 min-h-40 space-y-2 font-mono text-sm leading-6 text-slate-300">
            {lines.length ? lines.map((line) => <p key={line} className={line.includes("blocked") ? "text-[var(--red)]" : line.includes("approval") ? "text-[var(--accent)]" : "text-[var(--green)]"}>{line}</p>) : <p className="text-[var(--muted)]">Pick a request to watch the assistant work. Then switch role and see what changes.</p>}
          </div>
          <p className="mt-6 font-mono text-sm font-bold text-slate-100">Audit trail</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 font-mono text-xs leading-5 text-[var(--muted)]">
            {audit.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          </ol>
        </div>
      </div>
    </section>
  );
}

function ComponentsTable() {
  return (
    <section id="systems" className="reveal mt-16">
      <SectionTitle eyebrow="Components" title="Systems I have designed and built" copy="Each one is a different answer to the same question: where do the boundaries go?" />
      <div className="panel mt-6 hidden overflow-hidden rounded-[20px] md:block">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="font-mono text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
            <tr>{["Component", "Purpose", "Boundary I designed", "Stack"].map((head) => <th key={head} className="border-b border-[var(--line)] px-4 py-4">{head}</th>)}</tr>
          </thead>
          <tbody className="text-[var(--muted)]">
            {systems.map((system) => (
              <tr key={system.component} className="border-b border-[var(--line)] last:border-b-0">
                <td className="px-4 py-5 align-top"><a className="focus-orange font-bold text-slate-100 hover:text-[var(--accent)]" href={system.link}>{system.component}</a><span className="mt-2 block w-fit rounded-full bg-[var(--accent)]/15 px-2 py-1 font-mono text-xs font-bold text-[var(--accent)]">{system.status}</span></td>
                <td className="px-4 py-5 align-top leading-6">{system.purpose}</td>
                <td className="px-4 py-5 align-top leading-6">{system.boundary}</td>
                <td className="px-4 py-5 align-top font-mono text-xs leading-6">{system.stack}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 grid gap-3 md:hidden">
        {systems.map((system) => <article key={system.component} className="panel rounded-[20px] p-5"><h3 className="text-lg font-bold text-slate-100">{system.component}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{system.purpose}</p><p className="mt-3 font-mono text-xs text-[var(--accent)]">{system.stack}</p></article>)}
      </div>
    </section>
  );
}

function SectionTitle({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <div className="max-w-2xl"><p className="font-mono text-sm font-bold uppercase tracking-[0.18em] text-[var(--accent)]">{eyebrow}</p><h2 className="mt-3 text-3xl font-black text-slate-100 md:text-4xl">{title}</h2>{copy ? <p className="mt-3 leading-7 text-[var(--muted)]">{copy}</p> : null}</div>;
}

function AdrTerm({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{label}</dt><dd className="mt-2 text-[var(--muted)]">{value}</dd></div>;
}

function buildScenario(role: string, request: string) {
  const denied = role === "Intern" && request.includes("payroll");
  const approval = request.includes("Send") || request.includes("Update");
  return [
    `permission check: ${denied ? "blocked" : "allowed"} for ${role}`,
    "tenant scope: current business only",
    denied ? "query blocked: payroll data is outside this role" : "query: repository layer with audited access",
    approval ? "human approval required before live write" : denied ? "result: denied and logged" : "result: safe read returned",
  ];
}

function scoreJob(text: string) {
  const lower = text.toLowerCase();
  const terms = ["ai", "automation", "architecture", "system", "systems", "erp", "fastapi", ".net", "azure", "aws", "postgresql", "next.js", "wordpress", "crm", "security"];
  const hits = terms.filter((term) => lower.includes(term));
  const score = Math.min(96, Math.max(42, 48 + hits.length * 4));
  const evidence = [
    "Technical owner across 8+ business units at Tax Consulting South Africa.",
    "BiznizFlowPilot: FastAPI, PostgreSQL, Celery, Next.js with tenant isolation enforced in CI.",
    "AI Growth Platform: schema-validated tool calls, step limits and server re-checks.",
  ];
  const gaps = hits.includes("mobile") ? ["The content does not show native mobile app delivery."] : ["Role-specific domain depth would need confirmation from the job description."];
  return { score, evidence, gaps };
}
