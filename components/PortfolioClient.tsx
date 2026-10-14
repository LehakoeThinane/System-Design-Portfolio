"use client";

import Image from "next/image";
import { Fragment, useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import CvMatcher from "@/components/CvMatcher";
import portrait from "@/public/images/lehakoe-thinane.jpg";

const shell = "mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12";

const navItems = [
  { label: "Architecture", id: "hld" },
  { label: "Demo", id: "demo" },
  { label: "Systems", id: "systems" },
  { label: "Projects", id: "projects" },
  { label: "Decisions", id: "adr" },
  { label: "Experience", id: "experience" },
  { label: "Role match", id: "cv" },
];

const heroRoles = ["systems designer", "architect", "AI engineer", "embedded technical owner"];

const heroStats = [
  { value: "10+", label: "years shipping web and business systems" },
  { value: "94", label: "PostgreSQL tables designed in one live ERP" },
  { value: "1,380+", label: "automated tests guarding it" },
  { value: "8+", label: "business units served as embedded owner" },
];

const layerColor = {
  client: "#7dd3fc",
  core: "#ff8a4c",
  ai: "#a78bfa",
  data: "#34d399",
  gate: "#fbbf24",
} as const;

const diagramNodes = [
  { id: "clients", title: "Clients", sub: "Next.js · Electron", layer: "client", color: layerColor.client, x: 36, y: 280, w: 166, h: 86, text: "The client layer presents web and desktop surfaces for people using the ERP.", guarantee: "Never talks to data directly; every action goes through the API." },
  { id: "edge", title: "Edge", sub: "Caddy · Cloudflare", layer: "edge", color: layerColor.client, x: 220, y: 280, w: 166, h: 86, text: "The edge handles routing, TLS and platform boundaries before requests reach application code.", guarantee: "TLS and routing are settled before application code runs." },
  { id: "api", title: "API", sub: "modular monolith", layer: "core", color: layerColor.core, x: 414, y: 280, w: 166, h: 86, text: "The API is the control point: business changes, tenant scope and event persistence happen here.", guarantee: "Every query is tenant-scoped; a CI guard fails the build on queries outside the repository layer." },
  { id: "assistant", title: "AI assistant", sub: "runs as the user", layer: "ai", color: layerColor.ai, x: 622, y: 280, w: 166, h: 86, text: "The assistant uses the asking user's role and business scope. It cannot read more than that user can read.", guarantee: "Tools run with the asking user's permissions, and every data access is logged." },
  { id: "models", title: "Model providers", sub: "Groq · Claude · Ollama", layer: "llm", color: layerColor.ai, x: 816, y: 280, w: 166, h: 86, text: "Model providers help with language, but rules and permissions decide what actions are allowed.", guarantee: "Models word things; they never decide what is allowed." },
  { id: "outbox", title: "Event outbox", sub: "SKIP LOCKED claims", layer: "async", color: layerColor.core, x: 622, y: 128, w: 166, h: 86, text: "Events are written with the business change, then claimed safely by workers for retries and delivery.", guarantee: "Written in the same transaction as the change, so an event can't be lost." },
  { id: "workers", title: "Workers", sub: "Celery · Redis", layer: "async", color: layerColor.core, x: 816, y: 128, w: 166, h: 86, text: "Workers process event flow outside the request path while keeping duplicate actions harmless.", guarantee: "Stable action IDs act as idempotency keys; retries use capped backoff." },
  { id: "db", title: "PostgreSQL 17", sub: "tenants · audit log", layer: "data", color: layerColor.data, x: 414, y: 426, w: 166, h: 86, text: "PostgreSQL stores operational data, tenant boundaries and audit history for the live ERP.", guarantee: "Tenant data and the audit log live together, behind the repository layer." },
  { id: "approval", title: "Human approval", sub: "live writes gated", layer: "gate", color: layerColor.gate, x: 622, y: 426, w: 166, h: 86, dashed: true, text: "Risky writes are paused for a person to approve before they touch live systems.", guarantee: "Nothing risky reaches a live system without a person signing off." },
  { id: "live", title: "Live systems", sub: "ERP · web · webhooks", layer: "target", color: layerColor.gate, x: 816, y: 426, w: 166, h: 86, text: "Approved changes land in real operational systems, websites and webhooks.", guarantee: "Only approved, logged changes land here." },
];

type EdgeKind = "request" | "event" | "data" | "gate";

const edgeColor: Record<EdgeKind, string> = {
  request: layerColor.client,
  event: layerColor.core,
  data: layerColor.data,
  gate: layerColor.gate,
};

const diagramEdges: { from: string; to: string; d: string; kind: EdgeKind }[] = [
  { from: "clients", to: "edge", d: "M202 323 H218", kind: "request" },
  { from: "edge", to: "api", d: "M386 323 H412", kind: "request" },
  { from: "api", to: "assistant", d: "M580 323 H620", kind: "request" },
  { from: "assistant", to: "models", d: "M788 323 H814", kind: "request" },
  { from: "api", to: "db", d: "M497 366 V424", kind: "data" },
  { from: "api", to: "outbox", d: "M497 280 V171 H620", kind: "event" },
  { from: "outbox", to: "workers", d: "M788 171 H814", kind: "event" },
  { from: "assistant", to: "approval", d: "M705 366 V424", kind: "gate" },
  { from: "approval", to: "live", d: "M788 469 H814", kind: "gate" },
];

// Long routes the glowing packets travel along; nodes are drawn on top, so packets pass "through" them.
const packetRoutes = [
  { d: "M202 323 H816", color: layerColor.client, dur: "3.4s", begin: "0s" },
  { d: "M497 280 V171 H816", color: layerColor.core, dur: "3s", begin: "0.9s" },
  { d: "M705 366 V469 H816", color: layerColor.gate, dur: "3.8s", begin: "1.7s" },
  { d: "M497 366 V426", color: layerColor.data, dur: "1.8s", begin: "0.4s" },
];

const diagramLanes = [
  { y: 116, h: 112, label: "Async · event outbox" },
  { y: 258, h: 128, label: "Request path" },
  { y: 404, h: 124, label: "Data & control" },
];

const eventStages = [
  "The API commits the business change and its event in one transaction.",
  "The event outbox holds the durable work item.",
  "Workers claim it with SKIP LOCKED and process it, retrying safely.",
];

const systems = [
  {
    component: "BiznizFlowPilot",
    status: "Live",
    link: "https://app.mmnexus.co.za",
    linkLabel: "app.mmnexus.co.za",
    purpose: "ERP for South African SMEs: inventory, sales, invoicing with VAT, finance, HR/payroll and an AI assistant.",
    boundary: "Every query is tenant-scoped, and a CI guard fails the build on queries outside the repository layer.",
    note: "Role-scoped AI assistant with audited data access; event-driven workflows through a transactional outbox. Also the CRM behind two of my client builds.",
    stack: ["FastAPI", "PostgreSQL", "Celery", "Next.js", "Azure"],
  },
  {
    component: "AI Growth Platform",
    status: "MVP",
    link: "https://github.com/LehakoeThinane/ai-growth-platform",
    linkLabel: "ai-growth-platform",
    purpose: "Agent runtime for growth planning and incident triage.",
    boundary: "One validated tool call per step. Write permission comes from the operator, never the model.",
    note: "Step limits, and runs are marked complete only after server re-checks.",
    stack: [".NET 10", "EF Core", "OpenAI function calling"],
  },
  {
    component: "SEO-GEO Agent",
    status: "MVP",
    link: "https://github.com/LehakoeThinane/V1.0-seo-geo-agent-clean",
    linkLabel: "seo-geo-agent",
    purpose: "Crawls a site, finds SEO issues, and applies approved fixes to WordPress.",
    boundary: "Rules decide what is safe to apply. The LLM only improves wording.",
    note: "Provider fallback across OpenAI, Groq and Ollama, and human approval before live writes.",
    stack: ["FastAPI", "WordPress REST API", "OpenAI", "Groq", "Ollama"],
  },
];

type ProjectCategory = "Platforms" | "Mobile" | "Fintech" | "Client builds";

const projectCategories: ProjectCategory[] = ["Platforms", "Mobile", "Fintech", "Client builds"];

const sideProjects: {
  name: string;
  category: ProjectCategory;
  status: string;
  summary: string;
  boundary: string;
  stack: string[];
  repos: { label: string; href: string }[];
}[] = [
  {
    name: "Plinth",
    category: "Platforms",
    status: "In build",
    summary: "An enterprise knowledge exchange: organisations, hubs, SSO sign-in, consent notices, custom domains and learner progress.",
    boundary: "Every access decision is tenant-scoped and checked against authoritative version counters, with PostgreSQL row-level security underneath. Message recipients are re-authorised at delivery.",
    stack: ["Node.js", "PostgreSQL 17", "Redis", "Terraform", "GitHub Actions"],
    repos: [{ label: "Repo", href: "https://github.com/LehakoeThinane/Plinth" }],
  },
  {
    name: "Shapers Church Platform",
    category: "Platforms",
    status: "In build",
    summary: "One backend for a Johannesburg church, serving a staff admin portal, an iOS and Android member app, and a static public website.",
    boundary: "Modules talk only through contracts, and code asks for permissions, never roles. Architecture tests fail the build otherwise.",
    stack: [".NET 10", "React", "Expo", "Astro", "PostgreSQL", "Azure"],
    repos: [{ label: "Repo", href: "https://github.com/LehakoeThinane/Shapers-Church" }],
  },
  {
    name: "Shapers Church member app",
    category: "Mobile",
    status: "In build",
    summary: "Cross-platform iOS and Android app for church members: sermons, events and QR tickets, kids check-in, prayer, serving rosters and an inbox, with SMS sign-in codes and push notifications.",
    boundary: "Screens use a typed API client generated from the backend's OpenAPI document, credentials go in the device's secure store, and colours come only from shared theme tokens, which CI enforces.",
    stack: ["Expo", "React Native", "Expo Router", "Reanimated", "Liquid Glass", "Push notifications"],
    repos: [{ label: "Repo", href: "https://github.com/LehakoeThinane/Shapers-Church" }],
  },
  {
    name: "MiXiT",
    category: "Mobile",
    status: "In build",
    summary: "A social matching app: phone sign-in, profiles with interests and intents, a scored discover feed, realtime chat with read receipts, group rooms and premium boosts.",
    boundary: "Six backend modules (auth, profiles, matching, messaging, rooms, payments) behind one API. Refresh tokens rotate on every use and are revoked at logout.",
    stack: ["Expo", "React Native", "Fastify", "Prisma", "PostgreSQL", "Redis", "Socket.io"],
    repos: [{ label: "Repo", href: "https://github.com/LehakoeThinane/MiXiT" }],
  },
  {
    name: "ARCHITEKT · Brick by Brick",
    category: "Mobile",
    status: "Live",
    summary: "An installable, offline-first quiz app for learning systems design, architecture, DevOps and AI. It tracks correctness, speed and topic mastery, then brings weak areas back with spaced repetition.",
    boundary: "Mastery logic lives in a pure domain layer: a six-state machine and a weighted selector (weakness 50%, time since seen 30%, difficulty 20%). Offline answers sync idempotently, and the server recalculates mastery.",
    stack: ["React PWA", "IndexedDB", "Service Workers", "FastAPI", "PostgreSQL", "Vercel"],
    repos: [
      { label: "Live app", href: "https://brick-by-brick-quiz.vercel.app" },
      { label: "Repo", href: "https://github.com/LehakoeThinane/Brick-By-Brick-Quiz" },
    ],
  },
  {
    name: "LendFlow",
    category: "Fintech",
    status: "Staging",
    summary: "Loan origination SaaS: multi-step applications, KYC, document analysis, affordability and fraud checks, decisioning and a manual review queue.",
    boundary: "Decisions are deterministic and audited. Chatbots and AI explanations are deliberately secondary to underwriting and compliance.",
    stack: ["Python", "FastAPI", "Alembic", "PostgreSQL", "Render"],
    repos: [{ label: "Repo", href: "https://github.com/LehakoeThinane/LendFlow-SaaS" }],
  },
  {
    name: "PaySlip Checker",
    category: "Fintech",
    status: "MVP",
    summary: "Upload a PDF payslip and get gross pay, PAYE, UIF and net pay checked against deterministic rules: pass, warning or fail.",
    boundary: "No OCR and no AI fraud claims. Every verdict is traceable to a rule, and uploaded files are deleted after extraction.",
    stack: ["Next.js 16", "React 19", "TypeScript", "pdf.js"],
    repos: [{ label: "Repo", href: "https://github.com/LehakoeThinane/PaySlip-Checker" }],
  },
  {
    name: "SA Tax Calculator",
    category: "Fintech",
    status: "Shipped",
    summary: "South African PAYE, UIF, medical tax credits and take-home pay, as a Next.js web app and a WordPress plugin, both with PDF summaries.",
    boundary: "The tax engine is kept separate from the UI, so the app, the plugin and the payslip checker can share it.",
    stack: ["Next.js", "TypeScript", "jsPDF", "WordPress", "PHP"],
    repos: [
      { label: "Web app", href: "https://github.com/LehakoeThinane/tax-calculator-application" },
      { label: "Plugin", href: "https://github.com/LehakoeThinane/Income-Tax-Calculator" },
    ],
  },
  {
    name: "Mohlakoana Attorneys",
    category: "Client builds",
    status: "In build",
    summary: "Website and client portal for a law firm, with one FastAPI backend as the only choke point for both front doors.",
    boundary: "The database holding ID numbers and matter details has no outgoing connection. A single sync adapter forwards only what the CRM needs to BiznizFlowPilot.",
    stack: ["FastAPI", "MySQL", "TypeScript", "BiznizFlowPilot"],
    repos: [{ label: "Repo", href: "https://github.com/LehakoeThinane/Mohlakoana-Attorneys-Website" }],
  },
  {
    name: "Zoya · BE HEARD",
    category: "Client builds",
    status: "Client site",
    summary: "Static Astro pages up front, with a small serverless Bridge API to BiznizFlowPilot, PayFast payments and Turnstile bot protection.",
    boundary: "Only the Bridge talks to the CRM and payments. Every push is typechecked, built and audited with Lighthouse CI.",
    stack: ["Astro", "Tailwind", "PayFast", "Turnstile", "GitHub Actions"],
    repos: [{ label: "Repo", href: "https://github.com/LehakoeThinane/Zoya-Website" }],
  },
  {
    name: "Prime Vest",
    category: "Client builds",
    status: "Client build",
    summary: "Investment platform: an admin-editable public site, and a JWT-authenticated investor dashboard with KYC status, portfolio performance and Paystack payments.",
    boundary: "Investor data sits behind a JWT-authenticated API, and the public site's content is edited by admins, not hard-coded.",
    stack: ["Django REST", "Next.js", "PostgreSQL", "Paystack", "Docker"],
    repos: [{ label: "Repo", href: "https://github.com/LehakoeThinane/Prime-Vesting-Website" }],
  },
];

const cvHref = "/cv/Lehakoe_Thinane_CV.pdf";
const cvFileName = "Lehakoe_Thinane_CV_Systems_Designer_Architect_AI_Engineer.pdf";

const stackFile = [
  { key: "languages", values: ["Python", "TypeScript", "C#", "PHP"] },
  { key: "backend", values: ["FastAPI", ".NET 10", "EF Core", "Django REST", "Fastify", "Celery"] },
  { key: "data", values: ["PostgreSQL 17", "MySQL", "Redis"] },
  { key: "frontend", values: ["Next.js", "React", "Astro", "Expo", "Electron"] },
  { key: "ai", values: ["OpenAI", "Claude", "Groq", "Ollama"] },
  { key: "cloud", values: ["Azure", "AWS", "OCI", "Cloudflare"] },
  { key: "infra", values: ["Terraform", "Bicep", "Docker", "GitHub Actions", "Caddy"] },
  { key: "platforms", values: ["WordPress", "HubSpot", "Drupal", "Shopify", "AEM"] },
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

const processSteps = [
  { title: "Map the pressure", text: "Find the real operating pressure and the systems already in play." },
  { title: "Draw the boundaries", text: "Tenant scope, permissions, data flow and approval points." },
  { title: "Build a thin path", text: "One working path end to end before widening the workflow." },
  { title: "Instrument it", text: "Logs, tests, backups and release checks." },
  { title: "Hand it over", text: "A system the team can operate after launch." },
];

const measuredResults = [
  { value: "25%", label: "better order-processing efficiency, from a React product configurator" },
  { value: "30%", label: "more e-commerce conversions, from cart-abandonment automation and a redesigned checkout" },
  { value: "90+", label: "average Google PageSpeed score across 10+ production client sites" },
];

// **text** marks the facts a skimming reader should catch.
const experience = [
  {
    org: "Tax Consulting South Africa",
    role: "Embedded solution design and AI engineering",
    period: "2024 — now",
    points: [
      "Technical owner for consultants across **8+ business units**, aligning each design with the CTO before build.",
      "**2-4 concurrent projects**, about **75-80% AI and automation** on .NET, Azure and AWS.",
      "Deployed AI agents for marketing, and built **authentication, encryption, audit logging and backups** into systems holding financial data.",
    ],
  },
  {
    org: "Baher Al-Damasy Group",
    role: "Integration-first automation",
    period: "2022 — 2024",
    points: [
      "Layered automations and AI workflows onto existing **HubSpot, CRM and ERP** platforms.",
      "Ran infrastructure on **OCI, AWS and Azure**, codified with **Terraform** and OCI CLI.",
    ],
  },
  {
    org: "EQ4 Digital Communication",
    role: "Team lead, web and development",
    period: "2020 — 2022",
    points: [
      "Architected a **multi-tenant marketplace** where vendors rent storefronts.",
      "Scoped work from briefs, choosing WordPress or custom builds.",
    ],
  },
  {
    org: "Godlove Group, Hadithi Ya Africa",
    role: "Automation and CMS platforms",
    period: "2015 — 2020",
    points: [
      "Enquiry chatbots for a **fixed-date launch**, and CRM integration workflows.",
      "Custom WordPress themes, Adobe Experience Manager, Drupal, Shopify.",
    ],
  },
];

const roles = ["Owner", "Sales rep", "Intern"];
const requests = [
  "Show overdue invoices for my business",
  "Read payroll totals for this month",
  "Send a discount campaign",
  "Update a WordPress landing page",
  "Summarize inventory risk",
];

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function timeStamp() {
  return new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function PortfolioClient() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [selectedNode, setSelectedNode] = useState("api");
  const [openAdr, setOpenAdr] = useState(0);
  const [role, setRole] = useState("Owner");
  const [request, setRequest] = useState("");
  const [demoLines, setDemoLines] = useState<string[]>([]);
  const [audit, setAudit] = useState<string[]>([]);
  const demoTimers = useRef<number[]>([]);

  useEffect(() => {
    const sections = navItems.map((item) => document.getElementById(item.id)).filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    sections.forEach((section) => section && observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timers = demoTimers.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  // Each run cancels the previous one, so fast clicking never interleaves two scenarios.
  // The audit trail is append-only, like a real one.
  function runDemo(nextRole: string, nextRequest: string) {
    setRole(nextRole);
    setRequest(nextRequest);
    demoTimers.current.forEach((timer) => window.clearTimeout(timer));
    demoTimers.current = [];
    if (!nextRequest) return;
    setDemoLines([]);
    buildScenario(nextRole, nextRequest).forEach((line, index) => {
      const timer = window.setTimeout(() => {
        setDemoLines((current) => [...current, line]);
        setAudit((current) => [...current, `${timeStamp()}  ${nextRole} · ${line}`].slice(-12));
      }, 260 * (index + 1));
      demoTimers.current.push(timer);
    });
  }

  const selected = diagramNodes.find((node) => node.id === selectedNode) ?? diagramNodes[2];

  return (
    <main id="top" className="min-h-screen overflow-x-clip">
      <div className={`${shell} hidden items-center gap-5 border-b border-[#ccc] pb-4 print:flex`}>
        <Image src={portrait} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-full object-cover object-[50%_35%]" />
        <div>
          <p className="text-2xl font-semibold">Lehakoe Thinane — Systems Designer & Architect</p>
          <p className="mt-1 text-xs">Johannesburg, South Africa · lehakoe.thinane@gmail.com · +27 81 243 9693 · github.com/LehakoeThinane · linkedin.com/in/lehakoe-stanley-thinane-38b854188</p>
        </div>
      </div>

      <header className="no-print sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
        <div className={`${shell} flex h-16 items-center justify-between gap-6`}>
          <a href="#top" className="focus-ring flex items-center gap-3 rounded-md">
            <Image src={portrait} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover object-[50%_35%]" />
            <span className="text-sm font-semibold text-[var(--text)]">Lehakoe Thinane</span>
          </a>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={activeSection === item.id ? "true" : undefined}
                className={`focus-ring rounded-md px-3 py-2 text-sm transition-colors ${
                  activeSection === item.id ? "bg-[var(--surface-strong)] text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a className="btn-primary focus-ring hidden py-2 sm:inline-flex" href={cvHref} download={cvFileName}>
              Download CV
            </a>
            <button
              type="button"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="btn-secondary focus-ring py-2 lg:hidden"
              onClick={() => setMenuOpen((current) => !current)}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
        {menuOpen ? (
          <nav id="mobile-nav" className="border-t border-[var(--border)] lg:hidden" aria-label="Primary">
            <div className={`${shell} grid gap-1 py-3`}>
              {navItems.map((item) => (
                <a key={item.id} href={`#${item.id}`} className="focus-ring rounded-md px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--surface-strong)] hover:text-[var(--text)]" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              ))}
              <a className="btn-primary focus-ring mt-2 sm:hidden" href={cvHref} download={cvFileName} onClick={() => setMenuOpen(false)}>
                Download CV
              </a>
            </div>
          </nav>
        ) : null}
      </header>

      <section className="relative">
        <div className="hero-grid pointer-events-none absolute inset-0" />
        <div className={`${shell} relative grid gap-12 pb-14 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center lg:gap-16 lg:pb-20 lg:pt-24 print:block print:py-6`}>
          <div>
            <p className="no-print inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--green)] opacity-50" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--green)]" />
              </span>
              Available for new roles
            </p>
            <h1 className="mt-6 text-[clamp(2.5rem,5.4vw,4.75rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-[var(--text)]">
              I design the system, then build it.
            </h1>
            <p className="no-print mt-6 font-mono text-sm text-[var(--dim)]">
              <span className="text-[var(--accent)]">$</span> whoami
              <span className="ml-3 text-[var(--text)]"><RotatingRole /></span>
            </p>
            <p className="mt-6 max-w-[40rem] text-[17px] leading-8 text-[var(--muted)]">
              Systems designer, architect and AI engineer. Ten years of shipping web and business systems, now focused on AI that stays inside controlled boundaries: assistants that run with the user&apos;s permissions, agents that ask before they write, and event flows that don&apos;t lose work.
            </p>
            <div className="no-print mt-8 flex flex-wrap gap-3">
              <a className="btn-primary focus-ring" href="#cv">Match me to your role</a>
              <a className="btn-secondary focus-ring" href="https://app.mmnexus.co.za" target="_blank" rel="noopener noreferrer">See the live ERP ↗</a>
              <a className="btn-secondary focus-ring" href="mailto:lehakoe.thinane@gmail.com">Email me</a>
            </div>
          </div>
          <ProfileCard />
        </div>

        <div className={shell}>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--border)] lg:grid-cols-4 print:grid-cols-4" aria-label="Portfolio statistics">
            {heroStats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-2 bg-[var(--bg)] p-5 sm:p-6">
                <dt className="order-2 text-sm leading-6 text-[var(--muted)]">{stat.label}</dt>
                <dd className="order-1 text-3xl font-semibold tracking-tight tabular-nums text-[var(--text)] sm:text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <Section id="hld" index="01" label="Architecture" title="One live system, drawn end to end" intro="The high-level design of BiznizFlowPilot, a multi-tenant ERP in production. Select any component to see the job it does and the boundary it holds." wide className="no-print">
        <ArchitectureDiagram selected={selected} selectedNode={selectedNode} onSelect={setSelectedNode} />
      </Section>

      <Section id="demo" index="02" label="Live demo" title="AI that's checked, logged and gated" intro="A simulated version of the assistant inside BiznizFlowPilot. Pick who is asking and what they want, then switch roles and watch the same request get a different answer." className="no-print">
        <LiveDemo role={role} request={request} onRun={runDemo} lines={demoLines} audit={audit} />
      </Section>

      <Section id="systems" index="03" label="Systems" title="Systems I've designed and built" intro="Each one is a different answer to the same question: where do the boundaries go?">
        <div className="grid gap-4">
          {systems.map((system) => <SystemCard key={system.component} system={system} />)}
          <StackFile />
        </div>
      </Section>

      <Section id="projects" index="04" label="Side projects" title="Built on my own time" intro="Platforms, fintech tools and client builds outside my day jobs. Every one is a public repo, and each draws its boundary somewhere different.">
        <SideProjects />
      </Section>

      <Section id="adr" index="05" label="Decisions" title="The choices behind the diagram" intro="Written the way I write them for clients: the context, the decision, and what it costs.">
        <div className="card divide-y divide-[var(--border)] overflow-hidden">
          {adrs.map((adr, index) => {
            const open = openAdr === index;
            return (
              <article key={adr.title}>
                <h3>
                  <button type="button" aria-expanded={open} className="focus-ring flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-[var(--surface)] sm:px-6" onClick={() => setOpenAdr(open ? -1 : index)}>
                    <span className="hidden font-mono text-xs text-[var(--dim)] sm:inline">ADR-00{index + 1}</span>
                    <span className="flex-1 text-base font-semibold text-[var(--text)] sm:text-lg">{adr.title}</span>
                    <span aria-hidden="true" className={`no-print text-xl leading-none text-[var(--dim)] transition-transform ${open ? "rotate-45" : ""}`}>+</span>
                  </button>
                </h3>
                <dl className={`gap-6 px-5 pb-6 text-sm leading-6 sm:px-6 md:grid-cols-3 ${open ? "grid" : "hidden print:grid"}`}>
                  <AdrTerm label="Context" value={adr.context} />
                  <AdrTerm label="Decision" value={adr.decision} />
                  <AdrTerm label="Trade-off" value={adr.tradeoff} />
                </dl>
              </article>
            );
          })}
        </div>
      </Section>

      <Section index="06" label="Process" title="From first conversation to release" intro="The path every embedded project follows." wide className="no-print">
        <ol className="grid gap-px overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-5">
          {processSteps.map((step, index) => (
            <li key={step.title} className="bg-[var(--bg)] p-5 sm:p-6">
              <p className="font-mono text-xs text-[var(--accent)]">0{index + 1}</p>
              <p className="mt-6 font-semibold text-[var(--text)]">{step.title}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="experience" index="07" label="Experience" title="Where I've done it" intro="Ten years across agencies, groups and embedded client work, with measured results along the way.">
        <dl className="grid gap-px overflow-hidden rounded-[14px] border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3 print:grid-cols-3">
          {measuredResults.map((result) => (
            <div key={result.value} className="flex flex-col gap-2 bg-[var(--bg)] p-5 sm:p-6">
              <dt className="order-2 text-sm leading-6 text-[var(--muted)]">{result.label}</dt>
              <dd className="order-1 text-3xl font-semibold tracking-tight tabular-nums text-[var(--text)]">{result.value}</dd>
            </div>
          ))}
        </dl>
        <ol className="mt-10">
          {experience.map((entry) => (
            <li key={entry.org} className="grid gap-2 border-t border-[var(--border)] py-7 first:border-t-0 first:pt-0 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8">
              <p className="pt-1 font-mono text-xs text-[var(--dim)]">{entry.period}</p>
              <div>
                <h3 className="text-lg font-semibold text-[var(--text)]">{entry.org}</h3>
                <p className="mt-0.5 text-sm text-[var(--accent)]">{entry.role}</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] leading-7 text-[var(--muted)] marker:text-[var(--dim)]">
                  {entry.points.map((point) => <li key={point}><Highlight text={point} /></li>)}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="cv" index="08" label="Role match" title="Paste a job description" intro="You get an honest coverage score, the requirement line each match came from, and the gaps I can't back up. No AI guesswork: it only credits what this page can prove." wide className="no-print">
        <CvMatcher />
      </Section>

      <footer id="contact" className="border-t border-[var(--border)]">
        <div className={`${shell} grid gap-12 py-20 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-end lg:py-28 print:py-6`}>
          <div>
            <p className="eyebrow no-print">09 / Contact</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-[var(--text)] sm:text-5xl">Have a system that needs designing?</h2>
            <p className="mt-5 max-w-xl text-[17px] leading-8 text-[var(--muted)]">
              I work best embedded with a team: close to the people who feel the problem, and accountable for the system after launch.
            </p>
            <div className="no-print mt-8 flex flex-wrap gap-3">
              <a className="btn-primary focus-ring" href="mailto:lehakoe.thinane@gmail.com">Email me</a>
              <a className="btn-secondary focus-ring" href={cvHref} download={cvFileName}>Download CV (PDF)</a>
            </div>
          </div>
          <dl className="card divide-y divide-[var(--border)] text-sm">
            {[
              { label: "Email", value: "lehakoe.thinane@gmail.com", href: "mailto:lehakoe.thinane@gmail.com" },
              { label: "Phone", value: "+27 81 243 9693", href: "tel:+27812439693" },
              { label: "GitHub", value: "LehakoeThinane", href: "https://github.com/LehakoeThinane" },
              { label: "LinkedIn", value: "lehakoe-stanley-thinane", href: "https://linkedin.com/in/lehakoe-stanley-thinane-38b854188" },
              { label: "Based", value: "Johannesburg, South Africa" },
            ].map((row) => (
              <div key={row.label} className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 px-5 py-4">
                <dt className="text-[var(--dim)]">{row.label}</dt>
                <dd className="truncate text-[var(--text)]">
                  {row.href ? <a className="focus-ring rounded hover:text-[var(--accent)]" href={row.href}>{row.value}</a> : row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="no-print border-t border-[var(--border)]">
          <div className={`${shell} flex flex-wrap items-center justify-between gap-3 py-6 text-xs text-[var(--dim)]`}>
            <p suppressHydrationWarning>© {new Date().getFullYear()} Lehakoe Thinane</p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
              All systems operational
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Section({ id, index, label, title, intro, wide = false, className = "", children }: { id?: string; index: string; label: string; title: string; intro?: string; wide?: boolean; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`border-t border-[var(--border)] py-20 lg:py-28 ${className}`}>
      <div className={shell}>
        <div className={wide ? "grid gap-10 lg:gap-12" : "grid gap-10 xl:grid-cols-[19rem_minmax(0,1fr)] xl:gap-16"}>
          <div className={wide ? "grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end lg:gap-16" : "xl:sticky xl:top-28 xl:self-start"}>
            <div>
              <p className="eyebrow no-print">{index} / {label}</p>
              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.025em] text-[var(--text)] sm:text-4xl">{title}</h2>
            </div>
            {intro ? <p className={`max-w-xl text-[15px] leading-7 text-[var(--muted)] ${wide ? "" : "mt-4"}`}>{intro}</p> : null}
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </section>
  );
}

function subscribeToClock(onChange: () => void) {
  const timer = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(timer);
}

function johannesburgTime() {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Johannesburg" }).format(new Date());
}

// Client-only snapshot, so the static HTML never carries a stale build-time clock.
function useJohannesburgTime() {
  return useSyncExternalStore(subscribeToClock, johannesburgTime, () => null);
}

function ProfileCard() {
  const time = useJohannesburgTime();
  const rows = [
    { label: "Focus", value: "AI inside controlled boundaries" },
    { label: "Current", value: "Tax Consulting SA · since 2024" },
    { label: "Based", value: time ? `Johannesburg · ${time} local (UTC+2)` : "Johannesburg (UTC+2)" },
    { label: "Open to", value: "Remote, hybrid, client-embedded" },
  ];

  return (
    <aside className="card no-print overflow-hidden">
      <div className="relative aspect-[4/3]">
        <Image
          src={portrait}
          alt="Portrait of Lehakoe Thinane"
          fill
          sizes="(min-width: 1024px) 38vw, 100vw"
          placeholder="blur"
          loading="eager"
          fetchPriority="high"
          className="object-cover object-[50%_32%]"
        />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#070c15] via-[#070c15]/70 to-transparent" />
        <div className="absolute inset-x-5 bottom-4">
          <p className="text-lg font-semibold text-white">Lehakoe Thinane</p>
          <p className="text-sm text-white/75">Systems Designer & Architect</p>
        </div>
      </div>
      <dl className="divide-y divide-[var(--border)] text-sm">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-4 px-5 py-3">
            <dt className="text-[var(--dim)]">{row.label}</dt>
            <dd className="text-[var(--text)]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

function RotatingRole() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!prefersReducedMotion()) setIndex((current) => (current + 1) % heroRoles.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <span className="sr-only">{heroRoles.join(", ")}</span>
      <span aria-hidden="true">
        <span key={index} className="role-swap inline-block">{heroRoles[index]}</span>
        <span className="caret ml-0.5 text-[var(--accent)]">▍</span>
      </span>
    </>
  );
}

function Highlight({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, index) =>
        part.startsWith("**") ? (
          <strong key={index} className="font-semibold text-[var(--text)]">{part.slice(2, -2)}</strong>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}

type DiagramNode = (typeof diagramNodes)[number];
type DiagramProps = { selected: DiagramNode; selectedNode: string; onSelect: (id: string) => void };

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

// Server snapshot is "reduced", so animated packets only ever appear after hydration.
function useReducedMotion() {
  return useSyncExternalStore(subscribeToReducedMotion, () => window.matchMedia(reducedMotionQuery).matches, () => true);
}

function ArchitectureDiagram({ selected, selectedNode, onSelect }: DiagramProps) {
  const [eventStage, setEventStage] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!prefersReducedMotion()) setEventStage((current) => (current + 1) % eventStages.length);
    }, 1800);
    return () => window.clearInterval(timer);
  }, []);

  function openZoom() {
    setZoomed(true);
    dialogRef.current?.showModal();
  }

  return (
    <div className="diagram-shell">
      <div className="relative overflow-hidden rounded-[19px] bg-[#060b14]">
        <div aria-hidden="true" className="diagram-blob left-[-8%] top-[-20%] h-[26rem] w-[26rem] bg-[#ff8a4c]/30" />
        <div aria-hidden="true" className="diagram-blob bottom-[-25%] right-[-6%] h-[30rem] w-[30rem] bg-[#3b82f6]/25 [animation-delay:-9s]" />
        <div aria-hidden="true" className="diagram-blob left-[40%] top-[30%] h-[18rem] w-[18rem] bg-[#a78bfa]/15 [animation-delay:-4s]" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.07] bg-white/[0.02] px-5 py-4 backdrop-blur-md sm:px-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--green)]/30 bg-[var(--green)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--green)]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--green)] opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--green)]" />
                </span>
                Live in production
              </span>
              <p className="font-mono text-xs text-[var(--muted)]">FIG. 1 · BiznizFlowPilot control plane</p>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {(Object.keys(edgeColor) as EdgeKind[]).map((kind) => (
                <span key={kind} className="flex items-center gap-2 text-xs capitalize text-[var(--dim)]">
                  <span className="h-0.5 w-4 rounded-full" style={{ background: edgeColor[kind], boxShadow: `0 0 8px ${edgeColor[kind]}` }} />
                  {kind}
                </span>
              ))}
              <button type="button" className="glass-button focus-ring" onClick={openZoom}>⤢ Expand</button>
            </div>
          </div>

          <div className="grid gap-5 p-3 sm:p-5 lg:grid-cols-[minmax(0,1fr)_21rem] lg:p-6">
            <div className="min-w-0">
              <button type="button" className="block w-full cursor-zoom-in md:hidden" onClick={openZoom} aria-label="Expand the architecture diagram">
                <DiagramSvg selectedNode={selectedNode} />
              </button>
              <div className="hidden md:block">
                <DiagramSvg selectedNode={selectedNode} onSelect={onSelect} />
              </div>
              <p className="mt-3 hidden px-1 font-mono text-[11px] text-[var(--dim)] md:block">Click a component, or tab to it and press Enter. Its connections light up.</p>
            <div className="glass-card mt-5 p-5">
              <p className="eyebrow">Event flow</p>
              <ol className="mt-4 grid gap-5 md:grid-cols-3">
                {eventStages.map((stage, index) => {
                  const active = eventStage === index;
                  return (
                    <li key={stage} className="flex gap-3">
                      <span
                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[11px] transition-all duration-300 ${
                          active ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)] shadow-[0_0_16px_rgba(255,138,76,0.7)]" : "border-white/15 text-[var(--dim)]"
                        }`}
                      >
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm leading-6 transition-colors duration-300 ${active ? "text-[var(--text)]" : "text-[var(--dim)]"}`}>{stage}</p>
                        <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-white/[0.06]">
                          {active ? <span key={`${index}-${eventStage}`} className="stage-progress block h-full rounded-full bg-[var(--accent)]" /> : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
            </div>

            <aside className="grid content-start gap-4">
              <NodeDetails selected={selected} onSelect={onSelect} />
            </aside>
          </div>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label="Architecture diagram, expanded"
        className="m-auto max-h-[94vh] w-[min(96vw,84rem)] flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#070c15]/95 p-0 text-[var(--text)] shadow-[0_40px_120px_-30px_rgba(255,138,76,0.35)] backdrop:bg-black/75 backdrop:backdrop-blur-md open:flex"
        onClose={() => setZoomed(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-5 py-3">
          <p className="font-mono text-xs text-[var(--muted)]">FIG. 1 · expanded<span className="md:hidden"> · scroll sideways</span></p>
          <button type="button" className="glass-button focus-ring" onClick={() => dialogRef.current?.close()}>Close ✕</button>
        </div>
        <div className="overflow-auto p-4">
          {zoomed ? <DiagramSvg className="min-w-[56rem]" selectedNode={selectedNode} onSelect={onSelect} /> : null}
        </div>
        <div className="border-t border-white/[0.07] p-4">
          <NodeDetails selected={selected} onSelect={onSelect} />
        </div>
      </dialog>
    </div>
  );
}

function NodeDetails({ selected, onSelect }: { selected: DiagramNode; onSelect: (id: string) => void }) {
  const connections = diagramEdges
    .filter((edge) => edge.from === selected.id || edge.to === selected.id)
    .map((edge) => {
      const otherId = edge.from === selected.id ? edge.to : edge.from;
      return { node: diagramNodes.find((node) => node.id === otherId)!, kind: edge.kind, outgoing: edge.from === selected.id };
    });

  return (
    <div className="glass-card relative overflow-hidden p-5">
      <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-40 blur-3xl transition-colors duration-500" style={{ background: selected.color }} />
      <div key={selected.id} className="detail-swap relative">
        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--dim)]">
          <span className="h-2 w-2 rounded-full" style={{ background: selected.color, boxShadow: `0 0 10px ${selected.color}` }} />
          {selected.layer}
        </p>
        <p className="mt-3 text-xl font-semibold tracking-tight text-[var(--text)]">{selected.title}</p>
        <p className="font-mono text-xs text-[var(--dim)]">{selected.sub}</p>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{selected.text}</p>
        <div className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em]" style={{ color: selected.color }}>Guarantee</p>
          <p className="mt-1 text-sm leading-6 text-[var(--text)]">{selected.guarantee}</p>
        </div>
        <p className="eyebrow mt-5">Connected to</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {connections.map(({ node, kind, outgoing }) => (
            <button
              key={`${node.id}-${kind}`}
              type="button"
              className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs text-[var(--muted)] transition-colors hover:border-white/25 hover:text-[var(--text)]"
              onClick={() => onSelect(node.id)}
            >
              <span style={{ color: edgeColor[kind] }}>{outgoing ? "→" : "←"}</span>
              {node.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Without onSelect the diagram is a static picture (used as the tap target on phones).
function DiagramSvg({ selectedNode, onSelect, className = "" }: { selectedNode: string; onSelect?: (id: string) => void; className?: string }) {
  // Two copies can be on the page at once, so every referenced id must be unique.
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const reducedMotion = useReducedMotion();
  const interactive = Boolean(onSelect);
  const ids = { glow: `${uid}-glow`, blur: `${uid}-blur`, glass: `${uid}-glass`, grid: `${uid}-grid` };

  return (
    <svg className={`block h-auto w-full ${className}`} viewBox="16 104 984 432" role={interactive ? "group" : "img"} aria-label="High-level design of BiznizFlowPilot">
      <defs>
        <filter id={ids.glow} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={ids.blur} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <linearGradient id={ids.glass} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.02" />
        </linearGradient>
        <pattern id={ids.grid} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.8" fill="#94aac8" fillOpacity="0.12" />
        </pattern>
        {(Object.keys(edgeColor) as EdgeKind[]).map((kind) => (
          <marker key={kind} id={`${uid}-arrow-${kind}`} markerHeight="7" markerWidth="7" orient="auto" refX="6" refY="3.5">
            <path d="M0,0 L7,3.5 L0,7 Z" fill={edgeColor[kind]} />
          </marker>
        ))}
      </defs>

      <rect x="16" y="104" width="984" height="432" fill={`url(#${ids.grid})`} />

      {diagramLanes.map((lane) => (
        <g key={lane.label}>
          <rect x="24" y={lane.y} width="968" height={lane.h} rx="14" fill="#94aac8" fillOpacity="0.025" stroke="#94aac8" strokeOpacity="0.07" />
          <text x="40" y={lane.y + 17} fill="#5d6d83" fontFamily="var(--font-geist-mono)" fontSize="9.5" letterSpacing="1.4">{lane.label.toUpperCase()}</text>
        </g>
      ))}

      {diagramEdges.map((edge, index) => {
        const linked = edge.from === selectedNode || edge.to === selectedNode;
        const color = edgeColor[edge.kind];
        return (
          <g key={edge.d} className="transition-opacity duration-300" opacity={linked ? 1 : 0.5}>
            <path d={edge.d} pathLength={1} className="edge-draw" style={{ animationDelay: `${250 + index * 70}ms` }} stroke={color} strokeOpacity="0.3" strokeWidth={linked ? 2.5 : 1.5} fill="none" markerEnd={`url(#${uid}-arrow-${edge.kind})`} />
            <path d={edge.d} className={`edge-flow edge-flow-${edge.kind}`} stroke={color} strokeWidth={linked ? 2.5 : 1.5} strokeLinecap="round" fill="none" filter={linked ? `url(#${ids.glow})` : undefined} />
          </g>
        );
      })}

      {reducedMotion
        ? null
        : packetRoutes.map((route) => (
            <g key={route.d} filter={`url(#${ids.glow})`}>
              <circle r="9" fill={route.color} fillOpacity="0.18" />
              <circle r="3.5" fill={route.color} />
              <animateMotion dur={route.dur} begin={route.begin} repeatCount="indefinite" path={route.d} />
            </g>
          ))}

      <text x="510" y="226" fill="#8696ab" fontFamily="var(--font-geist-mono)" fontSize="10.5">event + change,</text>
      <text x="510" y="241" fill="#8696ab" fontFamily="var(--font-geist-mono)" fontSize="10.5">one transaction</text>
      <text x="715" y="398" fill="#8696ab" fontFamily="var(--font-geist-mono)" fontSize="10.5">writes need approval</text>

      {diagramNodes.map((node, index) => {
        const isSelected = node.id === selectedNode;
        return (
          <g
            key={node.id}
            role={interactive ? "button" : undefined}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `${node.title}: ${node.sub}` : undefined}
            aria-pressed={interactive ? isSelected : undefined}
            onClick={onSelect ? () => onSelect(node.id) : undefined}
            onKeyDown={onSelect ? (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelect(node.id); } } : undefined}
            className={`node-enter ${interactive ? "diagram-node cursor-pointer outline-none" : ""}`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            {isSelected ? <rect className="node-glow" x={node.x} y={node.y} width={node.w} height={node.h} rx="14" fill="none" stroke={node.color} strokeWidth="10" filter={`url(#${ids.blur})`} /> : null}
            <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="14" fill="#0a111e" fillOpacity="0.78" />
            <rect
              className="node-body"
              x={node.x}
              y={node.y}
              width={node.w}
              height={node.h}
              rx="14"
              fill={`url(#${ids.glass})`}
              stroke={isSelected ? node.color : "#94aac8"}
              strokeOpacity={isSelected ? 1 : 0.22}
              strokeWidth={isSelected ? 1.75 : 1}
              strokeDasharray={node.dashed ? "6 5" : undefined}
            />
            {isSelected ? <rect x={node.x} y={node.y} width={node.w} height={node.h} rx="14" fill={node.color} fillOpacity="0.08" /> : null}
            <path d={`M${node.x + 14} ${node.y + 0.75} H${node.x + node.w - 14}`} stroke="#ffffff" strokeOpacity="0.16" />
            <circle cx={node.x + 19} cy={node.y + 21} r="3.5" fill={node.color} filter={isSelected ? `url(#${ids.glow})` : undefined} />
            <text x={node.x + 29} y={node.y + 24.5} fill="#74849a" fontFamily="var(--font-geist-mono)" fontSize="9.5" letterSpacing="1.2">{node.layer.toUpperCase()}</text>
            <text x={node.x + 15} y={node.y + 52} fill="#eef4fb" fontFamily="var(--font-geist-sans)" fontSize="15.5" fontWeight="600">{node.title}</text>
            <text x={node.x + 15} y={node.y + 71} fill="#8696ab" fontFamily="var(--font-geist-mono)" fontSize="10.5">{node.sub}</text>
          </g>
        );
      })}
    </svg>
  );
}

function LiveDemo({ role, request, onRun, lines, audit }: { role: string; request: string; onRun: (role: string, request: string) => void; lines: string[]; audit: string[] }) {
  return (
    <div className="card grid overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="p-5 sm:p-6 lg:border-r lg:border-[var(--border)]">
        <p className="eyebrow">Asking as</p>
        <div className="mt-3 inline-flex rounded-lg border border-[var(--border)] p-1" role="group" aria-label="Role">
          {roles.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={role === item}
              className={`focus-ring rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${role === item ? "bg-[var(--surface-strong)] text-[var(--text)]" : "text-[var(--muted)] hover:text-[var(--text)]"}`}
              onClick={() => onRun(item, request)}
            >
              {item}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--dim)]">Scope: {roleScope[role]}</p>
        <p className="eyebrow mt-8">Request</p>
        <div className="mt-3 grid gap-2">
          {requests.map((item) => {
            const isWrite = item.startsWith("Send") || item.startsWith("Update");
            return (
              <button
                key={item}
                type="button"
                aria-pressed={request === item}
                className={`focus-ring flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                  request === item ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                }`}
                onClick={() => onRun(role, item)}
              >
                {item}
                <span className="shrink-0 font-mono text-[11px] text-[var(--dim)]">{isWrite ? "write" : "read"}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="border-t border-[var(--border)] bg-[var(--bg)] p-5 font-mono text-[13px] sm:p-6 lg:border-t-0">
        <p className="eyebrow">Assistant output</p>
        <div className="mt-4 min-h-[9.5rem] space-y-2 leading-6" aria-live="polite">
          {lines.length ? (
            lines.map((line) => {
              const tone = line.includes("blocked") || line.includes("denied") ? "block" : line.includes("approval") ? "approve" : "allow";
              return (
                <p key={line} className="flex gap-3">
                  <span aria-hidden="true" className={tone === "block" ? "text-[var(--red)]" : tone === "approve" ? "text-[var(--accent)]" : "text-[var(--green)]"}>
                    {tone === "block" ? "✕" : tone === "approve" ? "◐" : "✓"}
                  </span>
                  <span className="text-[var(--text)]">{line}</span>
                </p>
              );
            })
          ) : (
            <p className="text-[var(--dim)]">Pick a request to watch the assistant work.</p>
          )}
        </div>
        <p className="eyebrow mt-8 border-t border-[var(--border)] pt-5">Audit trail · append-only</p>
        {audit.length ? (
          <ol className="mt-3 space-y-1.5 text-xs leading-5 text-[var(--muted)]">
            {audit.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
          </ol>
        ) : (
          <p className="mt-3 text-xs text-[var(--dim)]">Nothing logged yet.</p>
        )}
      </div>
    </div>
  );
}

function SystemCard({ system }: { system: (typeof systems)[number] }) {
  return (
    <article className="card grid gap-5 p-5 sm:p-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8">
      <div>
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-[var(--text)]">{system.component}</h3>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium ${system.status === "Live" ? "border-[var(--green)]/40 text-[var(--green)]" : "border-[var(--border-strong)] text-[var(--muted)]"}`}>
            {system.status === "Live" ? <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)]" /> : null}
            {system.status}
          </span>
        </div>
        <a className="focus-ring mt-2 inline-block rounded text-sm text-[var(--muted)] hover:text-[var(--accent)]" href={system.link} target="_blank" rel="noopener noreferrer">{system.linkLabel} ↗</a>
        <ul className="mt-4 flex flex-wrap gap-1.5">
          {system.stack.map((item) => <li key={item} className="rounded-md border border-[var(--border)] px-2 py-0.5 font-mono text-[11px] text-[var(--muted)]">{item}</li>)}
        </ul>
      </div>
      <div className="grid gap-4 text-[15px] leading-7">
        <p className="text-[var(--text)]">{system.purpose}</p>
        <div className="border-l-2 border-[var(--accent)] pl-4">
          <p className="eyebrow">Boundary I designed</p>
          <p className="mt-1 text-[var(--muted)]">{system.boundary}</p>
        </div>
        <p className="text-sm leading-6 text-[var(--dim)]">{system.note}</p>
      </div>
    </article>
  );
}

function SideProjects() {
  const [filter, setFilter] = useState<ProjectCategory | "All">("All");
  const visible = filter === "All" ? sideProjects : sideProjects.filter((project) => project.category === filter);

  return (
    <div>
      <div className="no-print flex flex-wrap gap-2" role="group" aria-label="Filter projects">
        {(["All", ...projectCategories] as const).map((category) => {
          const count = category === "All" ? sideProjects.length : sideProjects.filter((project) => project.category === category).length;
          const active = filter === category;
          return (
            <button
              key={category}
              type="button"
              aria-pressed={active}
              className={`focus-ring inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                active ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--text)]" : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
              }`}
              onClick={() => setFilter(category)}
            >
              {category}
              <span className="font-mono text-[11px] text-[var(--dim)]">{count}</span>
            </button>
          );
        })}
      </div>
      <ul className="mt-6 grid gap-4 md:grid-cols-2 print:grid-cols-1">
        {visible.map((project) => (
          <li key={project.name} className="project-card card flex flex-col p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--dim)]">{project.category}</p>
                <h3 className="mt-1.5 text-lg font-semibold text-[var(--text)]">{project.name}</h3>
              </div>
              <span className="shrink-0 rounded-full border border-[var(--border-strong)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted)]">{project.status}</span>
            </div>
            <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">{project.summary}</p>
            <div className="mt-4 border-l-2 border-[var(--accent)] pl-4">
              <p className="eyebrow">Boundary</p>
              <p className="mt-1 text-sm leading-6 text-[var(--text)]">{project.boundary}</p>
            </div>
            <div className="mt-auto pt-5">
              <ul className="flex flex-wrap gap-1.5">
                {project.stack.map((item) => <li key={item} className="rounded-md border border-[var(--border)] px-2 py-0.5 font-mono text-[11px] text-[var(--muted)]">{item}</li>)}
              </ul>
              <div className="no-print mt-4 flex flex-wrap gap-4 border-t border-[var(--border)] pt-4">
                {project.repos.map((repo) => (
                  <a key={repo.href} className="focus-ring rounded text-sm font-medium text-[var(--text)] transition-colors hover:text-[var(--accent)]" href={repo.href} target="_blank" rel="noopener noreferrer">
                    {repo.label} ↗
                  </a>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StackFile() {
  return (
    <div className="card overflow-hidden">
      <div className="no-print flex items-center gap-2 border-b border-[var(--border)] px-5 py-3">
        <span className="font-mono text-xs text-[var(--muted)]">stack.yaml</span>
      </div>
      <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-7 sm:px-6">
        {stackFile.map((row) => (
          <div key={row.key} className="whitespace-pre-wrap">
            <span className="text-[var(--accent)]">{row.key}</span>
            <span className="text-[var(--dim)]">:{" ".repeat(11 - row.key.length)}[</span>
            {row.values.map((value, index) => (
              <Fragment key={value}>
                <span className="text-[var(--text)]">{value}</span>
                {index < row.values.length - 1 ? <span className="text-[var(--dim)]">, </span> : null}
              </Fragment>
            ))}
            <span className="text-[var(--dim)]">]</span>
          </div>
        ))}
      </pre>
    </div>
  );
}

function AdrTerm({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 text-[var(--muted)]">{value}</dd>
    </div>
  );
}

type Decision = "allow" | "approve" | "block";

// Rows follow `requests`, columns follow `roles`: Owner, Sales rep, Intern.
const policy: Decision[][] = [
  ["allow", "allow", "allow"],
  ["allow", "block", "block"],
  ["approve", "approve", "block"],
  ["approve", "block", "block"],
  ["allow", "allow", "allow"],
];

const roleScope: Record<string, string> = {
  Owner: "whole business",
  "Sales rep": "own customer accounts",
  Intern: "read-only, amounts masked",
};

function buildScenario(role: string, request: string) {
  const decision = policy[requests.indexOf(request)]?.[roles.indexOf(role)] ?? "block";
  const isWrite = request.startsWith("Send") || request.startsWith("Update");
  return [
    `permission check: ${decision === "block" ? "blocked" : "allowed"} for ${role}`,
    `tenant scope: current business · ${roleScope[role]}`,
    decision === "block"
      ? `query blocked: ${isWrite ? "live writes are" : "this data is"} outside the ${role} role`
      : isWrite ? "draft prepared with audited access, nothing sent yet" : "query: repository layer with audited access",
    decision === "approve" ? "human approval required before live write" : decision === "block" ? "result: denied and logged" : "result: safe read returned",
  ];
}
